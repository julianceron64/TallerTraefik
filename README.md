# TraefikTaller

## Integrantes

Julian Camilo Cerón Patiño - 202221232

Maria Jose Espinosa Cañon - 202222251

## Diagrama 

![Diagram](https://github.com/julianceron64/tallerTraefik/blob/main/Capturas/diagrama.png?raw=true)

El diagrama representa cómo funciona el proyecto. El usuario se conecta primero a Traefik, que es como una puerta de entrada que decide a dónde enviar cada petición. Si el usuario entra por api.localhost, Traefik reparte las solicitudes entre dos copias de la API, de manera que no todo el trabajo caiga en una sola. Estas APIs, a su vez, se comunican con la base de datos Neo4j, que está protegida y solo puede usarse dentro del sistema. Por otro lado, cuando el usuario entra por ops.localhost, accede al panel de Traefik, que pide usuario y contraseña y permite ver cómo están funcionando los servicios y el reparto de las peticiones

## Lista de hosts

-api.localhost: para acceder al servicio

-ops.localhost: para acceder al dashboard de traefik

## Comprobaciones de resultados 

**API en api.localhost responde /health**

![health](https://github.com/julianceron64/tallerTraefik/blob/main/Capturas/health.png?raw=true)

**Dashboard accesible solo en ops.localhost/dashboard/ y con
auth.**
![Auth](https://github.com/julianceron64/tallerTraefik/blob/main/Capturas/auth.png?raw=true)

Al entrar en ops.localhost/dashboard/ aparece un inicio de sesión. Solo con usuario y contraseña correctos se puede acceder al panel.

![Dashboard](https://github.com/julianceron64/tallerTraefik/blob/main/Capturas/dashboard.png?raw=true)

**Servicios y routers visibles en el dashboard.**

![services](https://github.com/julianceron64/tallerTraefik/blob/main/Capturas/services.png?raw=true)

Se pueden observar los 2 servicios registrados y su correcta conexión

**Rate-limit aplicado y verificado**
![Rate limit](https://github.com/julianceron64/tallerTraefik/blob/main/Capturas/ratelimit.png?raw=true)

Cuando se hacen muchas peticiones seguidas a la API, algunas empiezan a ser rechazadas con un error 429. Esto demuestra que el límite de peticiones está funcionando.

**Balanceo entre 2 réplicas evidenciado**
![Balanceo](https://github.com/julianceron64/tallerTraefik/blob/main/Capturas/balanceo.png?raw=true)
Al consultar varias veces el endpoint /whoami, se observa que la respuesta cambia entre dos instancias diferentes, lo que prueba que el tráfico se está repartiendo de manera equilibrada

## Reflexión

**¿Qué aporta Traefik frente a mapear puertos directamente?**
Traefik centraliza las conexiones  y los accesos en un solo punto, haciendo que no tengamos que recordar puertos sino entrar con nombres faciles de recordar
como ops.localhost, además de esto proporciona una mejora en seguridad y balancear el trafico de los servicios

**¿Qué middlewares usarían en producción y por qué?**

RateLimit: para evitar que un usuario o atacante haga muchas peticiones en poco tiempo y sobrecargue el sistema.

Auth: para proteger paneles de administración o rutas sensibles.

StripPrefix: para que la aplicación reciba las URLs limpias

**Riesgos de dejar el dashboard “abierto” y cómo mitigarlos.**

El dashboard muestra información sensible e importante sobre la arquitectura del sistema, por lo que dejarlo abierto podría permitir no solo que 
cualquiera vea esta información, sino posibles ataques
Para mitigar estos riesgos se usan auths y restricciones a redes especificas, asegurandose que solo usuarios autorizados puedan entrar
