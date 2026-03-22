# Pasos rápidos para ejecutar en un portátil nuevo

1) Requisitos previos
- Node.js 22+ y npm instalados.
- Docker y Docker Compose activos.

2) Clonar y preparar dependencias
```bash
git clone https://github.com/benipr14/TFG.git
cd TFG
npm install
```

3) Configurar entorno
- Asegúrate de tener un `.env` con la conexión a Postgres. El repo incluye uno de ejemplo:
```
PORT=3000
POSTGRES_USER=ssbw_user
POSTGRES_PASSWORD=ssbw_pass_123
POSTGRES_DB=ssbw
DATABASE_URL="postgresql://ssbw_user:ssbw_pass_123@localhost:5432/ssbw?schema=public"
SESSION_SECRET=ssbw_session_secret
SECRET_KEY=ssbw_jwt_secret
```

4) Levantar la base de datos y preparar datos
```bash
npm run db:up        # arranca Postgres en docker
npm run db:migrate   # crea las tablas
npm run db:seed      # carga productos
npm run users:seed   # crea usuarios de prueba (admin@example.com / user@example.com)
```

5) Arrancar la aplicación
```bash
npm run dev
```
La app queda en http://localhost:3000

6) Probar la API
- Con la extensión REST Client abre `test-api.http` y usa “Send Request”, o bien:
```bash
curl -s "http://localhost:3000/api/productos?desde=1&hasta=20&ordenacion=asc" | jq
```

Listo: con estos pasos debe funcionar en cualquier portátil con Docker y Node.
