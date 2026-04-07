# Universidad Digital

Sistema web de gestion academica construido como una aplicacion **full stack** con **FastAPI** en el backend y **React + TypeScript** en el frontend.

El proyecto permite administrar usuarios, roles, materias, periodos academicos, inscripciones y calificaciones, con acceso controlado segun el perfil del usuario:

- `Administrador`
- `Docente`
- `Estudiante`

## Descripcion del proyecto

**Universidad Digital** simula una plataforma academica donde distintos tipos de usuarios interactuan con la misma informacion, pero con permisos diferentes.

Desde la interfaz web, el usuario puede iniciar sesion y acceder a un panel adaptado a su rol. El sistema consulta y actualiza la informacion academica a traves de una API REST segura, usando autenticacion con JWT y validacion de permisos en cada modulo.

El objetivo del proyecto es mostrar una arquitectura clara, mantenible y desacoplada entre frontend y backend, con buenas practicas de organizacion, validacion y seguridad.

## Modulos principales

- **Autenticacion:** login, logout y sesion actual.
- **Usuarios:** creacion, actualizacion y administracion de usuarios.
- **Roles:** control de acceso por perfil.
- **Materias:** registro y consulta de asignaturas.
- **Periodos academicos:** control de ciclos o semestres.
- **Inscripciones:** vinculacion entre estudiante, materia y periodo.
- **Calificaciones:** registro y consulta de notas.

## Tecnologias utilizadas

### Backend

- Python 3.11+
- FastAPI
- SQLAlchemy 2
- PostgreSQL
- Pydantic
- passlib + bcrypt
- python-jose
- Uvicorn

### Frontend

- React 19
- TypeScript
- Vite
- React Router DOM
- Axios
- React Hook Form
- Zod
- Tailwind CSS v4

## Estructura general

```text
Reto_Modulo_9/
├── README.md
├── README_backend.md
├── README_frontend.md
└── universidad-digital/
    ├── backend/
    │   ├── app/
    │   ├── requirements.txt
    │   └── .env
    └── frontend/
        ├── src/
        ├── package.json
        └── vite.config.ts
```

## Como funciona el sistema

### 1. Inicio de sesion

Cuando el usuario entra al frontend:

1. accede a la pantalla de login
2. ingresa su correo y contrasena
3. el frontend envia las credenciales al backend en `/auth/login`
4. el backend valida el usuario, genera un JWT y devuelve el token
5. el frontend guarda el token en memoria y luego consulta `/auth/me`
6. con esa respuesta identifica los roles del usuario
7. el sistema redirige automaticamente al panel correcto

Esto permite que una sola aplicacion atienda varios perfiles sin duplicar logica de acceso.

### 2. Control de acceso por rol

Cada ruta protegida del frontend verifica si el usuario:

- ya inicio sesion
- tiene un rol autorizado para esa vista

Al mismo tiempo, el backend vuelve a validar el token y los permisos en cada endpoint.  
Eso significa que la seguridad no depende solo de la interfaz, sino tambien del servidor.

Ejemplos:

- un `Administrador` puede gestionar usuarios, materias, periodos, inscripciones y calificaciones
- un `Docente` puede consultar su panel y trabajar con calificaciones
- un `Estudiante` puede ver materias, consultar sus inscripciones y revisar sus notas

### 3. Gestion academica

El flujo academico principal funciona asi:

1. el administrador crea usuarios, materias y periodos
2. el sistema asegura que existan los roles base
3. un estudiante se inscribe a una materia dentro de un periodo academico
4. esa inscripcion queda registrada como relacion entre usuario, materia y periodo
5. posteriormente un docente o administrador registra la calificacion asociada
6. el estudiante puede consultar su avance y sus resultados desde su panel

Este flujo conecta los modulos principales del sistema y representa el comportamiento central de la plataforma.

### 4. Consulta de dashboards

Despues del login, cada usuario ve un dashboard distinto:

- **Administrador:** resumen global del sistema, usuarios, materias, periodos, inscripciones y cobertura de notas
- **Docente:** avance de calificaciones, pendientes y distribucion de notas
- **Estudiante:** estado de inscripciones, materias cursadas, notas registradas y promedio

Estos dashboards se alimentan consumiendo varios endpoints del backend y consolidando los datos en la interfaz.

### 5. Manejo de sesion y errores

Mientras el usuario navega:

- el frontend envia el token en las solicitudes protegidas
- si el backend responde `401`, la app cierra la sesion automaticamente
- si el backend responde con un error del servidor, la app redirige a la pagina `/500`
- si el usuario intenta entrar a una ruta no permitida, ve la pagina de acceso denegado

Esto hace que la experiencia sea mas consistente y predecible durante el uso.

## Instalacion completa del proyecto

### Requisitos previos

- Python 3.11 o superior
- Node.js 20 o superior recomendado
- npm
- PostgreSQL

### 1. Clonar o abrir el proyecto

```powershell
cd c:\Users\Leider\Desktop\Retos-DevSenior\Reto_Modulo_9
```

### 2. Configurar la base de datos

Crea una base de datos en PostgreSQL. Por ejemplo:

```sql
CREATE DATABASE "universidad-digital";
```

### 3. Levantar el backend

```powershell
cd universidad-digital\backend
py -m venv venv
.\venv\Scripts\Activate
pip install -r requirements.txt
python -m uvicorn app.main:app --reload
```

### 4. Levantar el frontend

En otra terminal:

```powershell
cd universidad-digital\frontend
npm install
npm run dev
```

### 5. Acceder a la aplicacion

- Frontend: `http://localhost:5173`
- Backend: `http://127.0.0.1:8000`
- Swagger UI: `http://127.0.0.1:8000/docs`


## Scripts utiles

### Frontend

```powershell
npm run dev
npm run build
npm run preview
npm run lint
```

### Backend

```powershell
python -m uvicorn app.main:app --reload
```

## Documentacion adicional

Si necesitas mas detalle tecnico por modulo, puedes revisar:

- [README_backend.md](./README_backend.md)
- [README_frontend.md](./README_frontend.md)


Autor: Leider Elian Arias Franco
Programa: Python
Módulo:
Video:

