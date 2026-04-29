# SSBW · Tarea 9

## Requisitos
- Node.js 20.19+ o 22.12+.
- npm.
- Docker y Docker Compose.

## Instalación
```bash
npm install
npm --prefix frontend install
```

## Base de datos
```bash
npm run db:up
npm run db:migrate
npm run db:seed
npm run users:seed
```

## Arrancar la app
Abre dos terminales:

Backend:
```bash
npm run dev
```

Frontend SPA:
```bash
npm run frontend:dev
```

- Backend: `http://localhost:3000`
- Frontend: `http://localhost:5173`

## Verificación
```bash
npm run typecheck
npm run frontend:build
```

## Qué hace la tarea 9
- Muestra un perrito aleatorio desde una API externa.
- Muestra una imagen aleatoria de la tienda desde `GET /api/imagen-aleatoria`.
- Usa Vite, React, SWR y Tailwind CSS.
