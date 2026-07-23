import { useState } from "react";
import { useNavigate, Routes, Route, useLocation } from "react-router-dom";
import ChangePassword from "./ChangePassword";
import UserManagement from "./UserManagement";
import RegisterFunction from "./RegisterFunction";
import Billboard from "./Billboard";
import MyReservations from "./MyReservations";
import CancelReservation from "./CancelReservation";
import SalesReport from "./SalesReport";

import { getRoleFromToken } from "../services/AuthServices";
import "../styles/dashboard.css";

/**
 * Componente principal del panel de control.
 * Gestiona la navegación lateral, el control de acceso por roles
 * y el enrutamiento interno del sistema.
 */
function Dashboard() {
    const [isMenuOpen, setIsMenuOpen] = useState(true);
    const navigate = useNavigate();
    const location = useLocation();
    const role = getRoleFromToken();

    const handleLogout = () => {
        localStorage.removeItem("token");
        navigate("/");
    };

    const isActive = (path: string) =>
        location.pathname === path ? "activo" : "";

    return (
        <div className="dashboard-layout">
            <header className="dashboard-header">
                <button
                    className="btn-hamburguesa"
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                >
                    ☰
                </button>
                <span className="dashboard-title">Teatro La Divine</span>
                <button className="btn-salir" onClick={handleLogout}>
                    Cerrar Sesión
                </button>
            </header>

            <div className="dashboard-body">
                <aside className={`dashboard-sidebar ${isMenuOpen ? "abierto" : "cerrado"}`}>
                    <ul className="sidebar-menu">
                        <li
                            className={isActive("/dashboard")}
                            onClick={() => navigate("/dashboard")}
                        >
                            Cartelera
                        </li>

                        {/* FUN-004: Consultar Reserva — solo para clientes */}
                        {role === "User" && (
                            <li
                                className={isActive("/dashboard/consultar-reserva")}
                                onClick={() => navigate("/dashboard/consultar-reserva")}
                            >
                                Consultar Reserva
                            </li>
                        )}

                        <li
                            className={isActive("/dashboard/cambiar-contrasena")}
                            onClick={() => navigate("/dashboard/cambiar-contrasena")}
                        >
                            Cambiar Contraseña
                        </li>

                        {role === "Admin" && (
                            <li
                                className={isActive("/dashboard/gestionar-usuarios")}
                                onClick={() => navigate("/dashboard/gestionar-usuarios")}
                            >
                                Gestionar Usuarios
                            </li>
                        )}

                        {role === "Admin" && (
                            <li
                                className={isActive("/dashboard/Registrar-funcion")}
                                onClick={() => navigate("/dashboard/Registrar-funcion")}
                            >
                                Registrar función
                            </li>
                        )}

                        {role === "User" && (
                            <li
                                className={isActive("/dashboard/anular-reserva")}
                                onClick={() => navigate("/dashboard/anular-reserva")}
                            >
                                Anular Reserva
                            </li>
                        )}
                        {/* REP-001: Reporte de ventas — solo para administradores */}
                        {role === "Admin" && (
                            <li
                                className={isActive("/dashboard/reporte-ventas")}
                                onClick={() => navigate("/dashboard/reporte-ventas")}
                            >
                                Reporte de ventas
                            </li>
                        )}
                    </ul>
                </aside>

                <main className="dashboard-content">
                    <Routes>
                        <Route path="/" element={<Billboard />} />
                        <Route path="/cambiar-contrasena" element={<ChangePassword />} />
                        <Route path="/cartelera" element={<Billboard />} />

                        {/* FUN-004: historial de reservas del cliente */}
                        {role === "User" && (
                            <Route
                                path="/consultar-reserva"
                                element={<MyReservations />}
                            />
                        )}

                        {role === "Admin" && (
                            <Route
                                path="/gestionar-usuarios"
                                element={<UserManagement />}
                            />
                        )}

                        {role === "Admin" && (
                            <Route
                                path="/Registrar-funcion"
                                element={<RegisterFunction />}
                            />
                        )}

                        {role === "User" && (
                            <Route
                                path="/anular-reserva"
                                element={<CancelReservation />}
                            />
                        )}
                        {/* REP-001: visualización del reporte de ventas */}
                        {role === "Admin" && (
                            <Route
                                path="/reporte-ventas"
                                element={<SalesReport />}
                            />
                        )}
                    </Routes>
                </main>
            </div>
        </div>
    );
}

export default Dashboard;