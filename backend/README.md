# Backend local

## Configuración

El backend carga `PORT` y `DATABASE_URL` desde el `.env` de la raíz. También requiere `JWT_SECRET`, que se lee primero del entorno y después de `backend/.env.local`. Genera una clave local con:

```powershell
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

Guarda el resultado como `JWT_SECRET=...` en `backend/.env.local`. Ese archivo está ignorado por Git; no guardes ni publiques secretos en archivos versionados.

La base debe tener las tablas descritas en `migrations/tablas_respaldo` y PostGIS instalado. Para una base existente, ejecuta estas migraciones en orden:

```powershell
psql $env:DATABASE_URL -f backend/migrations/20261009_perfil_proveedor_sin_titulo.sql
psql $env:DATABASE_URL -f backend/migrations/20261009_unique_user_contacts.sql
psql $env:DATABASE_URL -f backend/migrations/20261009_proveedor_profile_details.sql
psql $env:DATABASE_URL -f backend/migrations/20261009_proveedor_profile_details.sql
```

La segunda migración impide registrar emails duplicados ignorando mayúsculas y teléfonos duplicados en su formato normalizado.

Las imágenes de perfiles y trabajos se guardan localmente en `backend/uploads/` (JPG, PNG o WEBP, máximo 5 MB por archivo); el directorio está excluido de Git. Para producción con varias instancias o almacenamiento efímero, configura almacenamiento de objetos persistente.

El registro todavía no confirma que la persona controle el correo o el teléfono. Para habilitar esa verificación se necesita configurar un proveedor de correo y uno de SMS, junto con sus credenciales y el flujo de confirmación correspondiente.

## Arranque

Desde la raíz del repositorio:

```powershell
npm --prefix backend start
npm --prefix frontend run dev
```

Registro y login están en `/api/v1/auth/registro` y `/api/v1/auth/login`. El perfil del proveedor usa `GET` y `PUT /api/v1/proveedores/perfil` con un token Bearer.
