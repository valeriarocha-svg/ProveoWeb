import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Wrench, Briefcase } from 'lucide-react';

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    nombre: '', email: '', telefono: '', ciudad: '', cp: '', password: '', rol: 'cliente'
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:3000/api/v1/auth/registro', formData);
      alert('Registro exitoso. Por favor, inicia sesión.');
      navigate('/login');
    } catch (error) {
      alert(error.response?.data?.error || 'Error al registrar');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 flex justify-center">
      <div className="max-w-2xl w-full bg-white p-8 rounded-xl shadow-sm border">
        <div className="text-center mb-8">
          <h2 className="mt-4 text-3xl font-bold text-gray-900">Formulario de registro de usuario</h2>
          <p className="mt-2 text-sm text-gray-500">Únete a la red de expertos en Proveo para conectar con clientes o encontrar soluciones para tu hogar.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Selecciona tu tipo de cuenta *</label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div 
                onClick={() => setFormData({...formData, rol: 'cliente'})}
                className={`cursor-pointer border-2 rounded-lg p-4 flex gap-3 ${formData.rol === 'cliente' ? 'border-blue-600 bg-blue-50' : 'border-gray-200 hover:border-blue-300'}`}
              >
                <div className={`p-2 rounded-full ${formData.rol === 'cliente' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-500'}`}><Wrench className="w-5 h-5"/></div>
                <div>
                  <h4 className="font-semibold text-gray-900 text-sm">Busco proveedores y servicios</h4>
                </div>
              </div>

              <div 
                onClick={() => setFormData({...formData, rol: 'proveedor'})}
                className={`cursor-pointer border-2 rounded-lg p-4 flex gap-3 ${formData.rol === 'proveedor' ? 'border-blue-600 bg-blue-50' : 'border-gray-200 hover:border-blue-300'}`}
              >
                <div className={`p-2 rounded-full ${formData.rol === 'proveedor' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-500'}`}><Briefcase className="w-5 h-5"/></div>
                <div>
                  <h4 className="font-semibold text-gray-900 text-sm">Ofrezco mis servicios</h4>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700">Nombre y apellidos *</label>
              <input type="text" required className="mt-1 block w-full border border-gray-300 rounded-md p-2.5 outline-none focus:border-blue-500" placeholder="Ej. Juan Morales Hernández" onChange={(e) => setFormData({...formData, nombre: e.target.value})} />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Correo electrónico *</label>
              <input type="email" required className="mt-1 block w-full border border-gray-300 rounded-md p-2.5 outline-none focus:border-blue-500" placeholder="correo@ejemplo.com" onChange={(e) => setFormData({...formData, email: e.target.value})} />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Número de teléfono *</label>
              <input type="tel" required className="mt-1 block w-full border border-gray-300 rounded-md p-2.5 outline-none focus:border-blue-500" placeholder="+52 000 000 0000" onChange={(e) => setFormData({...formData, telefono: e.target.value})} />
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700">Contraseña *</label>
              <input type="password" required minLength="8" className="mt-1 block w-full border border-gray-300 rounded-md p-2.5 outline-none focus:border-blue-500" placeholder="Mínimo 8 caracteres" onChange={(e) => setFormData({...formData, password: e.target.value})} />
            </div>
          </div>

          <button type="submit" className="w-full bg-blue-600 text-white font-medium py-3 px-4 rounded-md hover:bg-blue-700 transition-colors">
            Completar Registro
          </button>
        </form>
      </div>
    </div>
  );
};

export default Register;