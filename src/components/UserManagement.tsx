import { useEffect, useState } from "react";
import { getUsers, toggleUserStatus } from "../services/AuthServices";
import ConfirmModal from "./ConfirmModal";
import InfoTooltip from "./InfoTooltip";

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

function UserManagement() {
    const [users, setUsers] = useState<User[]>([]);
    const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [togglingId, setTogglingId] = useState<number | null>(null);
    const [globalError, setGlobalError] = useState("");
    const [searchEmail, setSearchEmail] = useState("");
    const [searchError, setSearchError] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [userToToggle, setUserToToggle] = useState<{id: number, status: boolean} | null>(null);

    useEffect(() => {
        getUsers()
            .then((data) => {
                setUsers(data);
                setFilteredUsers(data);
            })
            .catch(() => setGlobalError("No se pudo cargar la lista de usuarios."))
            .finally(() => setIsLoading(false));
    }, []);

    const handleSearch = () => {
        setSearchError("");
        if (searchEmail.trim() === "") {
            setFilteredUsers(users);
            return;
        }
        const results = users.filter(u =>
            u.email.toLowerCase().includes(searchEmail.toLowerCase().trim())
        );
        if (results.length === 0) {
            setSearchError("El correo electrónico ingresado no se encuentra registrado");
            setFilteredUsers([]);
        } else {
            setFilteredUsers(results);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setSearchEmail(value);
        if (value === "") {
            setSearchError("");
            setFilteredUsers(users);
        }
    };

    const openConfirmModal = (id: number, status: boolean) => {
        setGlobalError("");
        setUserToToggle({ id, status });
        setShowModal(true);
    };

    const confirmToggle = async () => {
        if (!userToToggle) return;
        setShowModal(false);
        setTogglingId(userToToggle.id);
        try {
            await toggleUserStatus(userToToggle.id, !userToToggle.status);
            const updatedUsers = users.map(u =>
                u.id === userToToggle.id ? { ...u, status: !userToToggle.status } : u
            );
            setUsers(updatedUsers);
            setFilteredUsers(updatedUsers.filter(u =>
                u.email.toLowerCase().includes(searchEmail.toLowerCase().trim())
            ));
            setUserToToggle(null);
        } catch {
            setGlobalError("No se pudo cambiar el estado del usuario.");
        } finally {
            setTogglingId(null);
        }
    };

    if (isLoading) return <p style={{ padding: "24px" }}>Cargando usuarios...</p>;

    return (
        <div className="dashboard-page">

            {showModal && userToToggle && (
                <ConfirmModal
                    mensaje={`¿Está seguro de que desea ${userToToggle.status ? "deshabilitar" : "habilitar"} a este usuario?`}
                    onConfirm={confirmToggle}
                    onCancel={() => setShowModal(false)}
                />
            )}

            <div style={{ padding: "20px" }}>
                <h2 style={{ color: "#8B0000", borderBottom: "2px solid #8B0000", paddingBottom: "10px", marginBottom: "24px" }}>
                    📋 Gestionar Usuarios
                    <InfoTooltip text="Aquí ves a todos los usuarios registrados. Puedes buscarlos por correo y activar o desactivar su cuenta; un usuario desactivado no podrá iniciar sesión." />
                </h2>

                <div style={{ background: "#fff", borderRadius: 8, border: "1px solid #C0A060", padding: "20px" }}>

                    <div style={{ margin: "0 0 20px 0" }}>
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
                        {searchError && (
                            <p style={{ color: "#f56558", fontWeight: "bold", marginTop: "10px" }}>
                                {searchError}
                            </p>
                        )}
                    </div>

                    {globalError && <p style={{ color: "#f56558", fontWeight: "bold" }}>{globalError}</p>}

                    <div style={{ overflowX: "auto", width: "100%" }}>
                        <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "10px" }}>
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
                                {filteredUsers.map(u => {
                                    const isToggling = togglingId === u.id;
                                    return (
                                        <tr key={u.id} style={{ borderBottom: "1px solid #eee" }}>
                                            <td style={{ padding: "12px" }}>{u.name}</td>
                                            <td style={{ padding: "12px" }}>{u.lastName}</td>
                                            <td style={{ padding: "12px" }}>{u.email}</td>
                                            <td style={{ padding: "12px" }}>{u.rut}</td>
                                            <td style={{ padding: "12px" }}>{u.phone}</td>
                                            <td style={{ padding: "12px" }}>
                                                <span style={{
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
                                                    onClick={() => !isToggling && openConfirmModal(u.id, u.status)}
                                                    disabled={isToggling}
                                                    style={{
                                                        backgroundColor: isToggling ? "#aaa" : u.status ? "#D64045" : "#4CAF50",
                                                        color: "white",
                                                        border: "none",
                                                        padding: "6px 12px",
                                                        borderRadius: "4px",
                                                        cursor: isToggling ? "not-allowed" : "pointer",
                                                        fontWeight: "bold",
                                                        minWidth: "110px"
                                                    }}
                                                >
                                                    {isToggling
                                                        ? (u.status ? "Deshabilitando..." : "Habilitando...")
                                                        : (u.status ? "Deshabilitar" : "Habilitar")
                                                    }
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default UserManagement;
