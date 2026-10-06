import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, MapPin } from 'lucide-react';

const Navbar = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
        <Link to="/" className="text-2xl font-bold text-blue-700 flex items-center gap-2">
          <span className="bg-blue-100 p-1 rounded">🛡️</span> Proveo
        </Link>
        
        <div className="hidden md:flex flex-1 max-w-2xl mx-8 items-center bg-gray-50 rounded-full border px-4 py-2">
          <div className="flex-1 flex items-center border-r px-2">
            <Search className="w-4 h-4 text-gray-400 mr-2" />
            <input type="text" placeholder="¿Qué servicio buscas?" className="bg-transparent outline-none w-full text-sm" />
          </div>
          <div className="flex-1 flex items-center px-4">
            <MapPin className="w-4 h-4 text-gray-400 mr-2" />
            <input type="text" placeholder="Zona o Código Postal" className="bg-transparent outline-none w-full text-sm" />
          </div>
          <button className="bg-blue-600 text-white px-6 py-2 rounded-full text-sm font-medium hover:bg-blue-700">
            Buscar
          </button>
        </div>

        <div className="flex items-center gap-4">
          {!user ? (
            <>
              <Link to="/login" className="text-sm font-medium text-gray-600 hover:text-blue-600">¿Ya tienes cuenta? Iniciar Sesión</Link>
              <Link to="/register" className="text-sm font-medium border border-blue-600 text-blue-600 px-4 py-2 rounded hover:bg-blue-50">Regístrate gratis</Link>
            </>
          ) : (
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-gray-700">Hola, {user.nombre}</span>
              <button onClick={handleLogout} className="text-sm font-medium text-red-600 hover:text-red-800">Salir</button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;