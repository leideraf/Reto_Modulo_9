# Frontend - Plataforma de Gestion Academica

## Descripcion general

Este frontend implementa la interfaz web de **Universidad Digital** usando **React**, **TypeScript** y **Vite**. La aplicacion consume el backend en FastAPI y ofrece una experiencia diferenciada por rol para:

- administradores
- docentes
- estudiantes

Incluye autenticacion, proteccion de rutas, consumo de API con Axios, formularios validados, dashboards por rol, modo claro/oscuro y componentes reutilizables.

## Objetivo del modulo

Construir una interfaz moderna, mantenible y escalable, con una arquitectura clara entre paginas, componentes, servicios, hooks y contexto global, garantizando una integracion limpia con el backend.

## Funcionalidades implementadas

- inicio de sesion contra el backend
- validacion de formularios con `react-hook-form` y `zod`
- proteccion de rutas por autenticacion y rol
- redireccion automatica segun el rol del usuario autenticado
- dashboards independientes para administrador, docente y estudiante
- gestion visual de usuarios, materias, periodos, inscripciones y calificaciones
- manejo centralizado de errores de API
- tema claro/oscuro persistente en `localStorage`
- consumo de API con `axios` y credenciales habilitadas
- paginas para acceso denegado, error 500 y ruta no encontrada

## Stack tecnologico

- React 19
- TypeScript
- Vite 7
- React Router DOM 7
- Axios
- React Hook Form
- Zod
- Tailwind CSS v4 integrado con Vite
- ESLint

## Arquitectura y estructura

El frontend esta ubicado en `universidad-digital/frontend`.

```text
universidad-digital/
└── frontend/
    ├── public/
    ├── src/
    │   ├── api/            # cliente HTTP y funciones por recurso
    │   ├── auth/           # almacenamiento del token en memoria
    │   ├── components/     # componentes UI reutilizables
    │   ├── context/        # AuthContext y ThemeContext
    │   ├── hooks/          # hooks de acceso a datos y contexto
    │   ├── layouts/        # layouts de autenticacion y dashboard
    │   ├── pages/          # pantallas por rol y paginas de sistema
    │   ├── routes/         # configuracion de rutas y proteccion
    │   ├── services/       # capa de servicios sobre api/
    │   ├── styles/         # estilos globales y variables CSS
    │   ├── utils/          # utilidades de sanitizacion y errores
    │   ├── App.tsx
    │   └── main.tsx
    ├── index.html
    ├── package.json
    ├── vite.config.ts
    └── tsconfig*.json
```

## Flujo de arranque

La aplicacion se monta desde `src/main.tsx` y envuelve el arbol principal con:

- `BrowserRouter`
- `ThemeProvider`
- `AuthProvider`

Luego `App.tsx` delega toda la navegacion a `AppRoutes`.

## Configuracion de Vite

El proyecto usa Vite con:

- `@vitejs/plugin-react`
- `@tailwindcss/vite`

No hay configuracion compleja adicional en `vite.config.ts`.

## Gestion de autenticacion

La autenticacion se centraliza en `src/context/AuthContext.tsx`.

Responsabilidades principales:

- iniciar sesion con `authService.login`
- consultar el usuario autenticado con `/auth/me`
- cerrar sesion
- exponer estado global de sesion
- validar roles
- reaccionar automaticamente a respuestas `401`

### Como funciona el login

1. el usuario envia email y contrasena desde `LoginPage`
2. el frontend llama `POST /auth/login`
3. el token devuelto se guarda en memoria con `setAuthToken`
4. el backend tambien mantiene la cookie HTTP-only
5. luego se consulta `GET /auth/me` para cargar el perfil
6. la app redirige al dashboard correcto segun el rol

### Proteccion de rutas

`ProtectedRoute` valida:

- si la sesion ya fue resuelta
- si el usuario esta autenticado
- si cumple alguno de los roles requeridos

Si falla:

- redirige a `/login` si no hay sesion
- redirige a `/denied` si no tiene permisos

## Gestion del token

El token se guarda en memoria en `src/auth/token.ts`.

Esto significa:

- no se persiste en `localStorage`
- al recargar la pagina, la app vuelve a consultar `/auth/me`
- el backend puede seguir sosteniendo la sesion con cookie si esta disponible

## Cliente HTTP y consumo de API

`src/api/http.ts` configura Axios con:

- `baseURL` desde `VITE_API_BASE_URL`
- fallback a `http://127.0.0.1:8000`
- `withCredentials: true`
- envio automatico del header `Authorization` si hay token en memoria

