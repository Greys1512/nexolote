# 📋 RESUMEN DE IMPLEMENTACIÓN - NEXOLOTE

## 🎯 Objetivo
Conectar los microservicios del backend a una base de datos TiDB Cloud y completar la autenticación JWT, modales de registro y tablas mejoradas en el frontend.

---

## 🗄️ BASE DE DATOS - TiDB Cloud

### Cluster
- **Nombre:** NEXOLOTE
- **Estado:** Active
- **Plan:** Starter
- **Región:** Tokyo (ap-northeast-1)
- **Proveedor:** AWS
- **Host:** `gateway01.ap-northeast-1.prod.aws.tidbcloud.com`
- **Puerto:** 4000 (TLS obligatorio)

### Credenciales de conexión
| Campo | Valor |
|-------|-------|
| Usuario | `3dgXm2rFafaZrdh.root` |
| Contraseña | `sqcbqDdCAIHTo8ST` (generada en consola TiDB) |
| Base de datos | `nexolote` |
| Certificado CA | `certs/tidb-ca.pem` (ISRG Root X1) |

### Tablas en la base de datos (14 tablas)
1. consumomateriaprima (12 filas)
2. equipo (6 filas)
3. incidencia (3 filas)
4. lotemateriaprima (10 filas)
5. loteproduccion (6 filas)
6. mantenimiento (4 filas)
7. materiaprima (8 filas)
8. movimientolote (6 filas)
9. producto (6 filas)
10. proveedor (5 filas)
11. responsable (5 filas)
12. ubicacion (6 filas)
13. usoequipolote (8 filas)
14. **usuario** (1 fila - recién creada)

### Tabla `usuario` (creada durante esta sesión)
```sql
CREATE TABLE usuario (
  id_usuario INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  correo VARCHAR(150) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  rol VARCHAR(50) NOT NULL,
  estado VARCHAR(20) NOT NULL DEFAULT 'Activo'
);
```

**Credenciales de acceso:**
| Campo | Valor |
|-------|-------|
| Correo | `admin@nexolote.com` |
| Contraseña | `Nexolote2026!` |
| Rol | `Administrador` |
| Hash | bcrypt (cost 10) |

---

## 🔧 BACKEND - NestJS Monorepo

### Estructura de microservicios (6 servicios)

| Servicio | Puerto | Archivo principal |
|----------|--------|-------------------|
| api-gateway | 3000 | `dist/apps/api-gateway/main` |
| catalogo-service | 3001 | `dist/apps/catalogo-service/main` |
| produccion-service | 3002 | `dist/apps/produccion-service/main` |
| inventario-service | 3003 | `dist/apps/inventario-service/main` |
| mantenimiento-service | 3004 | `dist/apps/mantenimiento-service/main` |
| **auth-service** | **3005** | **`dist/apps/auth-service/main`** (nuevo) |

### Configuración (`BACKEND/.env`)
```env
# TiDB Cloud
DB_HOST=gateway01.ap-northeast-1.prod.aws.tidbcloud.com
DB_PORT=4000
DB_USER=3dgXm2rFafaZrdh.root
DB_PASSWORD=sqcbqDdCAIHTo8ST
DB_DATABASE=nexolote
DB_CA=./certs/tidb-ca.pem

# JWT
JWT_SECRET=<secreto_64_caracteres_hex>
JWT_EXPIRA=8h
```

### Cambios en `database.service.ts` (5 servicios + auth-service)
- Lectura de `BACKEND/.env` mediante búsqueda hacia arriba desde `__dirname`
- Conexión TLS con certificado CA de TiDB
- `enableKeepAlive`, `idleTimeout: 30s`, `maxIdle: 5` para TiDB Serverless
- **Reintento automático** ante errores de conexión (`ECONNRESET`, `ETIMEDOUT`, etc.)

### Nuevo microservicio: `auth-service`
- Archivos creados: `main.ts`, `auth-service.module.ts`, `auth-service.controller.ts`, `auth-service.service.ts`, `tsconfig.app.json`
- Endpoints (MessagePattern):
  - `auth.login` - Valida credenciales y devuelve datos del usuario
  - `auth.usuario.por-id` - Consulta usuario por ID (sin password_hash)
- Registrado en `nest-cli.json` y `tsconfig.json`

### API Gateway - Nuevos endpoints POST
| Endpoint | Método | Microservicio |
|----------|--------|---------------|
| `/auth/login` | POST | auth-service |
| `/auth/perfil` | GET | auth-service |
| `/catalogo/productos` | POST | catalogo-service |
| `/produccion/lotes` | POST | produccion-service |
| `/inventario/entrada` | POST | inventario-service |
| `/mantenimiento/registros` | POST | mantenimiento-service |

