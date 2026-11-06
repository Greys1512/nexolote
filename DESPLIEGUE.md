# 🚀 Despliegue de NEXOLOTE

Esta guía describe cómo desplegar el backend en **Render** y el frontend en **Vercel**.

## 📋 Prerrequisitos

- Cuenta en [Render](https://render.com)
- Cuenta en [Vercel](https://vercel.com)
- Certificado CA de TiDB Cloud (`certs/tidb-ca.pem`) ya descargado en `BACKEND/certs/`
- Contraseña de TiDB Cloud generada desde la consola

---

## 1. Backend en Render

### 1.1 Subir el certificado CA

Render usa un disco persistente para los certificados. Sube `BACKEND/certs/tidb-ca.pem` al disco montado en `/opt/render/project/src/certs/` o inclúyelo en el repositorio si es seguro.

### 1.2 Crear el servicio web en Render

1. Ve a [Render Dashboard](https://dashboard.render.com/)
2. Haz clic en **"New +" → "Web Service"**
3. Conecta tu repositorio de GitHub con el código de NEXOLOTE
4. Configura:
   - **Runtime:** Node
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm run start:render`
   - **Instance Type:** Starter (o superior)

### 1.3 Variables de entorno en Render

Agrega las siguientes variables en la sección **Environment Variables** de Render:

| Variable | Valor | Ejemplo |
|----------|-------|---------|
| `DB_HOST` | `gateway01.ap-northeast-1.prod.aws.tidbcloud.com` | fijado |
| `DB_PORT` | `4000` | fijado |
| `DB_USER` | `3dgXm2rFafaZrdh.root` | fijado |
| `DB_PASSWORD` | *(secreto)* | `sqcbqDdCAIHTo8ST` |
| `DB_DATABASE` | `nexolote` | fijado |
| `DB_CA` | `./certs/tidb-ca.pem` | fijado |
| `JWT_SECRET` | *(secreto, mínimo 32 chars)* | genera uno con `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` |
| `JWT_EXPIRA` | `8h` | fijado |
| `FRONTEND_ORIGIN` | URL de tu frontend en Vercel | `https://tu-proyecto.vercel.app` |

### 1.4 Desplegar

Haz clic en **"Create Web Service"**. Render construirá e iniciará automáticamente.

El backend estará disponible en: `https://nexolote-backend.onrender.com`

---

## 2. Frontend en Vercel

### 2.1 Conectar el repositorio

1. Ve a [Vercel Dashboard](https://vercel.com/dashboard)
2. Haz clic en **"Add New → Project"**
3. Importa tu repositorio de GitHub
4. Selecciona la carpeta `FRONTEND` como root directory (o configura el monorepo)

### 2.2 Configurar Vercel

El archivo `FRONTEND/vercel.json` ya está configurado:

```json
{
  "framework": "vite",
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

### 2.3 Variables de entorno en Vercel

Agrega en **Settings → Environment Variables**:

| Variable | Valor |
|----------|-------|
| `VITE_API_URL` | `https://nexolote-backend.onrender.com` |

> ⚠️ **Importante:** El frontend usa `apiFetch` que apunta a `http://127.0.0.1:3000` en desarrollo. Para producción, necesitas actualizar `FRONTEND/src/api.ts` para que use `VITE_API_URL` cuando esté en producción.

### 2.4 Desplegar

Haz clic en **"Deploy"**. Vercel construirá e iniciará el frontend.

---

## 3. Actualizar CORS en el backend

Una vez que tengas la URL de tu frontend en Vercel, agrega esa URL a la variable `FRONTEND_ORIGIN` en Render para permitir CORS correctamente.

---

## 4. Verificación

### Backend
```bash
curl https://nexolote-backend.onrender.com/
# Respuesta esperada: "API Gateway funcionando correctamente"
```

### Frontend
- Abre `https://tu-proyecto.vercel.app`
- Inicia sesión con:
  - Correo: `admin@nexolote.com`
  - Contraseña: `Nexolote2026!`

---

## 5. Estructura de puertos

Internamente en Render, el backend ejecuta 6 microservicios en un solo contenedor:

| Servicio | Puerto interno |
|----------|---------------|
| catalogo-service | 3001 |
| produccion-service | 3002 |
| inventario-service | 3003 |
| mantenimiento-service | 3004 |
| auth-service | 3005 |
| api-gateway | `PORT` (asignado por Render) |

Solo el **api-gateway** está expuesto externamente.

---

## 6. Comandos útiles

```bash
# Probar conexión a TiDB desde local
cd BACKEND
npm run db:test

# Verificar tablas
npm run db:tables

# Build completo
npm run build

# Iniciar en modo producción local
npm run start:render
```