Interceptores implementados:

- si la API responde `401`, se ejecuta el handler global de logout
- si la API responde `500` o superior, se redirige a `/500`

## Variables de entorno

La variable de entorno usada por el frontend es:

```env
VITE_API_BASE_URL=http://127.0.0.1:8000
```

Si no se define, ese mismo valor se usa por defecto.

Ejemplo de archivo `.env` opcional dentro de `universidad-digital/frontend`:

```env
VITE_API_BASE_URL=http://127.0.0.1:8000
```

## Integracion con el backend

El frontend fue construido para consumir el backend del mismo repositorio.

Recursos consumidos:

- `/auth`
- `/users`
- `/roles`
- `/subjects`
- `/periods`
- `/enrollments`
- `/grades`

Para que la aplicacion funcione correctamente, el backend debe estar levantado y permitir CORS desde el origen del frontend, normalmente:

- `http://localhost:5173`
- `http://127.0.0.1:5173`

## Rutas de la aplicacion

### Publicas

| Ruta | Descripcion |
|---|---|
| `/` | redireccion automatica segun estado de sesion y rol |
| `/login` | formulario de autenticacion |
| `/denied` | acceso denegado |
| `/500` | error interno de servidor |
| `*` | pagina 404 |

### Administrador

| Ruta | Descripcion |
|---|---|
| `/admin` | dashboard general |
| `/admin/users` | gestion de usuarios |
| `/admin/subjects` | gestion de materias |
| `/admin/periods` | gestion de periodos |
| `/admin/enrollments` | gestion de inscripciones |
| `/admin/grades` | gestion de calificaciones |

### Docente

| Ruta | Descripcion |
|---|---|
| `/teacher` | dashboard docente |
| `/teacher/grades` | gestion y consulta de calificaciones |

### Estudiante

| Ruta | Descripcion |
|---|---|
| `/student` | dashboard estudiantil |
| `/student/subjects` | consulta de materias |
| `/student/enrollments` | consulta y gestion de inscripciones propias |
| `/student/grades` | consulta de notas propias |

## Navegacion por rol

La barra lateral del `DashboardLayout` construye el menu segun los roles del usuario autenticado:

- `Administrador`: panel, usuarios, materias, periodos, inscripciones, calificaciones
- `Docente`: panel y calificaciones
- `Estudiante`: panel, materias, inscripciones y calificaciones

Si un usuario tiene multiples roles, el layout puede mostrar la combinacion de accesos permitidos.

## Paginas principales

### Login

`LoginPage` usa:

- `react-hook-form`
- `zodResolver`
- sanitizacion basica del texto de entrada
- mensajes de error provenientes de la API

Validaciones:

- email valido
- contrasena minima de 8 caracteres

### Dashboards

La app incluye tres dashboards con indicadores y resumentes:

- `AdminDashboard`
  - usuarios
  - docentes
  - estudiantes
  - materias activas
  - periodos activos
  - inscripciones
  - cobertura de notas
  - promedio general
- `TeacherDashboard`
  - inscripciones asignadas
  - inscripciones calificadas
  - pendientes por calificar
  - promedio de notas
  - materias visibles
  - periodos activos
- `StudentDashboard`
  - materias inscritas
  - inscripciones activas
  - notas registradas
  - pendientes
  - materias aprobadas
  - promedio general

## Modulos funcionales del frontend

### `src/api/`

Contiene funciones tipadas para llamar al backend. Cada archivo corresponde a un recurso:

- `auth.ts`
- `users.ts`
- `roles.ts`
- `subjects.ts`
- `periods.ts`
- `enrollments.ts`
- `grades.ts`

### `src/services/`

Expone una capa mas simple sobre `api/` para ser usada desde hooks y paginas.

Servicios implementados:

- `authService`
- `usersService`
- `rolesService`
- `subjectsService`
- `periodsService`
- `enrollmentsService`
- `gradesService`

### `src/hooks/`

Hooks reutilizables:

- `useAuth`: acceso al contexto de autenticacion
- `useTheme`: acceso al contexto de tema
- `useFetch`: wrapper generico para cargar datos asincronos
- `useSubjects`
- `useEnrollments`
- `useGrades`

### `src/components/`

Componentes UI reutilizables:

- `Button`
- `Input`
- `Select`
- `Alert`
- `Modal`
- `Table`
- `ThemeToggle`
- `MetricCard`
- `SectionCard`

