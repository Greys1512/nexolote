# Despliegue de NEXOLOTE

La configuración publica el frontend como sitio estático en Vercel y el API
en un único Web Service de Render. Render inicia el gateway y los cinco
microservicios en el mismo servicio; los microservicios solo escuchan en
loopback y no quedan expuestos a Internet.

## 1. Preparar GitHub

1. Crea un repositorio **privado** en GitHub y conecta este proyecto.
2. No subas `.env`, certificados, `RESPALDOS/` ni el resumen técnico local.
   Las reglas de `.gitignore` excluyen estos archivos.
3. Si credenciales de TiDB se compartieron o subieron antes, cámbialas en
   TiDB Cloud antes de desplegar. Configura un `JWT_SECRET` nuevo en Render.

## 2. Publicar el frontend en Vercel

1. Importa el repositorio en Vercel.
2. Define **Root Directory** como `FRONTEND` y usa el preset Vite.
   `FRONTEND/vercel.json` configura el build, `dist` y la navegación SPA.
3. Despliega una primera vez para obtener el dominio de Vercel, por ejemplo
   `https://nexolote.vercel.app`.

## 3. Publicar el backend en Render

1. Crea un Blueprint en Render desde el repositorio. Usa el archivo
   `render.yaml` de la raíz; configura un Web Service llamado
   `nexolote-api`.
2. En la primera sincronización, introduce los valores de TiDB Cloud para
   `DB_HOST`, `DB_USER`, `DB_PASSWORD` y `DB_DATABASE`.
3. En `DB_CA_CERT`, pega el certificado CA de TiDB. Render lo guarda como
   variable privada; no lo agregues al repositorio.
4. En `FRONTEND_ORIGIN`, introduce el dominio exacto de producción de
   Vercel, incluyendo `https://` y sin `/` al final.
5. Espera el estado **Live** y prueba el endpoint de salud abriendo la raíz
   del dominio `onrender.com`.

Render genera `JWT_SECRET` automáticamente. No reemplaces ese valor por uno
publicado en documentación o control de versiones.

## 4. Conectar Vercel con el API

1. En Vercel, agrega la variable de entorno de producción
   `VITE_API_URL=https://<dominio-del-api>.onrender.com`.
2. Vuelve a desplegar Vercel para que Vite incorpore la URL en el frontend.
3. Prueba el login y las consultas de cada módulo. Si cambias el dominio de
   Vercel, actualiza `FRONTEND_ORIGIN` en Render y vuelve a desplegar el API.

## Notas

- El plan gratuito de Render puede suspender el backend cuando queda inactivo;
  la primera solicitud posterior tarda en reactivarlo. No es adecuado para
  producción con disponibilidad continua.
- Si Render detiene el servicio por memoria, cambia el plan del Web Service a
  uno con más memoria. El servicio ejecuta seis procesos NestJS.
- La URL del API es pública, pero los microservicios TCP escuchan solo en
  `127.0.0.1`; el gateway es el único proceso expuesto.
