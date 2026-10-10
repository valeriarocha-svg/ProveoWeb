# Proveo

Aplicación web para conectar clientes con proveedores de servicios. El repositorio contiene una interfaz React/Vite y una API Node.js/Express con PostgreSQL.

## Cambios documentados por historia de usuario

### HU 01: Registro e inicio de sesión

**Objetivo:** permitir que clientes y proveedores creen una cuenta e inicien sesión con el tipo de cuenta correspondiente.

- El formulario de registro permite elegir entre los roles `cliente` y `proveedor` y solicita nombre, correo, teléfono y contraseña.
- La API normaliza el correo y el teléfono mexicano antes de guardarlos. Rechaza correos o teléfonos que ya pertenecen a otra cuenta; hay índices únicos en la base de datos para reforzar esta validación.
- La contraseña se valida en el navegador y en el servidor: debe tener entre 10 y 18 caracteres e incluir una mayúscula, un número y un símbolo. Este requisito es más estricto que el mínimo de ocho caracteres planteado inicialmente.
- Las contraseñas se guardan como hash y no en texto plano. El inicio de sesión valida las credenciales, el rol elegido y que la cuenta esté activa.
- Al iniciar sesión, la API entrega un token JWT con vigencia de siete días. La interfaz conserva el token y los datos públicos de la cuenta en el almacenamiento local; los proveedores van a `/perfil` y los clientes a la página de inicio.
- Los errores de validación, credenciales y duplicados se muestran en los formularios. Se incluye un control para mostrar u ocultar la contraseña.

**API:** `POST /api/v1/auth/registro` y `POST /api/v1/auth/login`.

**Alcance pendiente:** el registro no verifica todavía que la persona controle su correo o teléfono; para ello se requiere integrar servicios de correo/SMS y el flujo de confirmación.

### HU 03: Creación y edición del perfil de proveedor

**Objetivo:** permitir que un proveedor complete y actualice la información con la que presenta sus servicios.

- La ruta `/perfil` carga el perfil del proveedor autenticado y permite guardar cambios. Si no hay sesión válida, se redirige al inicio de sesión; una cuenta que no sea proveedora vuelve a la página de inicio.
- El formulario incluye nombre, nombre del negocio, tipo de servicio/oficio, formación o experiencia, descripción, servicio a domicilio, colonia, código postal, teléfono, precio o cotización, enlace de Google Maps, foto de perfil y hasta cinco fotos de trabajos.
- Se validan en el servidor los campos obligatorios, longitudes, código postal mexicano de cinco dígitos, teléfono, URL de Google Maps, formato y cantidad de imágenes, y la relación entre la opción de cotización y el costo.
- Las imágenes aceptadas son JPG, PNG o WEBP, con un máximo de 5 MB cada una. Se guardan en `backend/uploads/`, que no se versiona; la interfaz muestra vistas previas y permite quitar imágenes de la galería antes de guardar.
- El perfil se consulta y actualiza con `GET` y `PUT /api/v1/proveedores/perfil`; la carga de imágenes usa `POST /api/v1/proveedores/perfil/imagenes`. Las rutas del perfil requieren token Bearer y rol de proveedor. La respuesta de guardado devuelve los datos actualizados.
- La API también ofrece `GET /api/v1/proveedores/buscar` para buscar por ubicación, radio y categoría. La barra de búsqueda está presente en la interfaz, pero aún no está conectada a este endpoint.
- Las migraciones agregan campos de perfil e índices únicos para correo y teléfono. La configuración y el orden de aplicación se describen en [backend/README.md](backend/README.md).

**Nota de alcance:** el repositorio incluye el formulario de edición y la API que persiste y devuelve el perfil, pero la interfaz actual no tiene una página pública independiente para visualizarlo. Por tanto, la visualización pública inmediata aún no está cubierta por la aplicación.

### HU 04: Interfaz inicial general (Layout)

**Objetivo:** proporcionar una estructura común de navegación y una experiencia visual consistente.

- La aplicación usa React Router y comparte la barra de navegación en las vistas de inicio, registro, inicio de sesión y perfil.
- La barra incorpora la marca y el logotipo de Proveo, accesos para iniciar sesión y registrarse cuando no hay sesión, y saludo, enlace al perfil de proveedor y cierre de sesión cuando la hay.
- La navegación y los formularios usan estilos utilitarios Tailwind con una paleta coherente azul/gris, estados de carga y mensajes de error o confirmación.
- Los formularios reorganizan sus campos con rejillas adaptables y la navegación oculta el área de búsqueda en pantallas pequeñas para adecuarse a móviles y escritorio. El campo de búsqueda es visual; no inicia una búsqueda desde la interfaz actual.

## Estructura y tecnologías

- `frontend/`: interfaz React, Vite, React Router y Tailwind CSS.
- `backend/`: API Express, PostgreSQL, autenticación JWT, hash de contraseñas y carga de imágenes.
- `backend/migrations/`: cambios incrementales al esquema de la base de datos.
- `backend/test/`: pruebas unitarias de la política de contraseñas y normalización de teléfonos mexicanos.

## Desarrollo local

Instala las dependencias con `npm install` en `backend/` y `frontend/`. Configura la base PostgreSQL, las variables de entorno y ejecuta las migraciones siguiendo [backend/README.md](backend/README.md). Después, desde la raíz:

```powershell
npm --prefix backend start
npm --prefix frontend run dev
```

Las pruebas unitarias del backend se ejecutan con:

```powershell
npm --prefix backend test
```
