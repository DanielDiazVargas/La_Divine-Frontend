import { useEffect, useState } from "react";
import { getProfile } from "../services/AuthServices";

/**
 * Estructura de datos para el perfil del usuario.
 */
interface UserProfile {
    name: string;
    lastName: string;
    email: string;
    phone: string;
    rut: string;
    role: string;
}

/**
 * Componente que muestra la información detallada del usuario logueado.
 * Obtiene los datos desde la API al cargar el componente.
 */
function MyProfile() {
    // Almacena la información del perfil recuperada del servidor
    const [profile, setProfile] = useState<UserProfile | null>(null);
    
    // Captura posibles errores durante la carga de datos
    const [error, setError] = useState("");

    /**
     * Hook de efecto que gatilla la petición de perfil al montar el componente.
     */
    useEffect(() => {
        getProfile()
            .then(setProfile)
            .catch(() => setError("No se pudo cargar el perfil."));
    }, []);

    if (error) return <p className="error-msg">{error}</p>;
    if (!profile) return <p>Cargando...</p>;

    return (
        <div className="dashboard-page">
            <div className="perfil-card">
                <h2>👤 Mi Perfil</h2>
                <div className="perfil-campo">
                    <label>Nombre</label>
                    <span>{profile.name}</span>
                </div>
                <div className="perfil-campo">
                    <label>Apellido</label>
                    <span>{profile.lastName}</span>
                </div>
                <div className="perfil-campo">
                    <label>Correo electrónico</label>
                    <span>{profile.email}</span>
                </div>
                <div className="perfil-campo">
                    <label>Teléfono</label>
                    <span>{profile.phone}</span>
                </div>
                <div className="perfil-campo">
                    <label>RUT</label>
                    <span>{profile.rut}</span>
                </div>
                <div className="perfil-campo">
                    <label>Rol</label>
                    <span>{profile.role}</span>
                </div>
            </div>
        </div>
    );
}

export default MyProfile;