# ✈️ Vuela Fácil

Plataforma web Full Stack para buscar, comparar y reservar paquetes de viaje en avión hacia destinos nacionales e internacionales. Incluye panel de administración de vuelos/destinos, sistema de autenticación con roles, favoritos, valoraciones (reviews) y calendario de disponibilidad.

🔗 **Repositorio:** [github.com/ZhylonIT/proyectofinal-vuelafacil](https://github.com/ZhylonIT/proyectofinal-vuelafacil)

---

## 📑 Tabla de contenidos

- [Tecnologías](#-tecnologías)
- [Instalación local](#-instalación-local)
- [Configuración Backend](#-configuración-backend)
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
- **Spring Validation** (`spring-boot-starter-validation`)
- **Spring Web** (`spring-boot-starter-web`)
- **Base de datos H2** (modo archivo embebido, persistente en disco)
- **Lombok**
- **Maven** — `groupId: com.vuelafacil` · `artifactId: api`

> No se utiliza `spring-boot-starter-security` ni JWT en el backend: el control de acceso por roles (`admin`/`user`) se maneja del lado del cliente (React), como se detalla en la sección de [Endpoints](#-endpoints-de-la-api).

### Frontend
- **React 19.2.6**
- **Vite 8**
- **React Router DOM 7.17.0**
- **MUI (Material UI) 9.1.0** (`@mui/material`, `@emotion/react`, `@emotion/styled`)
- **Fontsource**: Josefin Sans, Montserrat, Poppins

> Lista completa de dependencias en [`package.json`](./package.json) (frontend) y `pom.xml` (backend).

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

El proyecto está dividido en dos carpetas independientes: `backend/` (Spring Boot) y `frontend/` (React + Vite).

### 1. Levantar el Backend

```bash
cd backend
./mvnw spring-boot:run
```

El servidor queda disponible en `http://localhost:8080`.

### 2. Levantar el Frontend

```bash
cd frontend
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
```

- El parámetro `AUTO_SERVER=TRUE` permite acceder a la base de datos simultáneamente desde el backend y desde un cliente externo (IntelliJ DataGrip, H2 Console, etc.) sin bloqueos de archivo.
- La base se crea automáticamente en `./data/vuelafacildb.mv.db` al iniciar la aplicación por primera vez (no requiere `CREATE DATABASE` manual).
- Consola web de H2 disponible en: `http://localhost:8080/h2-console` (JDBC URL: la indicada arriba).

### Tablas principales

| Tabla | Descripción |
|---|---|
| `flights` | Paquetes/vuelos: nombre (único), descripción, destino, categoría, precio, moneda |
| `flight_images` | Imágenes asociadas a cada vuelo (columna `TEXT` para soportar imágenes en Base64) |

---

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

Todos los endpoints están bajo el prefijo `/api/vuelos`.

| Método | Endpoint | Descripción | Auth |
|---|---|---|---|
| `GET` | `/api/vuelos` | Lista todos los vuelos/paquetes | No |
| `GET` | `/api/vuelos/{id}` | Obtiene el detalle de un vuelo por ID | No |
| `GET` | `/api/vuelos/recomendaciones` | Devuelve hasta 10 vuelos aleatorios (para la Home) | No |
| `POST` | `/api/vuelos` | Crea un nuevo vuelo (valida nombre único) | Sí (rol admin, validado en frontend) |
| `PUT` | `/api/vuelos/{id}` | Actualiza un vuelo existente | Sí (rol admin, validado en frontend) |
| `DELETE` | `/api/vuelos/{id}` | Elimina un vuelo por ID | Sí (rol admin, validado en frontend) |

> La autenticación y el control de roles (`admin` / `user`) están actualmente implementados en el **cliente** (React, vía `localStorage`), como mecanismo de control de acceso a nivel de UI. No hay autenticación a nivel de API (JWT/sessions) implementada en el backend en esta etapa del proyecto.

---

## 🗂 Diagrama de Base de Datos
https://ibb.co/hR7Pzj9F
El modelo consta de dos tablas relacionadas en una relación **uno a muchos** (`FLIGHTS` → `FLIGHT_IMAGES`):

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

---
## ✅ Testing

### Backend

```bash
cd backend
./mvnw test
```

- **`FlightServiceTest.java`** — 5 tests unitarios de la capa de servicio (✅ Aprobado).
- **`FlightControllerTest.java`** — 4 tests de integración de la capa de controlador (✅ Aprobado).
- **`application-test.properties`** — configuración de H2 aislada para el entorno de tests.

### Frontend

```bash
cd frontend
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

## 👤 Autoría

**Arturo Quintana**


## 📄 Licencia

Proyecto final academico para Digital House.
