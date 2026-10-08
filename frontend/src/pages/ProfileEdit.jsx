import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const ProfileEdit = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [mensaje, setMensaje] = useState('');
  
  // Estado para el formulario del perfil
  const [perfil, setPerfil] = useState({
    titulo_profesional: '',
    descripcion: '',
    telefono: '',
    foto_url: ''
  });

  // Efecto para cargar los datos actuales del proveedor al entrar a la pantalla
  useEffect(() => {
    const fetchPerfil = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login'); // Si no hay token, lo mandamos al login
          return;
        }

  
        const response = await axios.get('http://localhost:3000/api/v1/proveedores/perfil', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        // Llenamos el estado con los datos que mande el backend
        if(response.data) {
          setPerfil(response.data);
        }
        setLoading(false);
      } catch (error) {
        console.error("Error al cargar perfil", error);
        setLoading(false);
      }
    };
    fetchPerfil();
  }, [navigate]);

  // Manejador del formulario para guardar los cambios
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensaje('Guardando...');
    try {
      const token = localStorage.getItem('token');
      
      // Consumo de endpoint PUT para actualizar el perfil
      await axios.put('http://localhost:3000/api/v1/proveedores/perfil', perfil, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setMensaje('¡Perfil actualizado con éxito!');
      setTimeout(() => setMensaje(''), 3000);
    } catch (error) {
      setMensaje('Error al actualizar el perfil');
    }
  };

  const handleChange = (e) => {
    setPerfil({ ...perfil, [e.target.name]: e.target.value });
  };

  if (loading) return <div className="text-center p-12">Cargando perfil...</div>;

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-3xl mx-auto bg-white p-8 rounded-xl shadow-sm border">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Mi Perfil Profesional</h2>
        
        {mensaje && (
          <div className={`p-4 mb-6 rounded ${mensaje.includes('Error') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
            {mensaje}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">Título Profesional</label>
            <input 
              type="text" 
              name="titulo_profesional"
              value={perfil.titulo_profesional || ''} 
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md p-2.5 outline-none focus:border-blue-500" 
              placeholder="Ej. Electricista Certificado" 
              required 
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Teléfono de Contacto</label>
            <input 
              type="tel" 
              name="telefono"
              value={perfil.telefono || ''} 
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md p-2.5 outline-none focus:border-blue-500" 
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Descripción de tus servicios</label>
            <textarea 
              name="descripcion"
              value={perfil.descripcion || ''} 
              onChange={handleChange}
              rows="4"
              className="mt-1 block w-full border border-gray-300 rounded-md p-2.5 outline-none focus:border-blue-500" 
              placeholder="Describe tu experiencia, certificaciones y el tipo de trabajo que realizas..."
            ></textarea>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">URL de Foto de Perfil (Opcional)</label>
            <input 
              type="url" 
              name="foto_url"
              value={perfil.foto_url || ''} 
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md p-2.5 outline-none focus:border-blue-500" 
              placeholder="https://ejemplo.com/mifoto.jpg" 
            />
          </div>

          <div className="flex justify-end pt-4 border-t">
            <button type="submit" className="bg-blue-600 text-white font-medium py-2 px-6 rounded-md hover:bg-blue-700">
              Guardar Cambios
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfileEdit;
JavaScript
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Register from './pages/Register';
import Login from './pages/Login';
import ProfileEdit from './pages/ProfileEdit'; // <-- 1. Importa tu componente

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-white">
        <Navbar />
        <Routes>
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/perfil" element={<ProfileEdit />} /> {/* <-- 2. Agrega la ruta */}
          <Route path="/" element={<div className="p-12 text-center text-3xl font-bold text-gray-700">Bienvenido a Proveo</div>} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;