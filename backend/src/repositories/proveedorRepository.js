const db = require('../db');

const buscarProveedores = async (latitud, longitud, radioMetros, categoria) => {
  const result = await db.query(
    'SELECT * FROM buscar_proveedores_cercanos($1, $2, $3, $4)',
    [latitud, longitud, radioMetros, categoria]
  );
  return result.rows;
};

const obtenerPerfil = async (usuarioId) => {
  const result = await db.query(
    `SELECT u.nombre, p.nombre_negocio, p.tipo_servicio, p.formacion,
            p.servicio_domicilio, p.colonia, p.codigo_postal, p.foto_perfil_url,
            p.fotos_trabajo, p.solo_cotizacion, p.costo_aproximado,
            p.direccion_maps, p.descripcion, p.telefono
     FROM perfiles_proveedor p
     JOIN usuarios u ON u.id = p.usuario_id
     WHERE p.usuario_id = $1`,
    [usuarioId]
  );

  return result.rows[0] || null;
};

const guardarPerfil = async (usuarioId, perfil) => {
  return db.transaction(async (client) => {
    await client.query(
      'UPDATE usuarios SET nombre = $1, telefono = $2 WHERE id = $3',
      [perfil.nombre, perfil.telefono, usuarioId]
    );

    const result = await client.query(
      `INSERT INTO perfiles_proveedor (
         usuario_id, nombre_negocio, tipo_servicio, formacion, servicio_domicilio,
         colonia, codigo_postal, foto_perfil_url, fotos_trabajo, solo_cotizacion,
         costo_aproximado, direccion_maps, descripcion, telefono
       )
       VALUES ($1, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $2)
       ON CONFLICT (usuario_id) DO UPDATE SET
         nombre_negocio = EXCLUDED.nombre_negocio,
         tipo_servicio = EXCLUDED.tipo_servicio,
         formacion = EXCLUDED.formacion,
         servicio_domicilio = EXCLUDED.servicio_domicilio,
         colonia = EXCLUDED.colonia,
         codigo_postal = EXCLUDED.codigo_postal,
         foto_perfil_url = EXCLUDED.foto_perfil_url,
         fotos_trabajo = EXCLUDED.fotos_trabajo,
         solo_cotizacion = EXCLUDED.solo_cotizacion,
         costo_aproximado = EXCLUDED.costo_aproximado,
         direccion_maps = EXCLUDED.direccion_maps,
         descripcion = EXCLUDED.descripcion,
         telefono = EXCLUDED.telefono
       RETURNING nombre_negocio, tipo_servicio, formacion, servicio_domicilio,
                 colonia, codigo_postal, foto_perfil_url, fotos_trabajo,
                 solo_cotizacion, costo_aproximado, direccion_maps, descripcion, telefono`,
      [
        usuarioId,
        perfil.telefono,
        perfil.nombre_negocio,
        perfil.tipo_servicio,
        perfil.formacion,
        perfil.servicio_domicilio,
        perfil.colonia,
        perfil.codigo_postal,
        perfil.foto_perfil_url,
        perfil.fotos_trabajo,
        perfil.solo_cotizacion,
        perfil.costo_aproximado,
        perfil.direccion_maps,
        perfil.descripcion,
      ]
    );

    return { nombre: perfil.nombre, ...result.rows[0] };
  });
};

module.exports = { buscarProveedores, obtenerPerfil, guardarPerfil };
