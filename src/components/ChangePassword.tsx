import { useState } from "react";
import { changePassword } from "../services/AuthServices";

/**
 * Componente que permite al usuario cambiar su contraseña de acceso.
 * Maneja la captura de datos, validaciones de seguridad básicas y la petición a la API.
 */
function ChangePasswordUser() {
    // Almacena la contraseña actual ingresada
    const [currentPassword, setCurrentPassword] = useState("");
    
    // Almacena la nueva contraseña
    const [newPassword, setNewPassword] = useState("");
    
    // Almacena la confirmación de la nueva contraseña
    const [confirmPassword, setConfirmPassword] = useState("");
    
    // Registra los mensajes de error de validación separados por campo
    const [errors, setErrors] = useState<{ current?: string; new?: string; confirm?: string }>({});
    
    // Mensaje de feedback tras una actualización exitosa
    const [successMessage, setSuccessMessage] = useState("");
    
    // Controla el estado de carga para bloquear el botón de envío
    const [isLoading, setIsLoading] = useState(false);

    /**
     * Revisa que todos los campos cumplan con las reglas de negocio básicas.
     * Retorna un objeto con los errores encontrados en el formulario.
     */
    const validate = () => {
        const found: { current?: string; new?: string; confirm?: string } = {};
        
        if (!currentPassword) found.current = "Debes ingresar tu contraseña actual.";
        
        if (!newPassword) found.new = "Debes ingresar una nueva contraseña.";
        else if (newPassword.length < 8) found.new = "La contraseña nueva debe tener al menos 8 caracteres.";
        
        if (!confirmPassword) found.confirm = "Debes confirmar la nueva contraseña.";
        else if (newPassword !== confirmPassword) found.confirm = "Las contraseñas no coinciden.";
        
        return found;
    };

    /**
     * Gestiona el envío del formulario, la comunicación con el backend y el manejo de errores.
     */
    const handleSubmit = async () => {
        setSuccessMessage("");
        
        // Aplica validaciones locales antes de consultar a la API
        const foundErrors = validate();
        if (Object.keys(foundErrors).length > 0) {
            setErrors(foundErrors);
            return;
        }
        
        // Prepara la interfaz para la petición en curso
        setErrors({});
        setIsLoading(true);
        
        try {
            await changePassword(currentPassword, newPassword, confirmPassword);
            
            setSuccessMessage("Contraseña cambiada exitosamente.");
            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");
            
        } catch (err: any) {
            // Muestra el mensaje de rechazo devuelto por el servidor
            setErrors({ current: err.message });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="dashboard-page">
            <div className="form-card">
                <h2>🔑 Cambiar Contraseña</h2>

                <div className="form-group">
                    <label>Contraseña actual</label>
                    <input
                        type="password"
                        value={currentPassword}
                        onChange={e => setCurrentPassword(e.target.value)}
                        placeholder="Ingresa tu contraseña actual"
                    />
                    {errors.current && <span className="error-msg">{errors.current}</span>}
                </div>

                <div className="form-group">
                    <label>Nueva contraseña</label>
                    <input
                        type="password"
                        value={newPassword}
                        onChange={e => setNewPassword(e.target.value)}
                        placeholder="Mínimo 8 caracteres"
                    />
                    {errors.new && <span className="error-msg">{errors.new}</span>}
                </div>

                <div className="form-group">
                    <label>Confirmar nueva contraseña</label>
                    <input
                        type="password"
                        value={confirmPassword}
                        onChange={e => setConfirmPassword(e.target.value)}
                        placeholder="Repite la nueva contraseña"
                    />
                    {errors.confirm && <span className="error-msg">{errors.confirm}</span>}
                </div>

                <button className="btn-confirmar" onClick={handleSubmit} disabled={isLoading}>
                    {isLoading ? "Guardando..." : "Confirmar cambio"}
                </button>

                {successMessage && <p className="success-msg">{successMessage}</p>}
            </div>
        </div>
    );
}

export default ChangePasswordUser;