### Autenticación JWT
- `@nestjs/jwt` instalado
- `JwtAuthGuard` - Guarda global que requiere token en todos los endpoints excepto los marcados con `@Publico()`
- `RolesGuard` - Guarda para control de acceso por roles
- Decoradores `@Publico()` y `@Roles(...)`
- El token se firma con `JWT_SECRET` y expira en 8 horas

---

## 🎨 FRONTEND - React + Vite

### Estructura
```
FRONTEND/src/
├── App.tsx          (reescrito completamente)
├── App.css          (rediseño completo)
├── api.ts           (nuevo - cliente HTTP con token)
├── Login            (componente de login real)
├── Modal            (componente genérico de modal)
└── ...
```

### Cambios principales

#### 1. `api.ts` (nuevo archivo)
Cliente HTTP que:
- Incluye automáticamente `Authorization: Bearer <token>` en cada petición
- Detecta respuestas 401 (token expirado) y limpia la sesión
- Lanza `window.location.reload()` para volver al login

#### 2. Autenticación real
- Se eliminaron los mocks (`MOCK_CREDENTIALS`, `MOCK_TOKEN`, `MOCK_USER`)
- Login llama a `POST /auth/login` de la API
- Credenciales válidas: `admin@nexolote.com` / `Nexolote2026!`
- El token y usuario se guardan en `localStorage`
- Al cerrar sesión se limpia `localStorage` y se vuelve al login

#### 3. Sidebar estático
- Siempre visible en el lateral izquierdo (ya no se oculta)
- Sin animación de abrir/cerrar
- Contiene: logo, menú principal, estado del sistema, versión

#### 4. Navbar funcional
- Barra fija superior con efecto glassmorphism (backdrop blur)
- Título de página dinámico según módulo activo
- Buscador con estado activo
- Botón de notificaciones con badge rojo
- **Menú de perfil desplegable:** muestra nombre y rol, opción "Cerrar sesión"
- Se cierra al hacer clic fuera del menú

#### 5. Tablas mejoradas
- Contenedor con scroll horizontal (`.table-wrapper`)
- Encabezados con fondo gris y texto mayúscula
- Filas con hover effect
- Columnas con `white-space: nowrap`
- Badges de estado con colores (completed/pending/processing)

#### 6. Modales de registro (uno por módulo)
Cada módulo tiene un botón "Agregar" que abre un modal con formulario:

| Módulo | Botón | Campos del formulario |
|--------|-------|----------------------|
| Catálogo | Agregar producto | Nombre, Descripción, Unidad de medida, Estado |
| Producción | Agregar lote | Código, Producto (select), Responsable (select), Fechas, Cantidad, Estado |
| Inventario | Registrar entrada | Materia prima (select), Proveedor (select), Ubicación (select), Fechas, Cantidad |
| Mantenimiento | Agregar mantenimiento | Equipo (select), Responsable (select), Fecha, Tipo, Descripción, Costo, Estado |

Los modales:
- Se abren con animación
- Tienen overlay oscuro con blur
- Se cierran con X, clic fuera, o botón Cancelar
- Muestran estado de guardado y alerta de éxito al completar
- Se cierran automáticamente tras guardar exitosamente

#### 7. Dashboard
- Estadísticas en tiempo real desde la BD (no valores hardcodeados)
- Gráfico de barras de actividad semanal
- Tabla de actividad reciente

---

## 📦 Archivos nuevos o modificados

### Backend
| Archivo | Acción |
|---------|--------|
| `BACKEND/.env` | Creado (credenciales TiDB + JWT) |
| `BACKEND/certs/tidb-ca.pem` | Creado (certificado CA) |
| `BACKEND/apps/auth-service/` | Creado (microservicio completo) |
| `BACKEND/apps/auth-service/src/database/` | Copiado de catalogo-service |
| `BACKEND/apps/*/src/database/database.service.ts` | Modificado (5 servicios) - TLS, env, retry |
| `BACKEND/apps/api-gateway/src/api-gateway.module.ts` | Modificado - AUTH_SERVICE, JWT, guards |
| `BACKEND/apps/api-gateway/src/api-gateway.service.ts` | Modificado - métodos crearLote, registrarEntrada, crearMantenimiento |
| `BACKEND/apps/api-gateway/src/api-gateway.controller.ts` | Modificado - endpoints POST |
| `BACKEND/apps/api-gateway/src/auth/` | Creado (guard, decoradores, env, controller) |
| `BACKEND/apps/mantenimiento-service/src/mantenimiento-service.service.ts` | Modificado - crearMantenimiento |
| `BACKEND/apps/mantenimiento-service/src/mantenimiento-service.controller.ts` | Modificado - patrón mantenimiento.registrar |
| `BACKEND/nest-cli.json` | Modificado - proyecto auth-service |
| `BACKEND/tsconfig.json` | Modificado - referencia auth-service |
| `BACKEND/package.json` | Modificado - scripts db:test, db:tables |
| `BACKEND/scripts/test-db-connection.ts` | Creado |
| `BACKEND/scripts/check-tables.ts` | Creado |
| `BACKEND/scripts/create-usuario.ts` | Creado |

