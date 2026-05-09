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
    
    // Almacena mensajes de error para feedback visual
    const [error, setError] = useState("");
    
    // Indica si la tabla está cargando datos inicialmente
    const [isLoading, setIsLoading] = useState(true);

    // Estado para controlar la visibilidad del modal de confirmación
    const [showModal, setShowModal] = useState(false);
    
    // Referencia temporal al usuario seleccionado para cambiar su estado
    const [userToToggle, setUserToToggle] = useState<{id: number, status: boolean} | null>(null);

    useEffect(() => {
        getUsers()
            .then(setUsers)
            .catch(() => setError("No se pudo cargar la lista de usuarios."))
            .finally(() => setIsLoading(false));
    }, []);

    /**
     * Prepara el cambio de estado abriendo el modal y guardando los datos del usuario.
     */
    const openConfirmModal = (id: number, status: boolean) => {
        setError("");
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
                <h2> Gestionar Usuarios</h2>
                
                {error && <p className="error-msg" style={{ padding: "0 24px" }}>{error}</p>}

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

            {/* Modal de confirmación para evitar cambios accidentales */}
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