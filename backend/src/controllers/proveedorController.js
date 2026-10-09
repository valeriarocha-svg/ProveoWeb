const proveedorRepo = require('../repositories/proveedorRepository');
const { normalizeMexicanPhone } = require('../utils/mexicanPhone');

const validImageUrl = (value) => (
  typeof value === 'string' &&
  (value.startsWith('/uploads/') || /^https?:\/\/[^\s]+$/i.test(value))
);

const isGoogleMapsUrl = (value) => {
  if (!value) return true;

  try {
    const url = new URL(value);
    return url.protocol === 'https:' &&
      (url.hostname === 'maps.google.com' ||
        url.hostname === 'maps.app.goo.gl' ||
        url.hostname === 'goo.gl' ||
        url.hostname === 'www.google.com' && url.pathname.startsWith('/maps'));
  } catch {
    return false;
  }
};

const obtenerProveedores = async (req, res) => {
  try {
    const { lat, lng, radio, cat } = req.query;
    if (!lat || !lng || !cat) {
      return res.status(400).json({ error: 'Faltan parámetros de búsqueda' });
    }

    const proveedores = await proveedorRepo.buscarProveedores(
      parseFloat(lat), parseFloat(lng), parseInt(radio) || 5000, cat
    );

    res.status(200).json({ exito: true, datos: proveedores });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

const obtenerPerfil = async (req, res) => {
  try {
    const perfil = await proveedorRepo.obtenerPerfil(req.user.id);
    return res.status(200).json(perfil || {});
  } catch (error) {
    console.error('Error al cargar perfil del proveedor:', error);
    return res.status(500).json({ error: 'No fue posible cargar el perfil.' });
  }
};

const actualizarPerfil = async (req, res) => {
  const {
    nombre, nombre_negocio: nombreNegocio, tipo_servicio: tipoServicio,
    formacion, servicio_domicilio: servicioDomicilio, colonia,
    codigo_postal: codigoPostal, foto_perfil_url: fotoPerfilUrl,
    fotos_trabajo: fotosTrabajo, solo_cotizacion: soloCotizacion,
    costo_aproximado: costoAproximado, direccion_maps: direccionMaps,
    descripcion, telefono,
  } = req.body;
  const nombreNormalizado = typeof nombre === 'string' ? nombre.trim() : '';
  const servicioNormalizado = typeof tipoServicio === 'string' ? tipoServicio.trim() : '';
  const coloniaNormalizada = typeof colonia === 'string' ? colonia.trim() : '';
  const codigoPostalNormalizado = typeof codigoPostal === 'string' ? codigoPostal.trim() : '';
  const telefonoIngresado = typeof telefono === 'string' ? telefono : '';
  const telefonoNormalizado = telefonoIngresado.trim() ? normalizeMexicanPhone(telefonoIngresado) : null;
  const fotoPerfil = typeof fotoPerfilUrl === 'string' ? fotoPerfilUrl.trim() : '';
  if (!Array.isArray(fotosTrabajo)) {
    return res.status(400).json({ error: 'Las fotos de trabajo deben enviarse como una lista.' });
  }
  const imagenesTrabajo = fotosTrabajo;
  const mapsUrl = typeof direccionMaps === 'string' ? direccionMaps.trim() : '';
  const descripcionNormalizada = typeof descripcion === 'string' ? descripcion.trim() : '';
  const formacionNormalizada = typeof formacion === 'string' ? formacion.trim() : '';
  const negocioNormalizado = typeof nombreNegocio === 'string' ? nombreNegocio.trim() : '';

  if (!nombreNormalizado || nombreNormalizado.length > 100) {
    return res.status(400).json({ error: 'El nombre de la persona es obligatorio y no debe superar 100 caracteres.' });
  }
  if (!servicioNormalizado || servicioNormalizado.length > 150) {
    return res.status(400).json({ error: 'El tipo de servicio es obligatorio y no debe superar 150 caracteres.' });
  }
  if (typeof servicioDomicilio !== 'boolean') {
    return res.status(400).json({ error: 'Indica si ofreces servicio a domicilio.' });
  }
  if (!coloniaNormalizada || coloniaNormalizada.length > 150) {
    return res.status(400).json({ error: 'La colonia es obligatoria y no debe superar 150 caracteres.' });
  }
  if (!/^\d{5}$/.test(codigoPostalNormalizado)) {
    return res.status(400).json({ error: 'Ingresa un código postal mexicano de cinco dígitos.' });
  }
  if (!validImageUrl(fotoPerfil)) {
    return res.status(400).json({ error: 'Sube una foto de perfil válida para continuar.' });
  }
  if (imagenesTrabajo.length > 5 || !imagenesTrabajo.every(validImageUrl)) {
    return res.status(400).json({ error: 'Puedes agregar hasta cinco fotos de trabajo válidas.' });
  }
  if (typeof soloCotizacion !== 'boolean') {
    return res.status(400).json({ error: 'Indica si trabajas bajo cotización o si mostrarás un costo aproximado.' });
  }
  const costo = costoAproximado === '' || costoAproximado == null ? null : Number(costoAproximado);
  if (soloCotizacion ? costo !== null : !Number.isFinite(costo) || costo <= 0) {
    return res.status(400).json({
      error: soloCotizacion
        ? 'No incluyas un costo cuando el servicio es bajo cotización.'
        : 'Ingresa un costo aproximado mayor que cero.',
    });
  }
  if (!isGoogleMapsUrl(mapsUrl)) {
    return res.status(400).json({ error: 'Ingresa un enlace HTTPS válido de Google Maps.' });
  }
  if (negocioNormalizado.length > 150 || formacionNormalizada.length > 500 ||
      descripcionNormalizada.length > 5000 || telefonoIngresado.length > 20) {
    return res.status(400).json({ error: 'Uno o más campos superan la longitud permitida.' });
  }
  if (telefono != null && typeof telefono !== 'string') {
    return res.status(400).json({ error: 'El teléfono debe enviarse como texto.' });
  }
  if (telefonoIngresado.trim() && !telefonoNormalizado) {
    return res.status(400).json({ error: 'Ingresa un teléfono mexicano válido de 10 dígitos, con o sin el prefijo +52.' });
  }

  try {
    const perfil = await proveedorRepo.guardarPerfil(req.user.id, {
      nombre: nombreNormalizado,
      nombre_negocio: negocioNormalizado || null,
      tipo_servicio: servicioNormalizado,
      formacion: formacionNormalizada || null,
      servicio_domicilio: servicioDomicilio,
      colonia: coloniaNormalizada,
      codigo_postal: codigoPostalNormalizado,
      foto_perfil_url: fotoPerfil,
      fotos_trabajo: imagenesTrabajo,
      solo_cotizacion: soloCotizacion,
      costo_aproximado: soloCotizacion ? null : costo,
      direccion_maps: mapsUrl || null,
      descripcion: descripcionNormalizada || null,
      telefono: telefonoNormalizado,
    });
    return res.status(200).json(perfil);
  } catch (error) {
    if (error.code === '23505' && error.constraint === 'usuarios_telefono_unique_idx') {
      return res.status(409).json({ error: 'Ese teléfono ya está asociado a otra cuenta.' });
    }
    console.error('Error al guardar perfil del proveedor:', error);
    return res.status(500).json({ error: 'No fue posible guardar el perfil.' });
  }
};

const subirImagenesPerfil = (req, res) => {
  const files = req.files || {};
  return res.status(201).json({
    foto_perfil_url: files.foto_perfil?.[0]?.publicUrl || null,
    fotos_trabajo: (files.fotos_trabajo || []).map((file) => file.publicUrl),
  });
};

module.exports = { obtenerProveedores, obtenerPerfil, actualizarPerfil, subirImagenesPerfil };