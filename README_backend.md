# Backend - Plataforma de Gestion Academica

## Descripcion general

Este backend implementa una API REST para la plataforma **Universidad Digital** usando **FastAPI**, **SQLAlchemy** y **PostgreSQL**. El sistema permite autenticacion con JWT, control de acceso por roles y administracion de los procesos academicos principales:

- gestion de usuarios
- gestion de roles
- gestion de materias
- gestion de periodos academicos
- inscripciones a materias
- registro y consulta de calificaciones

El backend esta pensado para trabajar junto con el frontend del proyecto, que por defecto consume la API desde `http://127.0.0.1:8000`.

## Objetivo del modulo

Construir un backend seguro, mantenible y escalable, organizado por dominios y con responsabilidades separadas, siguiendo buenas practicas de desarrollo y seguridad.

## Funcionalidades implementadas

- Login, logout y consulta del usuario autenticado.
- JWT firmado con expiracion configurable.
- Lectura del token desde `Authorization: Bearer <token>` o desde cookie HTTP-only.
- Revocacion de tokens al cerrar sesion.
- Autorizacion por roles: `Administrador`, `Docente` y `Estudiante`.
- Creacion automatica de roles base al iniciar la aplicacion.
- CRUD de usuarios con asignacion de roles.
- CRUD de roles.
- CRUD de materias.
- CRUD de periodos academicos.
- CRUD de inscripciones con restricciones por ownership.
- CRUD de calificaciones con visibilidad restringida para estudiantes.
- Manejo centralizado de errores de negocio y validaciones.
- CORS configurable por variables de entorno.

## Stack tecnologico

- Python 3.11+
- FastAPI
- Uvicorn
- SQLAlchemy 2.x
- PostgreSQL
- psycopg 3
- Pydantic v2
- pydantic-settings
- passlib con bcrypt
- python-jose
- python-dotenv
- Alembic incluido en dependencias

## Arquitectura y estructura

El backend esta ubicado en `universidad-digital/backend` y se organiza por dominios funcionales.

```text
universidad-digital/
└── backend/
    ├── app/
    │   ├── auth/           # autenticacion, JWT y revocacion de tokens
    │   ├── core/           # configuracion, seguridad, base de datos, errores, dependencias
    │   ├── enrollments/    # inscripciones
    │   ├── grades/         # calificaciones
    │   ├── periods/        # periodos academicos
    │   ├── roles/          # roles y relacion usuario-rol
    │   ├── subjects/       # materias
    │   ├── users/          # usuarios
    │   ├── main.py         # punto de entrada de FastAPI
    │   └── __init__.py
    ├── requirements.txt
    ├── .env
    └── venv/               # entorno virtual local
```

Cada modulo de dominio sigue la misma idea:

- `models.py`: entidades SQLAlchemy y relaciones.
- `schemas.py`: contratos de entrada y salida con Pydantic.
- `services.py`: reglas de negocio.
- `routes.py`: endpoints FastAPI.

## Componentes del nucleo

### `app/core/config.py`

Centraliza la configuracion del proyecto usando variables de entorno con prefijo `APP_`.

Define, entre otros:

- entorno (`development` o `production`)
- URL de base de datos
- secreto JWT
- expiracion del token
- configuracion de cookie
- origenes CORS
- metadatos de la API

### `app/core/database.py`

Configura:

- `engine` de SQLAlchemy
- `SessionLocal`
- clase base `Base`
- inicializacion automatica de tablas con `Base.metadata.create_all(...)`

Al iniciar la app se importan todos los modelos para registrarlos en la metadata.

### `app/core/security.py`

Responsable de:

- hash de contrasenas con bcrypt
- verificacion de contrasenas
- creacion de JWT
- decodificacion de JWT

### `app/core/deps.py`

Define dependencias reutilizables de FastAPI para:

- obtener una sesion de base de datos
- resolver el usuario autenticado
- exigir roles permitidos en rutas protegidas

### `app/core/errors.py`

Contiene excepciones de negocio usadas de forma consistente en toda la API:

- `AppError`
- `NotFoundError`
- `ConflictError`
- `UnauthorizedError`
- `ForbiddenError`

## Modulos funcionales

### Auth

Gestiona autenticacion, obtencion del usuario actual y revocacion de tokens.

Comportamiento importante:

- `POST /auth/login` devuelve el token y ademas lo guarda en cookie HTTP-only.
- `POST /auth/logout` revoca el token almacenando su `jti`.
- `GET /auth/me` devuelve el usuario autenticado.
- El token puede enviarse por header o por cookie.

