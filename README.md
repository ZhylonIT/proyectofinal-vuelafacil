Proyecto: Vuela Fácil ✈️
Vuela Fácil es una plataforma integral de gestión de reservas de vuelos y destinos, diseñada con una arquitectura de alta disponibilidad y modularidad. El proyecto abarca desde una capa de persistencia robusta en Java/Spring Boot hasta una experiencia de usuario (UX) fluida y responsive en React, bajo un enfoque de ingeniería "Senior" que prioriza la estabilidad, el aislamiento de componentes y la escalabilidad.

🛠️ Stack Tecnológico
Backend
Lenguaje: Java 17
Framework: Spring Boot 3.5.14
Persistencia: H2 Database (Modo Embedded File: ./data/vuelafacildb)
Configuración: Servidor embebido con soporte para lectura/escritura simultánea (AUTO_SERVER=TRUE)

Frontend
Framework: React + Vite
Interfaz: Material UI (MUI v5/v9) con diseño personalizado
Estilos: CSS Modular (Glassmorphism), CSS Grid y Flexbox.
Enrutamiento: React Router DOM v6
Gestión de Estado: Elevación de estado (Lifting State Up), React Hooks (useMemo, useCallback), y persistencia en localStorage.

✨ Estado de Características y Logros
Backend: 
API REST operativa con Gestión de Vuelos (CRUD): Endpoints validados (GET, POST, PUT, DELETE).

Frontend - UI/UX:
Buscador Avanzado: Estilo Glassmorphism con inputs responsivos.
Catálogo y Filtrado: Sistema de categorías dinámico y filtrado cruzado de características.
Módulo de Administración: Gestión de vuelos, destinos y usuarios.
Sistema de Autenticación: Control de acceso basado en roles (admin y user) con persistencia segura y visibilidad condicional.

📦 Estructura
Frontend:
📦src
 ┣ 📂assets/images       # Recursos estáticos (branding e imágenes de destinos)
 ┣ 📂components/common   # Componentes UI reutilizables
 ┣ 📂features            # Capa de lógica de negocio (Aislamiento total)
 ┃ ┣ 📂admin             # Módulos: DestinationManagement, FlightForm, UserManagement
 ┃ ┣ 📂auth              # Módulos: LoginForm, RegisterForm, UserProfile
 ┃ ┗ 📂flights           # Módulos: Search, Categories, Gallery, Recommendations
 ┣ 📂layouts             # Estructura global (Header, Footer, MainLayout)
 ┣ 📂pages               # Vistas de alto nivel (Admin, Detail, Login, etc.)
 ┣ 📂routes              # Configuración inmutable: AppRoutes.jsx
 ┣ 📂styles              # Hojas de estilo modulares CSS Puro
 ┣ 📂theme               # Tokens de diseño: theme.js
 ┗ 📜App.jsx / main.jsx  # Punto de entrada y orquestación

 Backend:
 📦src/main/java/com/vuelafacil/api
 ┣ 📂config              # WebConfig (CORS, Proxy)
 ┣ 📂controllers         # Endpoints REST (FlightController)
 ┣ 📂entities            # Modelo de datos (Flight)
 ┣ 📂exceptions          # Manejo de errores global
 ┣ 📂repositories        # Capa de acceso a datos (FlightRepository)
 ┣ 📂services            # Lógica de negocio (FlightService)
 ┗ 📜ApiApplication.java # Configuración de ejecución

✨ Pruebas y QA
Unitarias: FlightServiceTest.java (cobertura total de lógica de negocio).
Integración: FlightControllerTest.java (validación de endpoints contra H2).
