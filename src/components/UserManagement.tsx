import { useEffect, useState } from "react";
// Asegúrate de importar tus servicios correctamente
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
 * Cumple con Req USU-003: Listar, buscar por correo, y cambiar estado con doble confirmación.
 */
function UserManagement() {
    const [users, setUsers] = useState<User[]>([]);
    const [filteredUsers, setFilteredUsers] = useState<User[]>([]); // Usuarios que se muestran en la tabla
    
    const [isLoading, setIsLoading] = useState(true);
    const [globalError, setGlobalError] = useState("");

    // Estados para la funcionalidad de búsqueda por correo
    const [searchEmail, setSearchEmail] = useState("");
    const [searchError, setSearchError] = useState("");

    // Estados para el Modal de doble confirmación
    const [showModal, setShowModal] = useState(false);
    const [userToToggle, setUserToToggle] = useState<{id: number, status: boolean} | null>(null);

    // Carga inicial de usuarios
    useEffect(() => {
        getUsers()
            .then((data) => {
                setUsers(data);
                setFilteredUsers(data); // Inicialmente mostramos todos
            })
            .catch(() => setGlobalError("No se pudo cargar la lista de usuarios."))
            .finally(() => setIsLoading(false));
    }, []);

    /**
     * Lógica de búsqueda requerida por la ERS
     */
    const handleSearch = () => {
        setSearchError(""); // Limpiar errores previos

        // Si el buscador está vacío, restauramos la tabla completa
        if (searchEmail.trim() === "") {
            setFilteredUsers(users);
            return;
        }

        // Filtramos buscando coincidencias con el correo ingresado
        const results = users.filter(u => 
            u.email.toLowerCase().includes(searchEmail.toLowerCase().trim())
        );

        if (results.length === 0) {
            // MENSAJE TEXTUAL Y EXACTO DE LA ERS
            setSearchError("El correo electrónico ingresado no se encuentra registrado");
            setFilteredUsers([]); // Vaciamos la tabla porque no hubo coincidencias
        } else {
            setFilteredUsers(results);
        }
    };

    /**
     * Si el usuario borra todo en el buscador, restauramos la lista para mejor UX
     */
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setSearchEmail(value);
        if (value === "") {
            setSearchError("");
            setFilteredUsers(users);
        }
    };

    /**
     * Prepara el cambio de estado (Abre el Modal)
     */
    const openConfirmModal = (id: number, status: boolean) => {
        setGlobalError("");
        setUserToToggle({ id, status });
        setShowModal(true);
    };

    /**
     * Confirma el cambio (Envía al backend)
     */
    const confirmToggle = async () => {
        if (!userToToggle) return;

        try {
            await toggleUserStatus(userToToggle.id, !userToToggle.status);
            
            // Actualizamos la lista principal
            const updatedUsers = users.map(u => 
                u.id === userToToggle.id ? { ...u, status: !userToToggle.status } : u
            );
            
            setUsers(updatedUsers);
            
            // También actualizamos la lista filtrada para que la UI no pierda el estado si hay una búsqueda activa
            setFilteredUsers(updatedUsers.filter(u => 
                u.email.toLowerCase().includes(searchEmail.toLowerCase().trim())
            ));
            
            setShowModal(false);
            setUserToToggle(null);
            
        } catch {
            setGlobalError("No se pudo cambiar el estado del usuario.");
        }
    };

    if (isLoading) return <p style={{ padding: "24px" }}>Cargando usuarios...</p>;

    return (
        <div className="dashboard-page">
            <div className="usuarios-table-wrapper" style={{ padding: "20px" }}>
                <h2 style={{ color: "#8B0000", borderBottom: "2px solid #8B0000", paddingBottom: "10px" }}>
                    Gestionar Usuarios
                </h2>
                
                {/* --- SECCIÓN DE BÚSQUEDA (Req: Buscar por correo electrónico) --- */}
                <div className="search-container" style={{ margin: "20px 0" }}>
                    <div style={{ display: "flex", gap: "10px" }}>
                        <input 
                            type="email" 
                            placeholder="Buscar por correo electrónico..." 
                            value={searchEmail}
                            onChange={handleInputChange}
                            style={{ 
                                padding: "8px 12px", 
                                width: "300px", 
                                borderRadius: "4px", 
                                border: "1px solid #ccc" 
                            }}
                        />
                        <button 
                            onClick={handleSearch}
                            style={{ 
                                backgroundColor: "#C0A060", 
                                color: "#fff", 
                                border: "none", 
                                padding: "8px 16px", 
                                borderRadius: "4px",
                                cursor: "pointer",
                                fontWeight: "bold"
                            }}
                        >
                            Buscar
                        </button>
                    </div>

                    {/* Validación de color #f56558 requerida por la ERS */}
                    {searchError && (
                        <p style={{ color: "#f56558", fontWeight: "bold", marginTop: "10px" }}>
                            {searchError}
                        </p>
                    )}
                </div>

                {globalError && <p style={{ color: "#f56558", fontWeight: "bold" }}>{globalError}</p>}

                {/* --- TABLA DE USUARIOS --- */}
                <div style={{ overflowX: "auto", width: "100%" }}>
                <table className="usuarios-table" style={{ width: "100%", borderCollapse: "collapse", marginTop: "10px" }}>
                    <thead>
                        <tr style={{ backgroundColor: "#8B0000", color: "#fff", textAlign: "left" }}>
                            <th style={{ padding: "12px" }}>Nombre</th>
                            <th style={{ padding: "12px" }}>Apellido</th>
                            <th style={{ padding: "12px" }}>Correo</th>
                            <th style={{ padding: "12px" }}>RUT</th>
                            <th style={{ padding: "12px" }}>Teléfono</th>
                            <th style={{ padding: "12px" }}>Estado</th>
                            <th style={{ padding: "12px" }}>Acción</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredUsers.map(u => (
                            <tr key={u.id} style={{ borderBottom: "1px solid #eee" }}>
                                <td style={{ padding: "12px" }}>{u.name}</td>
                                <td style={{ padding: "12px" }}>{u.lastName}</td>
                                <td style={{ padding: "12px" }}>{u.email}</td>
                                <td style={{ padding: "12px" }}>{u.rut}</td>
                                <td style={{ padding: "12px" }}>{u.phone}</td>
                                <td style={{ padding: "12px" }}>
                                    <span className={`badge ${u.status ? "activo" : "inactivo"}`} 
                                          style={{
                                              padding: "4px 8px", 
                                              borderRadius: "12px", 
                                              backgroundColor: u.status ? "#e6f4ea" : "#fce8e6",
                                              color: u.status ? "#137333" : "#c5221f",
                                              fontWeight: "bold",
                                              fontSize: "0.85em"
                                          }}>
                                        {u.status ? "Activo" : "Inactivo"}
                                    </span>
                                </td>
                                <td style={{ padding: "12px" }}>
                                    <button
                                        className={`btn-toggle ${u.status ? "deshabilitar" : "habilitar"}`}
                                        onClick={() => openConfirmModal(u.id, u.status)}
                                        style={{
                                            backgroundColor: u.status ? "#D64045" : "#4CAF50",
                                            color: "white",
                                            border: "none",
                                            padding: "6px 12px",
                                            borderRadius: "4px",
                                            cursor: "pointer"
                                        }}
                                    >
                                        {u.status ? "Deshabilitar" : "Habilitar"}
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>


            {/* --- MODAL DE DOBLE CONFIRMACIÓN --- */}
            {showModal && (
                <div className="modal-overlay" style={{
                    position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: "rgba(0,0,0,0.5)", display: "flex", 
                    justifyContent: "center", alignItems: "center"
                }}>
                    <div className="modal-content" style={{
                        backgroundColor: "#fff", padding: "24px", borderRadius: "8px",
                        width: "400px", textAlign: "center", boxShadow: "0 4px 6px rgba(0,0,0,0.1)"
                    }}>
                        <h3 style={{ color: "#8B0000", marginTop: 0 }}>Confirmar Acción</h3>
                        <p style={{ margin: "20px 0" }}>
                            ¿Estás seguro que deseas <strong>{userToToggle?.status ? "DESHABILITAR" : "HABILITAR"}</strong> a este usuario?
                        </p>
                        <div className="modal-actions" style={{ display: "flex", justifyContent: "space-between", gap: "10px" }}>
                            <button onClick={() => setShowModal(false)} style={{
                                flex: 1, padding: "10px", backgroundColor: "#ccc", border: "none", borderRadius: "4px", cursor: "pointer"
                            }}>
                                Cancelar
                            </button>
                            <button onClick={confirmToggle} style={{
                                flex: 1, padding: "10px", backgroundColor: userToToggle?.status ? "#D64045" : "#4CAF50", 
                                color: "#fff", border: "none", borderRadius: "4px", cursor: "pointer", fontWeight: "bold"
                            }}>
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