### Users

Administra usuarios del sistema.

Reglas relevantes:

- solo `Administrador` puede gestionar usuarios
- si no se envian roles al crear un usuario, se asigna `Estudiante` por defecto
- contrasena minima:
  - `8` caracteres para usuarios comunes
  - `12` caracteres si el usuario tiene rol `Administrador` o `Docente`
- el borrado es logico: se marca `is_active = false`

### Roles

Permite administrar roles y la relacion entre usuarios y roles.

Ademas, al arrancar la aplicacion se crean automaticamente si no existen:

- `Administrador`
- `Docente`
- `Estudiante`

### Subjects

Gestiona materias.

Reglas relevantes:

- el codigo se normaliza a mayusculas
- el borrado es logico con `is_active = false`
- administradores crean, actualizan y desactivan
- administradores, docentes y estudiantes pueden consultar

### Periods

Gestiona periodos academicos.

Reglas relevantes:

- el codigo se normaliza a mayusculas
- `end_date` no puede ser anterior a `start_date`
- el borrado es logico con `is_active = false`

### Enrollments

Gestiona inscripciones de estudiantes a materias por periodo.

Reglas relevantes:

- solo `Administrador` y `Estudiante` pueden crear inscripciones
- un estudiante solo puede inscribirse a si mismo
- no se permiten duplicados para la combinacion `user_id + subject_id + period_id`
- solo se permite inscribir usuarios, materias y periodos activos
- estudiantes solo pueden ver sus propias inscripciones
- el borrado es logico con `is_active = false`

### Grades

Gestiona calificaciones asociadas a una inscripcion.

Reglas relevantes:

- solo `Administrador` y `Docente` pueden crear, editar o eliminar calificaciones
- estudiantes solo pueden consultar sus propias calificaciones
- la inscripcion asociada debe existir y estar activa
- el valor de la nota debe estar entre `0` y `100`, con hasta 2 decimales
- el borrado es fisico

## Modelo de datos

Entidades principales:

- `users`
  - `id`
  - `email`
  - `full_name`
  - `hashed_password`
  - `is_active`
  - `created_at`
  - `updated_at`
- `roles`
  - `id`
  - `name`
  - `description`
  - `created_at`
- `user_roles`
  - relacion muchos a muchos entre usuarios y roles
  - restriccion unica por `user_id` y `role_id`
- `subjects`
  - `id`
  - `code`
  - `name`
  - `credits`
  - `is_active`
  - `created_at`
- `academic_periods`
  - `id`
  - `code`
  - `name`
  - `start_date`
  - `end_date`
  - `is_active`
  - `created_at`
- `enrollments`
  - `id`
  - `user_id`
  - `subject_id`
  - `period_id`
  - `is_active`
  - `enrolled_at`
  - restriccion unica por `user_id`, `subject_id`, `period_id`
- `grades`
  - `id`
  - `enrollment_id`
  - `value`
  - `notes`
  - `created_at`
- `revoked_tokens`
  - almacena `jti` y expiracion de tokens revocados

Relaciones:

- un usuario puede tener multiples roles
- un usuario puede tener multiples inscripciones
- una materia puede tener multiples inscripciones
- un periodo academico puede tener multiples inscripciones
- una inscripcion puede tener multiples calificaciones

## Variables de entorno

El proyecto usa un archivo `.env` dentro de `universidad-digital/backend`.

Variables detectadas actualmente:

```env
APP_ENV=development
APP_DATABASE_URL=postgresql+psycopg://postgres:admin@localhost:5433/universidad-digital
APP_JWT_SECRET=change_me
APP_CORS_ORIGINS=["http://localhost:5173","http://127.0.0.1:5173"]
```

Variables soportadas por la configuracion:

```env
APP_ENV=development
APP_DATABASE_URL=postgresql+psycopg://postgres:postgres@localhost:5432/universidad
APP_JWT_SECRET=change_me
APP_JWT_EXPIRATION=60
APP_COOKIE_SECURE=false
APP_COOKIE_SAMESITE=lax
APP_CORS_ORIGINS=["http://localhost:5173","http://127.0.0.1:5173"]
```

Notas:

