import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const emptyProfile = {
  nombre: '',
  nombre_negocio: '',
  tipo_servicio: '',
  formacion: '',
  servicio_domicilio: null,
  colonia: '',
  codigo_postal: '',
  foto_perfil_url: '',
  fotos_trabajo: [],
  solo_cotizacion: null,
  costo_aproximado: '',
  direccion_maps: '',
  descripcion: '',
  telefono: '',
};

const imageUrl = (path) => {
  if (!path) return '';
  if (/^https?:\/\//i.test(path)) return path;
  return `${new URL(api.defaults.baseURL).origin}${path}`;
};

const ProfileEdit = () => {
  const navigate = useNavigate();
  const [perfil, setPerfil] = useState(emptyProfile);
  const [fotoPerfil, setFotoPerfil] = useState(null);
  const [fotosTrabajoNuevas, setFotosTrabajoNuevas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    let user = null;
    try {
      user = JSON.parse(localStorage.getItem('user') || 'null');
    } catch {
      localStorage.removeItem('user');
    }

    if (!token) {
      navigate('/login', { replace: true });
      return;
    }
    if (user?.rol !== 'proveedor') {
      navigate('/', { replace: true });
      return;
    }

    api.get('/proveedores/perfil', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(({ data }) => setPerfil({ ...emptyProfile, ...data }))
      .catch((requestError) => {
        if (requestError.response?.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          navigate('/login', { replace: true });
          return;
        }
        setError(requestError.response?.data?.error || 'No fue posible cargar tu perfil.');
      })
      .finally(() => setLoading(false));
  }, [navigate]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setPerfil((current) => ({ ...current, [name]: value }));
  };

  const handleGalleryChange = (event) => {
    const selected = Array.from(event.target.files || []);
    event.target.value = '';
    if (perfil.fotos_trabajo.length + fotosTrabajoNuevas.length + selected.length > 5) {
      setError('Puedes tener hasta cinco fotos de tus trabajos.');
      return;
    }
    setError('');
    setFotosTrabajoNuevas((current) => [
      ...current,
      ...selected.map((file) => ({ file, preview: URL.createObjectURL(file) })),
    ]);
  };

  const removeExistingGalleryImage = (image) => {
    setPerfil((current) => ({
      ...current,
      fotos_trabajo: current.fotos_trabajo.filter((url) => url !== image),
    }));
  };

  const removeNewGalleryImage = (preview) => {
    setFotosTrabajoNuevas((current) => {
      const removed = current.find((item) => item.preview === preview);
      if (removed) URL.revokeObjectURL(removed.preview);
      return current.filter((item) => item.preview !== preview);
    });
  };

  const uploadImages = async (token) => {
    if (!fotoPerfil && fotosTrabajoNuevas.length === 0) return {};

    const body = new FormData();
    if (fotoPerfil) body.append('foto_perfil', fotoPerfil);
    fotosTrabajoNuevas.forEach(({ file }) => body.append('fotos_trabajo', file));

    const { data } = await api.post('/proveedores/perfil/imagenes', body, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return data;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    setMensaje('');

    try {
      const token = localStorage.getItem('token');
      const uploaded = await uploadImages(token);
      if (uploaded.foto_perfil_url || uploaded.fotos_trabajo?.length) {
        setPerfil((current) => ({
          ...current,
          foto_perfil_url: uploaded.foto_perfil_url || current.foto_perfil_url,
          fotos_trabajo: [...current.fotos_trabajo, ...(uploaded.fotos_trabajo || [])],
        }));
        setFotoPerfil(null);
        fotosTrabajoNuevas.forEach(({ preview }) => URL.revokeObjectURL(preview));
        setFotosTrabajoNuevas([]);
      }
      const payload = {
        ...perfil,
        foto_perfil_url: uploaded.foto_perfil_url || perfil.foto_perfil_url,
        fotos_trabajo: [...perfil.fotos_trabajo, ...(uploaded.fotos_trabajo || [])],
        costo_aproximado: perfil.solo_cotizacion ? null : perfil.costo_aproximado,
      };
      const { data } = await api.put('/proveedores/perfil', payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPerfil({ ...emptyProfile, ...data });
      setFotoPerfil(null);
      fotosTrabajoNuevas.forEach(({ preview }) => URL.revokeObjectURL(preview));
      setFotosTrabajoNuevas([]);
      setMensaje('Perfil actualizado correctamente.');
    } catch (requestError) {
      if (requestError.response?.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login', { replace: true });
        return;
      }
      setError(requestError.response?.data?.error || 'No fue posible guardar tu perfil.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="text-center p-12">Cargando perfil...</div>;

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-3xl mx-auto bg-white p-8 rounded-xl shadow-sm border">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Mi perfil de proveedor</h2>
        <p className="text-sm text-gray-500 mb-6">Cuéntales a tus clientes quién eres y qué oficios o servicios ofreces.</p>

        {error && <div role="alert" className="p-4 mb-4 rounded bg-red-100 text-red-700">{error}</div>}
        {mensaje && <div role="status" className="p-4 mb-4 rounded bg-green-100 text-green-700">{mensaje}</div>}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="nombre" className="block text-sm font-medium text-gray-700">Nombre de la persona *</label>
            <input id="nombre" name="nombre" required maxLength="100" value={perfil.nombre} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md p-2.5 outline-none focus:border-blue-500" />
          </div>

          <div>
            <label htmlFor="nombre_negocio" className="block text-sm font-medium text-gray-700">Nombre del negocio (opcional)</label>
            <input id="nombre_negocio" name="nombre_negocio" maxLength="150" value={perfil.nombre_negocio || ''} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md p-2.5 outline-none focus:border-blue-500" />
          </div>

          <div>
            <label htmlFor="tipo_servicio" className="block text-sm font-medium text-gray-700">Tipo de servicio u oficio *</label>
            <input id="tipo_servicio" name="tipo_servicio" required maxLength="150" value={perfil.tipo_servicio || ''} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md p-2.5 outline-none focus:border-blue-500" />
          </div>

          <div>
            <label htmlFor="formacion" className="block text-sm font-medium text-gray-700">Título, estudios o experiencia relacionada (opcional)</label>
            <textarea id="formacion" name="formacion" maxLength="500" rows="2" value={perfil.formacion || ''} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md p-2.5 outline-none focus:border-blue-500" />
          </div>

          <fieldset>
            <legend className="block text-sm font-medium text-gray-700">¿Ofreces servicio a domicilio? *</legend>
            <div className="mt-2 flex gap-6">
              {[['true', 'Sí'], ['false', 'No']].map(([value, label]) => (
                <label key={value} className="flex items-center gap-2">
                  <input type="radio" name="servicio_domicilio" required checked={perfil.servicio_domicilio === (value === 'true')} onChange={() => setPerfil((current) => ({ ...current, servicio_domicilio: value === 'true' }))} />
                  {label}
                </label>
              ))}
            </div>
          </fieldset>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="colonia" className="block text-sm font-medium text-gray-700">Colonia *</label>
              <input id="colonia" name="colonia" required maxLength="150" value={perfil.colonia || ''} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md p-2.5 outline-none focus:border-blue-500" />
            </div>
            <div>
              <label htmlFor="codigo_postal" className="block text-sm font-medium text-gray-700">Código postal *</label>
              <input id="codigo_postal" name="codigo_postal" required inputMode="numeric" pattern="[0-9]{5}" maxLength="5" value={perfil.codigo_postal || ''} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md p-2.5 outline-none focus:border-blue-500" />
            </div>
          </div>

          <div>
            <label htmlFor="telefono" className="block text-sm font-medium text-gray-700">Teléfono de contacto</label>
            <input id="telefono" type="tel" name="telefono" maxLength="20" pattern="(?:\+?52[\s().-]*)?(?:[0-9][\s().-]*){10}" title="Ingresa 10 dígitos mexicanos, con o sin el prefijo +52." value={perfil.telefono || ''} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md p-2.5 outline-none focus:border-blue-500" />
          </div>

          <div>
            <label htmlFor="foto_perfil" className="block text-sm font-medium text-gray-700">Foto de perfil *</label>
            <input id="foto_perfil" type="file" accept="image/jpeg,image/png,image/webp" required={!perfil.foto_perfil_url && !fotoPerfil} onChange={(event) => setFotoPerfil(event.target.files?.[0] || null)} className="mt-1 block w-full text-sm text-gray-700" />
            <p className="mt-1 text-xs text-gray-500">JPG, PNG o WEBP; máximo 5 MB.</p>
            {fotoPerfil && <p className="mt-2 text-sm text-gray-600">{fotoPerfil.name}</p>}
            {!fotoPerfil && perfil.foto_perfil_url && <img src={imageUrl(perfil.foto_perfil_url)} alt="Foto de perfil" className="mt-3 h-28 w-28 rounded-full object-cover" />}
          </div>

          <div>
            <label htmlFor="fotos_trabajo" className="block text-sm font-medium text-gray-700">Fotos de tus trabajos o servicios (hasta 5)</label>
            <input id="fotos_trabajo" type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={handleGalleryChange} className="mt-1 block w-full text-sm text-gray-700" />
            <p className="mt-1 text-xs text-gray-500">JPG, PNG o WEBP; máximo 5 MB por imagen.</p>
            <div className="mt-3 grid grid-cols-2 sm:grid-cols-5 gap-3">
              {perfil.fotos_trabajo.map((image) => (
                <div key={image}>
                  <img src={imageUrl(image)} alt="Trabajo realizado" className="h-24 w-full rounded object-cover" />
                  <button type="button" onClick={() => removeExistingGalleryImage(image)} className="mt-1 text-xs text-red-600 hover:underline">Quitar foto</button>
                </div>
              ))}
              {fotosTrabajoNuevas.map(({ preview }, index) => (
                <div key={preview}>
                  <img src={preview} alt={`Nueva foto de trabajo ${index + 1}`} className="h-24 w-full rounded object-cover" />
                  <button type="button" onClick={() => removeNewGalleryImage(preview)} className="mt-1 text-xs text-red-600 hover:underline">Quitar foto</button>
                </div>
              ))}
            </div>
          </div>

          <fieldset>
            <legend className="block text-sm font-medium text-gray-700">Precio del servicio *</legend>
            <div className="mt-2 space-y-2">
              <label className="flex items-center gap-2">
                <input type="radio" name="solo_cotizacion" required checked={perfil.solo_cotizacion === true} onChange={() => setPerfil((current) => ({ ...current, solo_cotizacion: true, costo_aproximado: '' }))} />
                El precio depende del trabajo (bajo cotización)
              </label>
              <label className="flex items-center gap-2">
                <input type="radio" name="solo_cotizacion" required checked={perfil.solo_cotizacion === false} onChange={() => setPerfil((current) => ({ ...current, solo_cotizacion: false }))} />
                Mostrar un costo aproximado
              </label>
            </div>
            {perfil.solo_cotizacion === false && (
              <div className="mt-3">
                <label htmlFor="costo_aproximado" className="block text-sm font-medium text-gray-700">Costo aproximado en MXN *</label>
                <input id="costo_aproximado" type="number" name="costo_aproximado" required min="0.01" step="0.01" value={perfil.costo_aproximado || ''} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md p-2.5 outline-none focus:border-blue-500" />
              </div>
            )}
          </fieldset>

          <div>
            <label htmlFor="direccion_maps" className="block text-sm font-medium text-gray-700">Dirección o enlace de Google Maps (opcional)</label>
            <input id="direccion_maps" type="url" name="direccion_maps" value={perfil.direccion_maps || ''} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md p-2.5 outline-none focus:border-blue-500" placeholder="Pega el enlace para compartir de Google Maps" />
          </div>

          <div>
            <label htmlFor="descripcion" className="block text-sm font-medium text-gray-700">Descripción de tus servicios (opcional)</label>
            <textarea id="descripcion" name="descripcion" value={perfil.descripcion || ''} onChange={handleChange} maxLength="5000" rows="4" className="mt-1 block w-full border border-gray-300 rounded-md p-2.5 outline-none focus:border-blue-500" placeholder="Describe los oficios y trabajos que realizas, tu experiencia y la zona donde trabajas." />
          </div>

          <div className="flex justify-end pt-4 border-t">
            <button type="submit" disabled={saving} className="bg-blue-600 text-white font-medium py-2 px-6 rounded-md hover:bg-blue-700 disabled:opacity-60">
              {saving ? 'Guardando...' : 'Guardar cambios'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfileEdit;
