### Backend — Plataforma de Gestión Académica (FastAPI)

##  Objetivo

Construir un backend seguro, escalable y mantenible usando FastAPI + SQLAlchemy + PostgreSQL, aplicando Clean Architecture, buenas prácticas OWASP y criterios de calidad ISO/IEC 25010.

##  Finalidad

Este backend provee una API REST para:

- Autenticación y autorización (roles: administrador, docente, estudiante)
- Gestión de usuarios
- Gestión de materias
- Inscripción a materias por periodo académico
- Registro y consulta de calificaciones
- Reportes académicos básicos

##  Stack Tecnológico

Python 3.11+
FastAPI
Uvicorn
SQLAlchemy 2.x
PostgreSQL (driver psycopg)
Alembic (migraciones)
Pydantic v2 + pydantic-settings
passlib[bcrypt] (hash de contraseñas)
python-jose[cryptography] (JWT)
python-dotenv (variables de entorno)

##  Estructura del Backend

Esta estructura separa dominios y responsabilidades (SRP / SoC).

backend/
 ├── app/
 │   ├── auth/           # Login, JWT, roles, cookies
 │   ├── users/          # CRUD usuarios
 │   ├── subjects/       # CRUD materias
 │   ├── enrollments/    # Inscripciones
 │   ├── grades/         # Calificaciones
 │   ├── core/           # Configuración, seguridad, errores, DB
 │   └── main.py         # Entry point FastAPI
 ├── alembic/            # Migraciones
 ├── alembic.ini
 ├── .env
 ├── requirements.txt
 └── README.md

## Paso a Paso — Construcción del Backend

1. Crear entorno virtual (venv)

  cd universidad-digital
  cd backend
  py -m venv venv
  .\venv\Scripts\Activate

2. Instalar dependencias

  python -m pip install --upgrade pip
  pip install -r requirements.txt

3. Configurar variables de entorno (.env)
  APP_ENV=development
  APP_DATABASE_URL=postgresql+psycopg://postgres:postgres@localhost:5433/universidad-digital
  APP_JWT_SECRET=change_me
  APP_CORS_ORIGINS=["http://localhost:3000"]

4. Base de datos creada
  CREATE DATABASE universidad;

5. Carpeta core/

La carpeta core contiene el núcleo del backend. Aquí se agrupan los componentes centrales que utiliza toda la aplicación: configuración, base de datos, seguridad, dependencias y manejo de errores.


- config.py

  Gestiona la configuración global del proyecto mediante variables de entorno.

  - Conexión a la base de datos
  - Configuración del JWT
  - CORS
  - Entorno (development / production)
  - Permite que la aplicación sea configurable sin modificar el código.

- security.py

  Contiene la lógica de seguridad y autenticación:

  -Hash de contraseñas
  -Verificación de contraseñas
  -Creación y validación de tokens JWT
  -Es el módulo encargado del manejo de autenticación del sistema.

- database.py

  Configura la conexión con la base de datos usando SQLAlchemy:

  - Motor de conexión (engine)
  - Sesiones (SessionLocal)
  - Clase base para los modelos (Base)
  - Centraliza todo lo relacionado con la persistencia de datos.

- deps.py

  Define las dependencias reutilizables de FastAPI:

  - Inyección de sesión de base de datos
  - Obtención del usuario autenticado
  - Validación de roles
  - Permite proteger rutas y mantener los endpoints limpios.

- errors.py

  Contiene las excepciones personalizadas del sistema:

  - Recurso no encontrado
  - Conflictos
  - No autorizado
  - Acceso prohibido
  - Ayuda a estandarizar el manejo de errores en toda la aplicación.

6. Carpeta auth/

El módulo auth se encarga de la autenticación y autorización del sistema.
Aquí se gestiona el inicio de sesión, la generación y validación de tokens JWT, el control de sesiones y la validación de roles.

- __init__.py

  Archivo que define el módulo de autenticación y permite su correcta importación dentro del proyecto.

- schemas.py

  Define los modelos de entrada y salida (Pydantic) para la autenticación:

  - LoginRequest: estructura de credenciales (email y password).
  - TokenResponse: respuesta que contiene el token JWT generado.
  - Se encarga de validar los datos que entran y salen de la API.

- models.py

  Define el modelo RevokedToken, que almacena los tokens revocados en base de datos.
  Esto permite invalidar tokens después de un logout o por motivos de seguridad.

- services.py

  Contiene la lógica principal de autenticación:

  - Validación de credenciales (authenticate_user)
  - Creación de tokens JWT
  - Revocación de tokens
  - Obtención del usuario autenticado
  - Validación de roles

7.

ejecutar backend
python -m uvicorn app.main:app --reload