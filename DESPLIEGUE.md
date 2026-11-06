# 🚀 Despliegue de NEXOLOTE — COMPLETADO

Estado: **desplegado y verificado** (6 nov 2026).

## 🌐 URLs finales

| Componente | URL | Plataforma |
|------------|-----|------------|
| Frontend | https://nexolote.vercel.app | Vercel (proyecto `nexolote`) |
| Backend (API) | https://nexolote.onrender.com | Render (servicio `nexolote`, plan Free) |
| Base de datos | `gateway01.ap-northeast-1.prod.aws.tidbcloud.com:4000` | TiDB Cloud (Tokyo) |

**Credenciales de acceso al sistema:** `admin@nexolote.com` / `Nexolote2026!`

---

## 1. Backend en Render

### Configuración real del servicio

| Campo | Valor |
|-------|-------|
| Repositorio | `Greys1512/nexolote` (rama `main`) |
| Runtime | Node |
| **Root Directory** | `BACKEND` |
| **Build Command** | `npm install && npm run build` |
| **Start Command** | `npm run start:render` |
| Región | Oregon (US West) |
| Plan | Free ($0, 512 MB RAM) |

### Variables de entorno (10)

| Variable | Valor |
|----------|-------|
| `GATEWAY_HOST` | `0.0.0.0` ← **obligatorio** en Render (el gateway por defecto escucha en `127.0.0.1` y Render no lo expondría) |
| `DB_HOST` | `gateway01.ap-northeast-1.prod.aws.tidbcloud.com` |
| `DB_PORT` | `4000` |
| `DB_USER` | `3dgXm2rFafaZrdh.root` |
| `DB_PASSWORD` | *(secreto — ver `BACKEND/.env`)* |
| `DB_DATABASE` | `nexolote` |
| `DB_CA_CERT` | contenido del PEM de `BACKEND/certs/tidb-ca.pem` en **una sola línea** unido con `\n` literales |
| `JWT_SECRET` | *(secreto 64 hex — ver `BACKEND/.env`)* |
| `JWT_EXPIRA` | `8h` |
| `FRONTEND_ORIGIN` | `https://nexolote.vercel.app` (CORS) |

> 💡 **Sin discos ni subir el `.pem`:** el código (`database.service.ts`) acepta
> `DB_CA_CERT` (el certificado como texto) y le da prioridad sobre `DB_CA` (ruta de archivo).
> Así el plan Free de Render, que no soporta discos persistentes, funciona sin problemas.
> El separador de líneas debe ser `\n` literal (backslash + n), porque el código hace
> `.replace(/\\n/g, '\n')`.

### Guardar variables ⇒ redeploy

En Render, guardar cambios en **Environment Variables** dispara un deploy nuevo automáticamente
(botoncito **"Save, rebuild, and deploy"**).

---

## 2. Frontend en Vercel

### Configuración

- **Root Directory:** `FRONTEND`
- **Framework:** Vite (usa `FRONTEND/vercel.json`: build `npm run build`, output `dist`, rewrite SPA)
- Integración con GitHub activa: cada push a `main` despliega automáticamente.

### Variable de entorno

| Variable | Valor | Entorno |
|----------|-------|---------|
| `VITE_API_URL` | `https://nexolote.onrender.com` | Production |

> ⚠️ **Dos trampas importantes que ya te comí por ti:**
> 1. En el diálogo de Vercel, **"Add new variable" solo añade otra fila** a la lista;
>    lo que **persiste** es el botón **"Save"**. Si cierras el diálogo sin Save, la variable se pierde.
> 2. **Guardar la variable NO redespliega.** El valor se incrusta en el bundle en tiempo de build,
>    así que hay que hacer **Redeploy** (menú del deployment → Redeploy, o el botón del toast).
>    Sin eso, la app sigue llamando a `http://127.0.0.1:3000` → *"Failed to fetch"*.

### Cómo quedó el código

`FRONTEND/src/services/api.ts`:

```ts
export const API_URL =
  (import.meta.env.VITE_API_URL ?? 'http://127.0.0.1:3000').replace(/\/+$/, '');
```

En producción el bundler deja solo la URL de Render (verificado: el JS en vivo contiene
`https://nexolote.onrender.com` y ya ni siquiera aparece `127.0.0.1:3000`).

---

## 3. Problemas encontrados y soluciones (historial real)

### ❌ 1er deploy en Render: `MODULE_NOT_FOUND`
```
Error: Cannot find module '/opt/render/project/src/BACKEND/dist/apps/inventario-service/main.js'
```
**Causa:** `nest build` **sin argumentos solo construye el proyecto raíz** del monorepo
(`api-gateway`). Los otros 5 `dist/apps/*` que existían en local eran restos de builds anteriores,
nunca los generaba el build de Render.

**Solución** (`BACKEND/package.json`, commit `76fe96a`):
```json
"build": "nest build --all"
```
`--all` construye los 6 proyectos (secuencial; no usé `--parallel` para no arriesgar OOM
en la instancia Free de 512 MB).

