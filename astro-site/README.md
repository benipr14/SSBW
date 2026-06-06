# SSBW · Astro (Tarea 11)

## Requisitos
- Node.js 20.19+ o 22.12+.
- npm.

## Instalación
```bash
cd astro-site
npm install
```

## Arranque
```bash
cd astro-site
npm run dev
```

Abre:
- `http://localhost:4321/`
- `http://localhost:4321/carrousel`

Antes de abrir el carrousel, arranca también el backend en `http://localhost:3000`:
```bash
cd ..
npm run dev
```

## Notas
- La página `/` es una portada estática hecha con Astro.
- La página `/carrousel` monta un componente React como Astro Island con datos pasados por props.
- La página `/ssg` genera 12 productos destacados de forma estática.
- Existe una ruta dinámica `/productos/{título}` creada con `getStaticPaths()`.
- Las imágenes se sirven desde `astro-site/public/images`.
