import { useEffect, useState } from "react";
import { getUsers, toggleUserStatus } from "../services/AuthServices";

interface User {
    id: number;
    name: string;
    lastName: string;
    email: string;
    rut: string;
    phone: string;
    status: boolean;
    role: string;
}

/**
 * Componente de administración para gestionar usuarios.
 * Permite listar usuarios y cambiar su estado de acceso mediante un modal de confirmación.
 */
function UserManagement() {
    // Lista de usuarios recuperada desde la API
    const [users, setUsers] = useState<User[]>([]);
    
    // Almacena mensajes de error generales de la tabla
    const [error, setError] = useState("");
    
    // Indica si la tabla está cargando datos inicialmente
    const [isLoading, setIsLoading] = useState(true);

    // Estado para controlar la visibilidad del modal de confirmación
    const [showModal, setShowModal] = useState(false);
    
    // Referencia temporal al usuario seleccionado para cambiar su estado
    const [userToToggle, setUserToToggle] = useState<{id: number, status: boolean} | null>(null);

    // --- NUEVOS ESTADOS PARA EL REQUERIMIENTO ---
    const [emailInput, setEmailInput] = useState("");
    const [emailError, setEmailError] = useState("");

    useEffect(() => {
        getUsers()
            .then(setUsers)
            .catch(() => setError("No se pudo cargar la lista de usuarios."))
            .finally(() => setIsLoading(false));
    }, []);

    /**
     * Valida el correo ingresado manualmente según los requerimientos.
     */
    const handleToggleByEmail = () => {
        setEmailError(""); // Limpiamos errores previos

        if (!emailInput.trim()) {
            setEmailError("Por favor, ingrese un correo electrónico.");
            return;
        }

        // Buscamos si el correo existe en nuestra lista actual
        const foundUser = users.find(u => u.email.toLowerCase() === emailInput.toLowerCase().trim());

        if (!foundUser) {
            // Mensaje EXACTO requerido por la ERS
            setEmailError("El correo electrónico ingresado no se encuentra registrado");
            return;
        }

        // Si existe, abrimos el modal de confirmación con los datos de ese usuario
        openConfirmModal(foundUser.id, foundUser.status);
        setEmailInput(""); // Limpiamos el input
    };

    /**
     * Prepara el cambio de estado abriendo el modal y guardando los datos del usuario.
     */
    const openConfirmModal = (id: number, status: boolean) => {
        setError("");
        setEmailError("");
        setUserToToggle({ id, status });
        setShowModal(true);
    };

    /**
     * Ejecuta la actualización de estado en el servidor y sincroniza la interfaz local.
     */
    const confirmToggle = async () => {
        if (!userToToggle) return;

        try {
            await toggleUserStatus(userToToggle.id, !userToToggle.status);
            
            // Actualización del estado local tras respuesta exitosa
            setUsers(prev =>
                prev.map(u => u.id === userToToggle.id ? { ...u, status: !userToToggle.status } : u)
            );
            
            setShowModal(false);
            setUserToToggle(null);
            
        } catch {
            setError("No se pudo cambiar el estado del usuario.");
        }
    };

    if (isLoading) return <p>Cargando usuarios...</p>;

    return (
        <div className="dashboard-page">
            <div className="usuarios-table-wrapper">
                <h2>Gestionar Usuarios</h2>
                
                {/* --- NUEVO PANEL DE BÚSQUEDA POR CORREO --- */}
                <div className="panel-busqueda" style={{ marginBottom: "20px", padding: "15px", backgroundColor: "#f9f9f9", borderRadius: "8px" }}>
                    <h3>Cambio Rápido por Correo</h3>
                    <div style={{ display: "flex", gap: "10px", alignItems: "center", marginTop: "10px" }}>
                        <input 
                            type="email" 
                            placeholder="Ej: usuario@ladivine.cl" 
                            value={emailInput}
                            onChange={(e) => setEmailInput(e.target.value)}
                            style={{ padding: "8px", width: "300px", borderRadius: "4px", border: "1px solid #ccc" }}
                        />
                        <button className="btn-buscar" onClick={handleToggleByEmail} style={{ padding: "8px 16px", cursor: "pointer" }}>
                            Buscar y Modificar
                        </button>
                    </div>
                    {/* Mensaje de error con el color exacto solicitado */}
                    {emailError && (
                        <p style={{ color: "#f56558", marginTop: "10px", fontWeight: "bold", margin: "10px 0 0 0" }}>
                            {emailError}
                        </p>
                    )}
                </div>
                {/* ------------------------------------------- */}

                {error && <p style={{ color: "#f56558", padding: "0 24px" }}>{error}</p>}

                <table className="usuarios-table">
                    <thead>
                        <tr>
                            <th>Nombre</th>
                            <th>Apellido</th>
                            <th>Correo</th>
                            <th>RUT</th>
                            <th>Teléfono</th>
                            <th>Rol</th>
                            <th>Estado</th>
                            <th>Acción</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map(u => (
                            <tr key={u.id}>
                                <td>{u.name}</td>
                                <td>{u.lastName}</td>
                                <td>{u.email}</td>
                                <td>{u.rut}</td>
                                <td>{u.phone}</td>
                                <td>{u.role}</td>
                                <td>
                                    <span className={`badge ${u.status ? "activo" : "inactivo"}`}>
                                        {u.status ? "Activo" : "Inactivo"}
                                    </span>
                                </td>
                                <td>
                                    <button
                                        className={`btn-toggle ${u.status ? "deshabilitar" : "habilitar"}`}
                                        onClick={() => openConfirmModal(u.id, u.status)}
                                    >
                                        {u.status ? "Deshabilitar" : "Habilitar"}
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Modal de confirmación */}
            {showModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h3>Confirmar Acción</h3>
                        <p>
                            ¿Estás seguro que deseas <strong>{userToToggle?.status ? "DESHABILITAR" : "HABILITAR"}</strong> a este usuario?
                        </p>
                        <div className="modal-actions">
                            <button className="btn-cancelar" onClick={() => setShowModal(false)}>
                                Cancelar
                            </button>
                            <button className="btn-confirmar-modal" onClick={confirmToggle}>
                                Confirmar Cambio
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default UserManagement;