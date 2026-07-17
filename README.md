# ✈️ Vuela Fácil

Plataforma web Full Stack para buscar, comparar y reservar paquetes de viaje en avión hacia destinos nacionales e internacionales. Incluye panel de administración de vuelos/destinos, sistema de autenticación y autorización por roles con JWT, favoritos, reservas y valoraciones (reviews), todo persistido y validado en el backend.

🔗 **Repositorio:** [github.com/ZhylonIT/proyectofinal-vuelafacil](https://github.com/ZhylonIT/proyectofinal-vuelafacil)

---

## 📑 Tabla de contenidos

- [Tecnologías](#-tecnologías)
- [Instalación local](#-instalación-local)
- [Configuración Backend](#-configuración-backend)
- [Autenticación y Roles](#-autenticación-y-roles)
- [Configuración Frontend](#-configuración-frontend)
- [Endpoints de la API](#-endpoints-de-la-api)
- [Diagrama de Base de Datos](#-diagrama-de-base-de-datos)
- [Testing](#-testing)
- [Deploy](#-deploy)
- [Capturas de pantalla](#-capturas-de-pantalla)
- [Buenas prácticas aplicadas](#-buenas-prácticas-aplicadas)

---

## 🛠 Tecnologías

### Backend
- **Java 17**
- **Spring Boot 3.5.14** (`spring-boot-starter-parent`)
- **Spring Data JPA** (`spring-boot-starter-data-jpa`)
- **Spring Security 6** (`spring-boot-starter-security`) — autenticación stateless y autorización por rol
- **JWT** (`io.jsonwebtoken:jjwt-api` / `jjwt-impl` / `jjwt-jackson` 0.12.6) — generación y validación de tokens
- **Spring Validation** (`spring-boot-starter-validation`)
- **Spring Web** (`spring-boot-starter-web`)
- **BCrypt** (vía `spring-security-crypto`) — hash de contraseñas
- **Base de datos H2** (modo archivo embebido, persistente en disco)
- **Lombok**
- **Maven** — `groupId: com.vuelafacil` · `artifactId: api`

> El backend implementa autenticación real con JWT y autorización por rol (`ADMIN` / `USER`) a nivel de API — no depende del cliente para proteger acciones sensibles. El detalle está en la sección [Autenticación y Roles](#-autenticación-y-roles).

### Frontend
- **React 19.2.6**
- **Vite 8**
- **React Router DOM 7.17.0**
- **MUI (Material UI) 9.1.0** (`@mui/material`, `@emotion/react`, `@emotion/styled`)
- **Fontsource**: Josefin Sans, Montserrat, Poppins
- **Sin dependencias adicionales para consumir la API**: una capa de servicios propia (`src/services/`) sobre `fetch` nativo se encarga de adjuntar el token JWT y manejar errores, sin necesidad de axios/react-query.

> Lista completa de dependencias en [`package.json`](./Frontend/package.json) (frontend) y [`pom.xml`](./Backend/pom.xml) (backend).

---

## 🚀 Instalación local

### Requisitos previos

- **Node.js** ≥ 18.x y npm
- **Java JDK** 17
- **Maven** ≥ 3.8 (o el wrapper `./mvnw` incluido en el backend)
- Git

### Clonar el repositorio

```bash
git clone https://github.com/ZhylonIT/proyectofinal-vuelafacil.git
cd proyectofinal-vuelafacil
```

El proyecto está dividido en dos carpetas independientes: `Backend/` (Spring Boot) y `Frontend/` (React + Vite).

### 1. Levantar el Backend

```bash
cd Backend
./mvnw spring-boot:run
```

El servidor queda disponible en `http://localhost:8080`. Al arrancar por primera vez, se siembran automáticamente los roles `ADMIN`/`USER` y un usuario administrador (ver [Autenticación y Roles](#-autenticación-y-roles)).

### 2. Levantar el Frontend

```bash
cd Frontend
npm install
npm run dev
```

La aplicación queda disponible en `http://localhost:5173`

> ⚠️ Para que el frontend pueda consumir la API, **el backend debe estar corriendo en el puerto 8080**, ya que `vite.config.js` redirige las peticiones `/api` hacia `http://localhost:8080`.

---

## ⚙️ Configuración Backend

### Base de datos

El proyecto utiliza **H2** en modo archivo embebido (no en memoria), por lo que los datos persisten entre reinicios del servidor.

```properties
# src/main/resources/application.properties
spring.datasource.url=jdbc:h2:file:./data/vuelafacildb;AUTO_SERVER=TRUE
spring.datasource.driverClassName=org.h2.Driver
spring.datasource.username=sa
spring.datasource.password=
spring.jpa.hibernate.ddl-auto=update
spring.h2.console.enabled=true

# === SEGURIDAD / JWT ===
app.jwt.secret=<clave-base64-de-al-menos-256-bits>
app.jwt.expiration-ms=86400000
```

- El parámetro `AUTO_SERVER=TRUE` permite acceder a la base de datos simultáneamente desde el backend y desde un cliente externo (IntelliJ DataGrip, H2 Console, etc.) sin bloqueos de archivo.
- La base se crea automáticamente en `./data/vuelafacildb.mv.db` al iniciar la aplicación por primera vez (no requiere `CREATE DATABASE` manual). `ddl-auto=update` agrega tablas/columnas nuevas sin borrar los datos existentes.
- Consola web de H2 disponible en: `http://localhost:8080/h2-console` (JDBC URL: la indicada arriba) — sigue accesible con Spring Security activo.
- `app.jwt.secret` firma los tokens JWT (HMAC); `app.jwt.expiration-ms` define su vencimiento (24hs por defecto).

### Tablas principales

| Tabla | Descripción |
|---|---|
| `flights` | Paquetes/vuelos: nombre (único), descripción, destino, categoría, precio, moneda |
| `flight_images` | Imágenes asociadas a cada vuelo (columna `TEXT` para soportar imágenes en Base64) |
| `usuarios` | Cuentas de usuario: nombre, apellido, email (único), contraseña encriptada (BCrypt), rol |
| `roles` | Catálogo de roles (`ADMIN`, `USER`) |
| `favoritos` | Relación usuario ↔ vuelo marcado como favorito (única por par) |
| `reservas` | Reservas de un usuario sobre un vuelo: fechas, estado, precio/moneda congelados al momento de reservar |
| `resenas` | Valoraciones (1 a 5 estrellas + comentario) de un usuario sobre un vuelo (una por par usuario/vuelo) |

---

## 🔐 Autenticación y Roles

La autenticación es real y vive enteramente en el backend — el frontend solo la consume.

- **Registro**: `POST /api/auth/registro` crea el usuario con contraseña encriptada (BCrypt) y rol `USER` por defecto.
- **Login**: `POST /api/auth/login` valida credenciales y devuelve un **JWT** junto con los datos del usuario (sin la contraseña).
- **Uso del token**: el frontend lo guarda y lo envía como header `Authorization: Bearer <token>` en cada request a un endpoint protegido.
- **Autorización por rol**: los endpoints de escritura sobre vuelos (`POST`/`PUT`/`DELETE /api/vuelos`) y la gestión de usuarios (`/api/usuarios/**`) requieren rol `ADMIN`; favoritos, reservas y reseñas requieren estar autenticado (cualquier rol).
- **Protecciones adicionales**: un usuario no puede otorgarse ni revocarse el rol a sí mismo; las contraseñas nunca se exponen en las respuestas de la API.

### Usuario administrador inicial

Al arrancar el backend por primera vez, un `CommandLineRunner` (`DataSeeder`) crea automáticamente los roles y un admin de arranque:

| Email | Password |
|---|---|
| `admin@vuelafacil.com` | `Admin123!` |

> Se recomienda cambiar esta contraseña (o el rol de otro usuario propio vía el panel de administración) después de la primera prueba.

## 🎨 Configuración Frontend

El frontend **no requiere variables de entorno** para correr en local: la URL de la API está resuelta mediante un **proxy configurado en `vite.config.js`**, que redirige todas las peticiones que empiecen con `/api` hacia el backend.

```js
// vite.config.js
export default defineConfig({
  server: {
    proxy: {
      '/api': 'http://localhost:8080',
    },
  },
});

``` 

## 🔌 Endpoints de la API

Todas las respuestas de error siguen un formato uniforme (`timestamp`, `status`, `error`, `message`, `path`), y los códigos `401`/`403`/`404`/`409` reflejan el motivo real del rechazo.

### Autenticación (`/api/auth`)

| Método | Endpoint | Descripción | Auth |
|---|---|---|---|
| `POST` | `/api/auth/registro` | Crea una cuenta nueva (rol `USER`) y devuelve token + usuario | No |
| `POST` | `/api/auth/login` | Autentica y devuelve token + usuario | No |

### Vuelos (`/api/vuelos`)

| Método | Endpoint | Descripción | Auth |
|---|---|---|---|
| `GET` | `/api/vuelos` | Lista todos los vuelos/paquetes | No |
| `GET` | `/api/vuelos/{id}` | Obtiene el detalle de un vuelo por ID | No |
| `GET` | `/api/vuelos/recomendaciones` | Devuelve hasta 10 vuelos aleatorios (para la Home) | No |
| `POST` | `/api/vuelos` | Crea un nuevo vuelo (valida nombre único) | Sí (rol `ADMIN`) |
| `PUT` | `/api/vuelos/{id}` | Actualiza un vuelo existente | Sí (rol `ADMIN`) |
| `DELETE` | `/api/vuelos/{id}` | Elimina un vuelo y sus favoritos/reservas/reseñas asociadas | Sí (rol `ADMIN`) |

### Usuarios (`/api/usuarios`)

| Método | Endpoint | Descripción | Auth |
|---|---|---|---|
| `GET` | `/api/usuarios` | Lista todos los usuarios registrados | Sí (rol `ADMIN`) |
| `PATCH` | `/api/usuarios/{id}/rol` | Cambia el rol de un usuario (`ADMIN`/`USER`) | Sí (rol `ADMIN`, no autoaplicable) |

### Favoritos (`/api/favoritos`)

| Método | Endpoint | Descripción | Auth |
|---|---|---|---|
| `POST` | `/api/favoritos` | Marca un vuelo como favorito del usuario autenticado | Sí (autenticado) |
| `GET` | `/api/favoritos/mios` | Lista los favoritos del usuario autenticado | Sí (autenticado) |
| `DELETE` | `/api/favoritos/{flightId}` | Quita un vuelo de favoritos | Sí (autenticado) |

### Reservas (`/api/reservas`)

| Método | Endpoint | Descripción | Auth |
|---|---|---|---|
| `POST` | `/api/reservas` | Crea una reserva (congela precio/moneda del vuelo) | Sí (autenticado) |
| `GET` | `/api/reservas/mias` | Lista las reservas del usuario autenticado | Sí (autenticado) |
| `DELETE` | `/api/reservas/{id}` | Cancela una reserva propia | Sí (autenticado) |

### Reseñas (`/api/vuelos/{id}/resenas`)

| Método | Endpoint | Descripción | Auth |
|---|---|---|---|
| `POST` | `/api/vuelos/{id}/resenas` | Publica una reseña (1 por usuario por vuelo) | Sí (autenticado) |
| `GET` | `/api/vuelos/{id}/resenas` | Lista las reseñas de un vuelo con promedio y cantidad | No |

> La autenticación y la autorización por rol (`ADMIN` / `USER`) están implementadas en el **backend** con Spring Security y JWT — el frontend solo refleja esos permisos en la UI (ver [Autenticación y Roles](#-autenticación-y-roles)).

---

## 🗂 Diagrama de Base de Datos

> El diagrama original (https://ibb.co/hR7Pzj9F) solo cubre `FLIGHTS`/`FLIGHT_IMAGES`; el modelo actual agrega `USUARIOS`, `ROLES`, `FAVORITOS`, `RESERVAS` y `RESENAS` como se detalla abajo.

| Tabla | Campo | Tipo | Detalle |
|---|---|---|---|
| **FLIGHTS** | `id` | `bigint` | Clave primaria |
| | `name` | `varchar(255)` | Único |
| | `description` | `varchar` | — |
| | `destination` | `varchar(255)` | — |
| | `category` | `varchar(255)` | — |
| | `price` | `double precision` | — |
| | `currency` | `varchar(255)` | — |
| **FLIGHT_IMAGES** | `flight_id` | `bigint` | Clave foránea → `FLIGHTS.id` |
| | `image_url` | `varchar(255)` | URL o Base64 de la imagen |
| **ROLES** | `id` | `bigint` | Clave primaria |
| | `nombre` | `enum('ADMIN','USER')` | Único |
| **USUARIOS** | `id` | `bigint` | Clave primaria |
| | `nombre`, `apellido` | `varchar(255)` | — |
| | `email` | `varchar(255)` | Único |
| | `password_hash` | `varchar(255)` | BCrypt, nunca expuesto por la API |
| | `rol_id` | `bigint` | Clave foránea → `ROLES.id` |
| **FAVORITOS** | `id` | `bigint` | Clave primaria |
| | `usuario_id` | `bigint` | Clave foránea → `USUARIOS.id` |
| | `flight_id` | `bigint` | Clave foránea → `FLIGHTS.id` (único junto a `usuario_id`) |
| **RESERVAS** | `id` | `bigint` | Clave primaria |
| | `usuario_id` | `bigint` | Clave foránea → `USUARIOS.id` |
| | `flight_id` | `bigint` | Clave foránea → `FLIGHTS.id` |
| | `fecha_ida`, `fecha_vuelta` | `date` | `fecha_vuelta` opcional |
| | `fecha_reserva` | `timestamp` | — |
| | `estado` | `enum('CONFIRMADA','CANCELADA')` | — |
| | `precio_al_momento`, `moneda_al_momento` | `double` / `varchar` | Congelados al crear la reserva |
| **RESENAS** | `id` | `bigint` | Clave primaria |
| | `usuario_id` | `bigint` | Clave foránea → `USUARIOS.id` (único junto a `flight_id`) |
| | `flight_id` | `bigint` | Clave foránea → `FLIGHTS.id` |
| | `rating` | `integer` | 1 a 5 |
| | `comentario` | `text` | — |
| | `fecha` | `timestamp` | — |

Al eliminar un vuelo (`DELETE /api/vuelos/{id}`), el backend borra en cascada sus favoritos, reservas y reseñas asociadas antes de borrar el vuelo, para no violar las claves foráneas.

---
## ✅ Testing

### Backend

```bash
cd Backend
./mvnw test
```

**46 tests** entre unitarios (Mockito) e integración (MockMvc + H2 en memoria), todos aprobados:

| Capa | Clase | Cubre |
|---|---|---|
| Servicio | `FlightServiceTest` | CRUD de vuelos + borrado en cascada de dependencias |
| Servicio | `UsuarioServiceTest` | Registro, email duplicado, cambio de rol, autoprotección |
| Servicio | `AuthServiceTest` | Login válido/inválido y generación de token |
| Servicio | `FavoritoServiceTest` | Alta, duplicado, baja inexistente |
| Servicio | `ReservaServiceTest` | Alta con precio congelado, fechas inválidas, cancelación ajena |
| Servicio | `ResenaServiceTest` | Alta, duplicado, cálculo de promedio |
| Controlador | `FlightControllerTest` | CRUD + 401/403 por rol, incluye `PUT` |
| Controlador | `AuthControllerTest` | Registro y login end-to-end |
| Controlador | `FavoritoControllerTest` | Flujo completo con JWT real |
| Controlador | `ReservaControllerTest` | Flujo completo con JWT real |
| Controlador | `ResenaControllerTest` | Flujo completo, acceso público de lectura |

`application-test.properties` aísla los tests en una base H2 en memoria, independiente de los datos reales en `./data/`.

### Frontend

```bash
cd Frontend
npm run build
npm run lint
```

---

## 🌐 Deploy

Este proyecto **no cuenta con deploy público**: la entrega se realiza para ejecución en entorno local, siguiendo los pasos de la sección [Instalación local](#-instalación-local).

---

## 📸 Capturas de pantalla

🎥 **Video de muestra del sistema funcionando:** [Ver en Vimeo](https://vimeo.com/1205953468?share=copy&fl=sv&fe=ci)

### Home

https://ibb.co/whhFLcZb

Buscador principal con filtros por origen, destino, fechas y pasajeros, filtro por características (Apto Familia, Aventura Extrema, Relajación Total, Wifi) y grilla de destinos destacados.

---

## 🧱 Buenas prácticas aplicadas

- **Capas separadas**: `controllers` → `services` → `repositories`, sin lógica de negocio en los controllers.
- **DTOs** de entrada y salida para autenticación, reservas, favoritos y reseñas — nunca se serializa la entidad `Usuario` completa (el hash de la contraseña no sale de la capa de persistencia).
- **Validaciones** con Bean Validation (`@NotBlank`, `@Email`, `@Min`/`@Max`, etc.) tanto en las entidades como en los DTOs de request.
- **Autenticación y autorización reales** en el backend (Spring Security + JWT + BCrypt), no delegadas al cliente.
- **Manejo centralizado de errores** (`@RestControllerAdvice`) con respuestas uniformes y códigos HTTP semánticos (`400`, `401`, `403`, `404`, `409`).
- **Tests automatizados** unitarios y de integración para cada capa nueva (ver [Testing](#-testing)).
- **Frontend desacoplado del `localStorage`**: una capa de servicios (`src/services/`) y un `AuthContext` centralizan el consumo de la API y el manejo de la sesión, reemplazando la lógica simulada que existía antes.

---

## 👤 Autoría

**Arturo Quintana**


## 📄 Licencia

Proyecto final academico para Digital House.
