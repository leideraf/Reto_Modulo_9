### Frontend — Plataforma de Gestión Académica (React)

## Objetivo

Construir una interfaz moderna, segura y escalable utilizando React + TypeScript, conectada al backend desarrollado en FastAPI, garantizando:

- Separación de responsabilidades
- Código mantenible y escalable
- Seguridad en autenticación
- Buenas prácticas OWASP
- Cumplimiento con ISO/IEC 25010 (usabilidad, mantenibilidad y seguridad)

## Paso a Paso — Construcción del Frontend

1. Crear el proyecto

  cd universidad-digital
  npm create vite@latest frontend -- --template react-ts
  cd frontend

2. Instalar tailwindcss

  npm install tailwindcss @tailwindcss/vite

3. configurar vite.config.ts

```bash

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite' # Agregar esta linea

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()], # Agregar tailwindcss ()
})

```
4. Instalar dependencias principales

  npm install axios react-router-dom
  npm install react-hook-form zod @hookform/resolvers

## Modo Dia/Noche

La aplicacion incluye tema claro/oscuro global sin romper la estructura existente.

- Provider global: `frontend/src/context/ThemeContext.tsx`
- Hook de consumo: `frontend/src/hooks/useTheme.ts`
- Boton reutilizable: `frontend/src/components/ThemeToggle.tsx`
- Variables y estilos del tema: `frontend/src/styles/global.css`

Comportamiento:

- Carga inicial basada en `prefers-color-scheme` del navegador.
- Persistencia de preferencia en `localStorage` con la llave `ud_theme_mode`.
- Aplicacion del tema mediante `data-theme` en `document.documentElement`.
- Toggle disponible en login y dashboard.