**Verificación obligatoria tras cambiar el build:**
```powershell
cd BACKEND
Remove-Item dist -Recurse -Force   # build limpio, sin restos
npm run build
Get-ChildItem dist\apps -Directory | ForEach-Object { "$($_.Name): $(Test-Path "$($_.FullName)\main.js")" }
# Debe listar los 6 con True
```

### ❌ Login roto en producción: `Failed to fetch`
La consola mostraba `fetch ... http://127.0.0.1:3000/auth/login` bloqueado por CORS.
**Causa:** `VITE_API_URL` no existía en Vercel (no persistió en el 1er intento, ver trampa #1).
**Solución:** guardar con **Save** + **Redeploy**.

### ℹ️ `InvalidTcpDataReceptionException` en los logs de Render
Aparece cuando algo hace un handshake TCP crudo contra el puerto de un microservicio
(sonda/health-check). **Es cosmético:** el gateway responde y las APIs funcionan.

---

## 4. Verificación (realizada el 6 nov 2026)

```powershell
# 1. Gateway en vivo
curl https://nexolote.onrender.com/
# → 200 "API Gateway funcionando correctamente"

# 2. Login real contra TiDB Cloud
curl -X POST https://nexolote.onrender.com/auth/login `
  -H "Content-Type: application/json" `
  -d '{"correo":"admin@nexolote.com","password":"Nexolote2026!"}'
# → 201 { "token": "...", "usuario": {...} }

# 3. Endpoint protegido con token
curl https://nexolote.onrender.com/catalogo/productos -H "Authorization: Bearer <token>"
# → 200 [ {"id_producto":1,"nombre":"Yogur natural", ...} ]
```

**Frontend:** abrir https://nexolote.vercel.app → login con las credenciales →
dashboard con estadísticas reales de la BD, **0 errores en consola**.

---

## 5. Estructura de puertos (en Render, un solo contenedor)

| Servicio | Puerto interno |
|----------|---------------|
| catalogo-service | 3001 |
| produccion-service | 3002 |
| inventario-service | 3003 |
| mantenimiento-service | 3004 |
| auth-service | 3005 |
| api-gateway | `PORT` (asignado por Render) + `GATEWAY_HOST=0.0.0.0` |

Solo el **api-gateway** está expuesto externamente. `scripts/start-all.js` levanta los 5
microservicios, espera sus puertos (hasta 90 s) y luego el gateway.

---

## 6. Commits del despliegue

| Commit | Contenido |
|--------|-----------|
| `aec3451` | `.gitignore`, `render.yaml`, `.env.example`, docs |
| `76fe96a` | **fix:** `nest build --all` (solución al MODULE_NOT_FOUND) |

---

## 7. Comandos útiles

```powershell
# Probar conexión a TiDB desde local
cd BACKEND ; npm run db:test

# Verificar tablas
cd BACKEND ; npm run db:tables

# Build limpio de los 6 servicios
cd BACKEND ; Remove-Item dist -Recurse -Force ; npm run build

# Backend completo en local (5 microservicios + gateway)
cd BACKEND ; npm run start:render

# Frontend en local
cd FRONTEND ; npm run dev -- --host   # http://localhost:5173
```

## 📄 Paginación en los módulos del frontend

Todos los módulos con listado paginan sus tablas de a 10 registros:

| Módulo | Tabla(s) paginadas |
|--------|-------------------|
| Catálogo | Productos |
| Producción | Lotes de producción |
| Inventario | Materias primas, Lotes recibidos |
| Mantenimiento | Mantenimientos, Responsables, Incidencias |
| Usuarios | Usuarios registrados |

El componente `Pagination` (`FRONTEND/src/components/common/Pagination.tsx`) se renderiza solo cuando hay más de una página (más de 10 registros). Cada tabla mantiene su propio estado de página.

---

## ⚠️ Notas y mantenimiento

- **Plan Free de Render:** la instancia se duerme con inactividad; la primera petición tarda
  ~50 s en despertarla (después va normal).
- **Frontend dormido:** Vercel no se duerme (estático), pero el backend sí retrasa la 1ª llamada.
- Si cambias el dominio de Vercel, actualizar `FRONTEND_ORIGIN` en Render (redespliega solo).
- `.env` y `certs/*.pem` están en `.gitignore` y **no** se suben al repo; en Render el CA va
  embebido en `DB_CA_CERT`.
- **Credenciales en la documentación:** `RESUMEN_IMPLEMENTACION.md` y este repo contienen
  credenciales de TiDB y acceso. Si el repo de GitHub es **público**, rota la contraseña de TiDB
  desde la consola y actualiza `DB_PASSWORD` en Render + `BACKEND/.env`.
- Pendiente conocido: `POST /mantenimiento/registros` devolvía 500 en local
  (posible esquema de BD), no afecta al login ni al resto de módulos.