- en produccion `APP_JWT_SECRET` es obligatorio
- en produccion `APP_CORS_ORIGINS` tambien es obligatorio
- en produccion la cookie se fuerza como segura
- si no se define `APP_CORS_ORIGINS` en desarrollo, la app permite por defecto:
  - `http://localhost:3000`
  - `http://localhost:5173`
  - `http://127.0.0.1:5173`

## Requisitos previos

Antes de ejecutar el backend necesitas:

- Python 3.11 o superior
- PostgreSQL en ejecucion
- una base de datos creada

Ejemplo:

```sql
CREATE DATABASE "universidad-digital";
```

## Instalacion y ejecucion

### 1. Entrar al directorio del backend

```powershell
cd universidad-digital\backend
```

### 2. Crear entorno virtual

```powershell
py -m venv venv
```

### 3. Activar entorno virtual

```powershell
.\venv\Scripts\Activate
```

### 4. Instalar dependencias

```powershell
python -m pip install --upgrade pip
pip install -r requirements.txt
```

### 5. Configurar variables de entorno

Crear o ajustar el archivo `.env` con tus credenciales locales.

### 6. Levantar el servidor

```powershell
python -m uvicorn app.main:app --reload
```

La API queda disponible en:

- `http://127.0.0.1:8000`
- `http://localhost:8000`

Documentacion interactiva:

- Swagger UI: `http://127.0.0.1:8000/docs`
- ReDoc: `http://127.0.0.1:8000/redoc`

## Flujo de arranque

Al iniciar la aplicacion ocurre lo siguiente:

1. se cargan configuraciones desde `.env`
2. se crea la aplicacion FastAPI
3. se valida configuracion critica si el entorno es produccion
4. se configura CORS
5. en el evento `startup` se crean las tablas automaticamente
6. se insertan los roles base si aun no existen
7. se registran los routers de todos los modulos

## Autenticacion y autorizacion

### Login

Endpoint:

```http
POST /auth/login
```

Payload:

```json
{
  "email": "admin@correo.com",
  "password": "mi_password_segura"
}
```

Respuesta:

```json
{
  "access_token": "jwt_token"
}
```

### Como enviar el token

El backend acepta autenticacion por cualquiera de estas dos vias:

- header `Authorization: Bearer <token>`
- cookie HTTP-only llamada `access_token`

### Logout

```http
POST /auth/logout
```

Efectos:

- revoca el token actual si existe
- elimina la cookie de sesion

### Endpoint del usuario autenticado

```http
GET /auth/me
```

## Matriz de acceso por rol

| Recurso | Administrador | Docente | Estudiante |
|---|---|---|---|
| Auth | Si | Si | Si |
| Usuarios | Si | No | No |
| Roles | Si | No | No |
| Materias - consultar | Si | Si | Si |
| Materias - crear/editar/desactivar | Si | No | No |
| Periodos - consultar | Si | Si | Si |
| Periodos - crear/editar/desactivar | Si | No | No |
| Inscripciones - consultar | Si | Si | Si, solo propias |
| Inscripciones - crear | Si | No | Si, solo propias |
| Inscripciones - editar/desactivar | Si | No | No |
| Calificaciones - consultar | Si | Si | Si, solo propias |
| Calificaciones - crear/editar/eliminar | Si | Si | No |

## Endpoints disponibles

### Auth

| Metodo | Ruta | Descripcion |
|---|---|---|
| POST | `/auth/login` | Inicia sesion y entrega JWT |
| POST | `/auth/logout` | Cierra sesion y revoca token |
| GET | `/auth/me` | Obtiene el usuario autenticado |

### Usuarios

| Metodo | Ruta | Descripcion |
|---|---|---|
| POST | `/users/` | Crear usuario |
| GET | `/users/` | Listar usuarios |
| GET | `/users/{user_id}` | Obtener usuario por ID |
| PUT | `/users/{user_id}` | Actualizar usuario |
| DELETE | `/users/{user_id}` | Desactivar usuario |
| POST | `/users/{user_id}/roles/{role_id}` | Asignar rol |
| DELETE | `/users/{user_id}/roles/{role_id}` | Remover rol |

### Roles

| Metodo | Ruta | Descripcion |
|---|---|---|
| POST | `/roles/` | Crear rol |
| GET | `/roles/` | Listar roles |
| GET | `/roles/{role_id}` | Obtener rol por ID |
| PUT | `/roles/{role_id}` | Actualizar rol |
| DELETE | `/roles/{role_id}` | Eliminar rol |

### Materias