### Frontend
| Archivo | Acción |
|---------|--------|
| `FRONTEND/src/api.ts` | Creado (cliente HTTP con token) |
| `FRONTEND/src/App.tsx` | Reescrito completo (modales, auth real, tablas) |
| `FRONTEND/src/App.css` | Rediseño completo (moderno, responsive, modales, botones, alertas) |

---

## 🚀 Cómo ejecutar

### Backend (ya corriendo)
Los 6 servicios están ejecutándose en puertos 3000-3005. Para reiniciar:
```powershell
cd C:\xampp\htdocs\NEXOLOTE\BACKEND
# Cada servicio se inicia con:
node --enable-source-maps dist/apps/<servicio>/main
```

### Frontend (ya corriendo)
```powershell
cd C:\xampp\htdocs\NEXOLOTE\FRONTEND
npm run dev -- --host
```
Acceder en: `http://localhost:5173`

### Credenciales de prueba
| Campo | Valor |
|-------|-------|
| URL | `http://localhost:5173` |
| Correo | `admin@nexolote.com` |
| Contraseña | `Nexolote2026!` |

---

## ☁️ DESPLIEGUE EN LA NUBE — COMPLETADO (6 nov 2026)

### URLs finales
| Componente | URL | Plataforma |
|------------|-----|------------|
| Frontend | https://nexolote.vercel.app | Vercel (proyecto `nexolote`) |
| Backend (API) | https://nexolote.onrender.com | Render (servicio `nexolote`, plan Free) |
| Base de datos | `gateway01.ap-northeast-1.prod.aws.tidbcloud.com:4000` | TiDB Cloud (Tokyo) |

**Acceso en producción:** `admin@nexolote.com` / `Nexolote2026!`

### Configuración del despliegue
- **Render:** Root Directory `BACKEND`, build `npm install && npm run build`, start `npm run start:render`, plan Free (512 MB, se duerme con inactividad ~50 s).
- **Vercel:** Root Directory `FRONTEND`, build Vite automático, integración GitHub (deploy en cada push a `main`).
- **Variables en Render (10):** `GATEWAY_HOST=0.0.0.0`, `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_DATABASE`, `DB_CA_CERT` (PEM embebido, sin disco), `JWT_SECRET`, `JWT_EXPIRA`, `FRONTEND_ORIGIN=https://nexolote.vercel.app`.
- **Variable en Vercel:** `VITE_API_URL=https://nexolote.onrender.com` (Production) — hace que `src/services/api.ts` apunte a Render en vez de `127.0.0.1:3000`.

### Problemas resueltos durante el despliegue
1. **`MODULE_NOT_FOUND` en Render** → `nest build` sin argumentos solo compila `api-gateway` en un monorepo. Fix: script `"build": "nest build --all"` (commit `76fe96a`), verificado con build limpio de los 6 apps.
2. **Gateway no expuesto** → añadido `GATEWAY_HOST=0.0.0.0` (por defecto escucha `127.0.0.1`, invisible para Render).
3. **Certificado TLS sin disco persistente** → se usa `DB_CA_CERT` (PEM como variable de entorno) en lugar de `DB_CA` (ruta de archivo), por lo que el plan Free sin discos funciona.
4. **`VITE_API_URL` no se guardaba en Vercel** → en el diálogo, **"Add new variable" solo agrega una fila**; lo que persiste es **"Save"**. Además, guardar la variable **no redespliega** → hizo falta **Redeploy** manual para que Vite la incruste en el bundle.
5. **CORS en producción** → `FRONTEND_ORIGIN=https://nexolote.vercel.app` en Render.

### Verificación final (6 nov 2026)
- `GET /` → 200 `"API Gateway funcionando correctamente"`
- `POST /auth/login` → 201 con `token` + `usuario` (bcrypt contra TiDB)
- `GET /catalogo/productos` con Bearer → 200 con productos reales
- Login en https://nexolote.vercel.app → dashboard con estadísticas reales, **0 errores en consola**
- Bundle en producción contiene `https://nexolote.onrender.com` (sin rastro de `127.0.0.1:3000`)

Guía completa paso a paso: ver **`DESPLIEGUE.md`**.

### Paginación del frontend
Todos los módulos con listado (Catálogo, Producción, Inventario, Mantenimiento, Usuarios) paginan sus tablas de a 10 registros usando el componente `Pagination`. El paginador solo se muestra cuando hay más de una página de resultados.

---

## ⚠️ Notas
- El archivo `.env` está en `.gitignore` y no se sube a git
- El certificado CA debe mantenerse en `BACKEND/certs/tidb-ca.pem`
- El endpoint `/mantenimiento/registros` POST devuelve 500 - posible problema de esquema de BD (tabla o columna faltante), requiere revisión adicional
- Node.js v24.19.0 utilizado para `process.loadEnvFile()`