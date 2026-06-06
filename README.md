# SSBW Store - Full Stack Deployment

Este repositorio contiene la aplicación **Tienda Prado** completa, incluyendo el backend Express, el frontend React y el sitio generado con Astro, todo orquestado para un despliegue sencillo en producción mediante Docker.

## Despliegue con Docker (Paso a Paso)

Esta es la forma recomendada de ejecutar el proyecto tanto en desarrollo como en producción.

### 1. Requisitos
- Docker y Docker Compose instalados.

### 2. Arrancar el Stack
Desde la raíz del proyecto, ejecuta:
```bash
docker compose -f docker-compose-prod.yml up -d --build
```
Esto levantará:
- **Tienda Principal**: Backend Express + Prisma + React (Puerto 80) (hatsa Tarea 10)
- **Sitio Astro**: SSG + Islands (Puerto 4321) (hasta tarea 12)
- **Base de Datos**: PostgreSQL 16
- **Reverse Proxy**: Caddy

### 3. Inicializar Base de Datos (Solo la primera vez)
Una vez que los contenedores estén corriendo, inicializa las tablas y los datos:
```bash
docker compose -f docker-compose-prod.yml exec tienda-prado npx prisma migrate deploy
docker compose -f docker-compose-prod.yml exec tienda-prado npm run db:seed
docker compose -f docker-compose-prod.yml exec tienda-prado npm run users:seed
```

## Navegación y URLs
- **Tienda Principal (React/Express)**: [http://localhost](http://localhost)
- **Sitio Astro (Tareas 11 y 12)**: [http://localhost:4321](http://localhost:4321)

---

## Contenido del Proyecto

### App Principal (Tareas 9-10)
- **React SPA**: Localizada en `/frontend`.
- **Rutas**:
  - `/` → Portada con pestañas (DaisyUI).
  - `/tarea9` → Galería dinámica (Perritos + Cuadros).
  - `/carousel` → Carrusel de productos con Embla.
- **Backend**: Express en la raíz, sirve el API y los archivos estáticos.

### Sitio Astro (Tareas 11-12)
- **Astro SSG**: Localizado en `/astro-site`.
- **Rutas**:
  - `/ssg` → 12 productos destacados generados en tiempo de compilación.
  - `/productos/[slug]` → Páginas de detalle dinámicas.
- **Islands**: Incluye el carrusel React integrado en Astro.

## Notas Técnicas
- **CORS**: El backend permite peticiones desde el puerto 4321 para que las "islands" de Astro funcionen correctamente.
- **Persistencia**: Los datos de Postgres se guardan en el volumen `postgres_data`.
- **Logger**: Los logs se generan en el contenedor y se guardan en la carpeta `/logs`.
