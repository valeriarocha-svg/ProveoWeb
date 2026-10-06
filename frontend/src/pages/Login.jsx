import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

const Login = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('cliente');
  const [formData, setFormData] = useState({ email: '', password: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:3000/api/v1/auth/login', formData);
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      navigate('/');
    } catch (error) {
      alert(error.response?.data?.error || 'Error al iniciar sesión');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 border">
          <div className="text-center mb-6">
            <span className="text-xs font-bold text-gray-500 tracking-wider uppercase">🔒 ACCESO SEGURO PROVEO</span>
            <h2 className="mt-2 text-2xl font-bold text-gray-900">Iniciar Sesión</h2>
            <p className="text-sm text-gray-500 mt-1">Ingresa a tu cuenta para gestionar tus servicios o solicitudes.</p>
          </div>

          <div className="flex border-b mb-6">
            <button onClick={() => setActiveTab('cliente')} className={`flex-1 py-3 text-sm font-medium border-b-2 ${activeTab === 'cliente' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
              👤 Soy Cliente
            </button>
            <button onClick={() => setActiveTab('proveedor')} className={`flex-1 py-3 text-sm font-medium border-b-2 ${activeTab === 'proveedor' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
              🛠️ Soy Profesional
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">Correo electrónico</label>
              <input type="email" required className="mt-1 block w-full border border-gray-300 rounded-md p-2.5 outline-none focus:border-blue-500" onChange={(e) => setFormData({...formData, email: e.target.value})} />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Contraseña</label>
              <input type="password" required className="mt-1 block w-full border border-gray-300 rounded-md p-2.5 outline-none focus:border-blue-500" onChange={(e) => setFormData({...formData, password: e.target.value})} />
            </div>

            <button type="submit" className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700">
              Continuar
            </button>
          </form>
          
          <div className="mt-6 text-center text-sm text-gray-500">
            ¿No tienes cuenta? <Link to="/register" className="text-blue-600 font-medium hover:underline">Regístrate gratis aquí</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;