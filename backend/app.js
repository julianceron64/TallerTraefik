require("dotenv").config();
const express = require("express");
const neo4j = require("neo4j-driver");

const app = express();

// Conexión a Neo4j con variables del .env
// 👇 aquí es clave usar el nombre del servicio ("neo4j") porque estás en Docker
const driver = neo4j.driver(
  process.env.NEO4J_URI || "bolt://neo4j:7687",
  neo4j.auth.basic(process.env.NEO4J_USERNAME, process.env.NEO4J_PASSWORD)
);

// Middleware JSON
app.use(express.json());

/**
 * GET /records
 * Devuelve todos los records sin límite
 */
app.get("/records", async (req, res) => {
  const session = driver.session();
  try {
    const result = await session.run(`MATCH (r:Record) RETURN r`);
    const records = result.records.map(record => record.get("r").properties);

    res.json({
      total: records.length,
      data: records
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  } finally {
    await session.close();
  }
});

/**
 * POST /records
 * Inserta un record con datos aleatorios/quemados
 */
app.post("/records", async (req, res) => {
  const session = driver.session();
  try {
    // Datos simulados
    const iso_code = ["CO", "MX", "US", "BR", "AR"][Math.floor(Math.random() * 5)];
    const year = 2000 + Math.floor(Math.random() * 25); // 2000–2024
    const population = Math.floor(Math.random() * 50_000_000) + 1_000_000; // 1M–50M
    const total_ghg = parseFloat((Math.random() * 1000).toFixed(2)); // 0–1000

    const result = await session.run(
      `
      CREATE (r:Record {
        iso_code: $iso_code,
        year: $year,
        population: $population,
        total_ghg: $total_ghg
      })
      RETURN r
      `,
      { iso_code, year, population, total_ghg }
    );

    const record = result.records[0].get("r").properties;

    res.json({
      message: "✅ Record insertado en Neo4j",
      data: record
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  } finally {
    await session.close();
  }
});

/**
 * GET /countries
 * Devuelve todos los países sin límite
 */
app.get("/countries", async (req, res) => {
  const session = driver.session();
  try {
    const result = await session.run(`MATCH (c:Country) RETURN c`);
    const countries = result.records.map(record => record.get("c").properties);

    res.json({
      total: countries.length,
      data: countries
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  } finally {
    await session.close();
  }
});

// Puerto desde .env
const PORT = process.env.EXPRESS_PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
