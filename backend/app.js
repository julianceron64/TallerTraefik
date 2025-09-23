require("dotenv").config();
const express = require("express");
const neo4j = require("neo4j-driver");
const os = require("os");

const app = express();

// Conexión a Neo4j con variables del .env
const driver = neo4j.driver(
  process.env.NEO4J_URI,
  neo4j.auth.basic(process.env.NEO4J_USERNAME, process.env.NEO4J_PASSWORD)
);

// Middleware JSON
app.use(express.json());

// GET /records
app.get("/records", async (req, res) => {
  const session = driver.session();
  try {
    const result = await session.run(`MATCH (r:Record) RETURN r`);
    const records = result.records.map(r => r.get("r").properties);
    res.json({ total: records.length, data: records });
  } catch (error) {
    res.status(500).json({ error: error.message });
  } finally {
    await session.close();
  }
});

// POST /records
app.post("/records", async (req, res) => {
  const session = driver.session();
  try {
    const iso_code = ["CO", "MX", "US", "BR", "AR"][Math.floor(Math.random() * 5)];
    const year = 2000 + Math.floor(Math.random() * 25);
    const population = Math.floor(Math.random() * 50_000_000) + 1_000_000;
    const total_ghg = parseFloat((Math.random() * 1000).toFixed(2));

    const result = await session.run(
      `CREATE (r:Record {iso_code:$iso_code,year:$year,population:$population,total_ghg:$total_ghg}) RETURN r`,
      { iso_code, year, population, total_ghg }
    );

    const record = result.records[0].get("r").properties;
    res.json({ message: "✅ Record insertado", data: record });
  } catch (error) {
    res.status(500).json({ error: error.message });
  } finally {
    await session.close();
  }
});

// GET /countries
app.get("/countries", async (req, res) => {
  const session = driver.session();
  try {
    const result = await session.run(`MATCH (c:Country) RETURN c`);
    const countries = result.records.map(r => r.get("c").properties);
    res.json({ total: countries.length, data: countries });
  } catch (error) {
    res.status(500).json({ error: error.message });
  } finally {
    await session.close();
  }
});

// Health con verificación de Neo4j
app.get("/health", async (req, res) => {
  let dbStatus = "unknown";
  const session = driver.session();
  try {
    await session.run("RETURN 1");
    dbStatus = "connected";
    res.status(200).json({
      status: "ok",
      instance: os.hostname(),
      database: dbStatus
    });
  } catch (error) {
    dbStatus = "error: " + error.message;
    res.status(500).json({
      status: "fail",
      instance: os.hostname(),
      database: dbStatus
    });
  } finally {
    await session.close();
  }
});

// Whoami (útil para probar balanceo de carga con Traefik)
app.get("/whoami", (req, res) => {
  res.json({ instance: os.hostname() });
});

// Puerto
const PORT = process.env.EXPRESS_PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