| Metodo | Ruta | Descripcion |
|---|---|---|
| POST | `/subjects/` | Crear materia |
| GET | `/subjects/` | Listar materias |
| GET | `/subjects/{subject_id}` | Obtener materia por ID |
| PUT | `/subjects/{subject_id}` | Actualizar materia |
| DELETE | `/subjects/{subject_id}` | Desactivar materia |

### Periodos academicos

| Metodo | Ruta | Descripcion |
|---|---|---|
| POST | `/periods/` | Crear periodo |
| GET | `/periods/` | Listar periodos |
| GET | `/periods/{period_id}` | Obtener periodo por ID |
| PUT | `/periods/{period_id}` | Actualizar periodo |
| DELETE | `/periods/{period_id}` | Desactivar periodo |

### Inscripciones

| Metodo | Ruta | Descripcion |
|---|---|---|
| POST | `/enrollments/` | Crear inscripcion |
| GET | `/enrollments/` | Listar inscripciones |
| GET | `/enrollments/{enrollment_id}` | Obtener inscripcion por ID |
| PUT | `/enrollments/{enrollment_id}` | Actualizar inscripcion |
| DELETE | `/enrollments/{enrollment_id}` | Desactivar inscripcion |

### Calificaciones

| Metodo | Ruta | Descripcion |
|---|---|---|
| POST | `/grades/` | Crear calificacion |
| GET | `/grades/` | Listar calificaciones |
| GET | `/grades/{grade_id}` | Obtener calificacion por ID |
| PUT | `/grades/{grade_id}` | Actualizar calificacion |
| DELETE | `/grades/{grade_id}` | Eliminar calificacion |

## Contratos basicos de entrada

### Crear usuario

```json
{
  "email": "estudiante@correo.com",
  "full_name": "Nombre Completo",
  "password": "password_segura",
  "role_ids": [3]
}
```

### Crear rol

```json
{
  "name": "Coordinador",
  "description": "Rol de coordinacion academica"
}
```

### Crear materia

```json
{
  "code": "MAT101",
  "name": "Matematicas Basicas",
  "credits": 3
}
```

### Crear periodo

```json
{
  "code": "2026-1",
  "name": "Primer semestre 2026",
  "start_date": "2026-01-15",
  "end_date": "2026-06-15"
}
```

### Crear inscripcion

```json
{
  "user_id": 5,
  "subject_id": 2,
  "period_id": 1
}
```

### Crear calificacion

```json
{
  "enrollment_id": 10,
  "value": 92.5,
  "notes": "Buen desempeno"
}
```

## Respuestas y manejo de errores

La API devuelve errores de forma consistente en el campo `detail`.

Ejemplos:

```json
{
  "detail": "Credenciales invalidas."
}
```

```json
{
  "detail": "Permisos insuficientes."
}
```

Codigos comunes:

- `400` error de negocio general
- `401` no autenticado o token invalido
- `403` autenticado pero sin permisos
- `404` recurso no encontrado
- `409` conflicto de negocio
- `422` error de validacion de datos

## CORS

La API habilita:

- `allow_credentials = true`
- metodos: `GET`, `POST`, `PUT`, `DELETE`, `OPTIONS`
- headers: `Authorization`, `Content-Type`

Esto permite trabajar correctamente con el frontend y con cookies de sesion.

## Consideraciones de seguridad implementadas

- hash de contrasenas con bcrypt
- tokens JWT firmados
- expiracion de token configurable
- revocacion de tokens al hacer logout
- cookies HTTP-only
- validacion por rol en rutas protegidas
- bloqueo de acceso a recursos ajenos para estudiantes en inscripciones y calificaciones

## Estado actual del proyecto

Observaciones importantes basadas en el codigo actual:

- las tablas se crean automaticamente al iniciar la app; no se esta usando un flujo activo de migraciones aunque `alembic` existe en dependencias
- el archivo `.env` del repositorio apunta a PostgreSQL en `localhost:5433`
- existe un entorno virtual local `venv/` dentro del backend
- el README documenta el estado real implementado hoy en el repositorio

## Sugerencias de mejora futuras

- agregar migraciones versionadas con Alembic
- incorporar pruebas unitarias e integracion
- agregar paginacion y filtros en listados
- documentar seeds iniciales o usuario administrador bootstrap
- agregar logging estructurado
- agregar rate limiting y auditoria

## Comando rapido de arranque

```powershell
cd universidad-digital\backend
.\venv\Scripts\Activate
python -m uvicorn app.main:app --reload
```
