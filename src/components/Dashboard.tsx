import { useState } from "react";
import { useNavigate, Routes, Route, useLocation } from "react-router-dom";
import logoUrl from "../assets/icons/LogoLaDivine.svg";
import MyProfile from "./MyProfile";
import ChangePassword from "./ChangePassword"; 
import UserManagement from "./UserManagement";
import { getRoleFromToken } from "../services/AuthServices";
import "../styles/dashboard.css";

/**
 * Componente principal del panel de control.
 * Gestiona la navegación lateral, el control de acceso por roles y el enrutamiento interno.
 */
function Dashboard() {
    // Controla si el menú lateral está visible o colapsado
    const [isMenuOpen, setIsMenuOpen] = useState(true);
    
    const navigate = useNavigate();
    const location = useLocation();
    
    // Obtiene el rol del usuario (Admin/User) desde el token almacenado
    const role = getRoleFromToken();

    /**
     * Elimina el token de sesión y redirige al usuario al inicio.
     */
    const handleLogout = () => {
        localStorage.removeItem("token");
        navigate("/");
    };

    /**
     * Verifica si una ruta está activa para aplicar visuales en el menú.
     */
    const isActive = (path: string) =>
        location.pathname === path ? "activo" : "";

    return (
        
        <div className="dashboard-layout">
            <header className="dashboard-header">
                <button className="btn-hamburguesa" onClick={() => setIsMenuOpen(!isMenuOpen)}>☰</button>
                {/* <img src={logoUrl} alt="Logo La Divine" className="dashboard-logo" /> */}
                <span className="dashboard-title">Teatro La Divine</span>
                <button className="btn-salir" onClick={handleLogout}>Cerrar Sesión</button>
            </header>

            <div className="dashboard-body">
                <aside className={`dashboard-sidebar ${isMenuOpen ? "abierto" : "cerrado"}`}>
                    <ul className="sidebar-menu">
                        <li className={isActive("/dashboard")} onClick={() => navigate("/dashboard")}>
                            Inicio
                        </li>
                        <li className={isActive("/dashboard/perfil")} onClick={() => navigate("/dashboard/perfil")}>
                            Mi Perfil
                        </li>
                        <li className={isActive("/dashboard/cambiar-contrasena")} onClick={() => navigate("/dashboard/cambiar-contrasena")}>
                            Cambiar Contraseña
                        </li>
                        {role === "Admin" && (
                            <li className={isActive("/dashboard/gestionar-usuarios")} onClick={() => navigate("/dashboard/gestionar-usuarios")}>
                                Gestionar Usuarios
                            </li>
                        )}
                    </ul>
                </aside>

                <main className="dashboard-content">
                    <Routes>
                        <Route path="/" element={
                            <div className="dashboard-page">
                                <h2>Bienvenido a Teatro La Divine 🎭</h2>
                                <p style={{ marginTop: "10px", color: "#666" }}>
                                    Selecciona una opción del menú para comenzar.
                                </p>
                            </div>
                        } />
                        <Route path="/perfil" element={<MyProfile />} />
                        <Route path="/cambiar-contrasena" element={<ChangePassword />} />
                        {role === "Admin" && (
                            <Route path="/gestionar-usuarios" element={<UserManagement />} />
                        )}
                    </Routes>
                </main>
            </div>
        </div>
    );
}

export default Dashboard;