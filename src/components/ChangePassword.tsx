import { useState } from "react";
import { changePassword } from "../services/AuthServices";
import ConfirmModal from "./ConfirmModal";

function ChangePasswordUser() {
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [errors, setErrors] = useState<{ current?: string; new?: string; confirm?: string }>({});
    const [successMessage, setSuccessMessage] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);

    const validate = () => {
        const found: { current?: string; new?: string; confirm?: string } = {};
        if (!currentPassword) found.current = "Debes ingresar tu contraseña actual.";
        if (!newPassword) found.new = "Debes ingresar una nueva contraseña.";
        else if (newPassword.length < 8) found.new = "La contraseña nueva debe tener al menos 8 caracteres.";
        if (!confirmPassword) found.confirm = "Debes confirmar la nueva contraseña.";
        else if (newPassword !== confirmPassword) found.confirm = "Las contraseñas no coinciden.";
        return found;
    };

    const handleSubmit = () => {
        setSuccessMessage("");
        const foundErrors = validate();
        if (Object.keys(foundErrors).length > 0) {
            setErrors(foundErrors);
            return;
        }
        setErrors({});
        setShowModal(true);
    };

    const handleConfirm = async () => {
        setShowModal(false);
        setIsLoading(true);
        try {
            await changePassword(currentPassword, newPassword, confirmPassword);
            setSuccessMessage("Contraseña cambiada exitosamente.");
            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");
        } catch (err: any) {
            setErrors({ current: err.message });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="dashboard-page">

            {showModal && (
                <ConfirmModal
                    mensaje="¿Está seguro de que desea cambiar su contraseña?"
                    onConfirm={handleConfirm}
                    onCancel={() => setShowModal(false)}
                />
            )}

            <div style={{ padding: "20px" }}>
                <h2 style={{ color: "#8B0000", borderBottom: "2px solid #8B0000", paddingBottom: "10px", marginBottom: "24px" }}>
                    🔑 Cambiar Contraseña
                </h2>

                <div style={{
                    backgroundColor: "white", border: "1px solid #C0A060",
                    borderRadius: "8px", padding: "30px", maxWidth: "450px"
                }}>
                    <div className="form-group">
                        <label>Contraseña actual</label>
                        <input
                            type="password"
                            value={currentPassword}
                            onChange={e => setCurrentPassword(e.target.value)}
                            placeholder="Ingresa tu contraseña actual"
                            disabled={isLoading}
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
                            disabled={isLoading}
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
                            disabled={isLoading}
                        />
                        {errors.confirm && <span className="error-msg">{errors.confirm}</span>}
                    </div>

                    <button
                        className="btn-confirmar"
                        onClick={handleSubmit}
                        disabled={isLoading}
                        style={{
                            backgroundColor: isLoading ? "#aaa" : undefined,
                            cursor: isLoading ? "not-allowed" : "pointer"
                        }}
                    >
                        {isLoading ? "Cambiando contraseña..." : "Confirmar cambio"}
                    </button>

                    {successMessage && <p className="success-msg">{successMessage}</p>}
                </div>
            </div>
        </div>
    );
}

export default ChangePasswordUser;