### `src/layouts/`

- `AuthLayout`: layout para login
- `DashboardLayout`: layout principal autenticado con header, sidebar, acciones de usuario y theme toggle

### `src/utils/`

Utilidades destacadas:

- `sanitize.ts`: elimina caracteres `<` y `>` y hace `trim()`
- `apiError.ts`: traduce errores Axios a mensajes legibles para UI

## Modo claro y oscuro

La aplicacion incluye tema global claro/oscuro.

Implementacion:

- contexto: `src/context/ThemeContext.tsx`
- hook: `src/hooks/useTheme.ts`
- boton: `src/components/ThemeToggle.tsx`
- estilos: `src/styles/global.css`

Comportamiento:

- toma como valor inicial `prefers-color-scheme`
- persiste la preferencia en `localStorage`
- usa la llave `ud_theme_mode`
- aplica el tema con `data-theme` en `document.documentElement`
- actualiza `color-scheme` del navegador

## Estilos globales

El archivo `src/styles/global.css` define:

- variables CSS para colores y superficies
- variantes para modo claro y oscuro
- estilos base de layout
- clases para tarjetas, tablas, formularios, sidebar, badges, dashboard y estados visuales

Aunque el proyecto incluye Tailwind CSS en el stack, la UI actual se apoya fuertemente en estilos globales propios y clases CSS personalizadas.

## Formularios y validaciones

La mayor parte de formularios usan:

- `react-hook-form` para manejo de estado
- `zod` para validacion declarativa
- mensajes de error directamente en el campo

Ejemplos de formularios presentes:

- login
- creacion y actualizacion de usuarios
- gestion de materias
- gestion de periodos
- gestion de inscripciones
- gestion de calificaciones

## Manejo de errores y estados

La interfaz contempla:

- alertas de exito y error con el componente `Alert`
- estados de carga con mensajes simples como `Cargando...`
- pagina dedicada para `403`
- pagina dedicada para `404`
- pagina dedicada para errores `500`

`apiError.ts` interpreta respuestas del backend y prioriza el campo `detail`.

## Requisitos previos

Antes de ejecutar el frontend necesitas:

- Node.js 20 o superior recomendado
- npm
- backend levantado y accesible

## Instalacion y ejecucion

### 1. Entrar al directorio del frontend

```powershell
cd universidad-digital\frontend
```

### 2. Instalar dependencias

```powershell
npm install
```

### 3. Configurar variables de entorno

Si necesitas cambiar la URL del backend, crea un archivo `.env`:

```env
VITE_API_BASE_URL=http://127.0.0.1:8000
```

### 4. Ejecutar en desarrollo

```powershell
npm run dev
```

La aplicacion normalmente queda disponible en:

- `http://localhost:5173`

## Scripts disponibles

```powershell
npm run dev
npm run build
npm run preview
npm run lint
```

Descripcion:

- `npm run dev`: levanta el servidor de desarrollo
- `npm run build`: compila TypeScript y genera el build de produccion
- `npm run preview`: sirve localmente el build generado
- `npm run lint`: ejecuta ESLint

## Build de produccion

Para generar el build:

```powershell
npm run build
```

La salida se genera en la carpeta `dist/`.

## Relacion entre frontend y backend

Resumen operativo:

1. el frontend autentica contra FastAPI
2. obtiene el usuario actual con `/auth/me`
3. decide el dashboard segun roles
4. consulta recursos academicos via Axios
5. muestra formularios y tablas para operar sobre esos recursos

## Estado actual del proyecto

Observaciones importantes basadas en el codigo actual:

- el frontend si tiene integracion completa con autenticacion y recursos principales del backend
- existe consumo tipado de la API por modulo
- la gestion de roles en UI hoy se usa para listar roles y asignarlos al crear usuarios
- la variable `VITE_API_BASE_URL` esta soportada aunque no se detecta un `.env` versionado en esta carpeta
- el token se mantiene en memoria y la sesion se rehidrata consultando al backend

## Sugerencias de mejora futuras

- agregar persistencia mas robusta del token si el flujo de negocio lo requiere
- agregar tests unitarios y de componentes
- mejorar los estados skeleton de carga
- agregar filtros, busqueda y paginacion en tablas
- agregar formularios dedicados para administracion de roles desde UI
- incorporar confirmaciones mas ricas para acciones sensibles

## Comando rapido de arranque

```powershell
cd universidad-digital\frontend
npm install
npm run dev
```
