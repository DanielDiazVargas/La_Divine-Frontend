import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./components/Login";
import Register from "./components/Register";
import Dashboard from "./components/Dashboard";

/**
 * Componente raíz que define la estructura de navegación de la aplicación.
 * Utiliza React Router para gestionar el cambio de páginas sin recargar el navegador.
 */
function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rutas públicas de acceso inicial */}
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* Ruta protegida que contiene el panel principal y sus sub-rutas */}
        <Route path="/dashboard/*" element={<Dashboard />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;