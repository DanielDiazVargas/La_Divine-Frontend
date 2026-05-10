import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./components/Login";
import Register from "./components/Register";
import Dashboard from "./components/Dashboard";
import ProtectedRoute from "./components/ProtectedRoute"; 

/**
 * Componente raíz que define la estructura de navegación de la aplicación.
 * Utiliza React Router para gestionar el cambio de páginas sin recargar el navegador,
 * implementando protección para las rutas que requieren sesión activa.
 */
function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rutas públicas de acceso inicial */}
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* Rutas protegidas mediante validación de credenciales */}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard/*" element={<Dashboard />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;