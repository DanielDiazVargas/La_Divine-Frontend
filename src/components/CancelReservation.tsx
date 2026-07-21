import { useState } from "react";
import { cancelAndRefund } from "../services/PaymentServices";

function CancelReservation() {
    const [reservationCode, setReservationCode] = useState("");
    const [motivo, setMotivo] = useState("");
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
    const [errorMsg, setErrorMsg] = useState("");
    const [successMsg, setSuccessMsg] = useState("");
    const [loading, setLoading] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMsg("");
        setSuccessMsg("");

        const errors: Record<string, string> = {};
        if (!reservationCode.trim())
            errors.reservationCode = "Falta completar el campo Código de reserva";
        if (!motivo.trim())
            errors.motivo = "Falta completar el campo Motivo de anulación";

        if (Object.keys(errors).length > 0) {
            setFieldErrors(errors);
            return;
        }

        setFieldErrors({});
        setShowConfirm(true);
    };

    const handleConfirm = async () => {
        setShowConfirm(false);
        setLoading(true);

        try {
            await cancelAndRefund(reservationCode, motivo);
            setSuccessMsg("Reserva anulada y reembolso procesado exitosamente.");
            setReservationCode("");
            setMotivo("");
        } catch (error: any) {
            setErrorMsg("Atención: " + error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="dashboard-page">

            <h2 style={{
                color: "#8B0000",
                borderBottom: "2px solid #8B0000",
                paddingBottom: "10px",
                marginBottom: "24px"
            }}>
                🎫 Anular Reserva
            </h2>

            <div className="form-card">
                <form onSubmit={handleSubmit} noValidate>

                    {/* Código de reserva */}
                    <div className="form-group">
                        <label style={{ fontWeight: "600", color: "#333", marginBottom: "6px" }}>
                            Código de reserva
                        </label>
                        <input
                            type="text"
                            placeholder="Ej: A1B2C3D4E5F6"
                            value={reservationCode}
                            onChange={(e) => {
                                setReservationCode(e.target.value.toUpperCase());
                                setFieldErrors({ ...fieldErrors, reservationCode: "" });
                            }}
                        />
                        {fieldErrors.reservationCode && (
                            <span className="error-msg">{fieldErrors.reservationCode}</span>
                        )}
                    </div>

                    {/* Motivo de anulación */}
                    <div className="form-group">
                        <label style={{ fontWeight: "600", color: "#333", marginBottom: "6px" }}>
                            Motivo de anulación
                        </label>
                        <textarea
                            placeholder="Ingrese el motivo de la anulación..."
                            value={motivo}
                            onChange={(e) => {
                                setMotivo(e.target.value);
                                setFieldErrors({ ...fieldErrors, motivo: "" });
                            }}
                            rows={4}
                            style={{
                                padding: "10px 12px",
                                border: "1px solid #ccc",
                                borderRadius: "4px",
                                fontSize: "14px",
                                fontFamily: "Montserrat, sans-serif",
                                resize: "vertical",
                                outline: "none"
                            }}
                        />
                        {fieldErrors.motivo && (
                            <span className="error-msg">{fieldErrors.motivo}</span>
                        )}
                    </div>

                    {/* Mensajes */}
                    {errorMsg && <p className="error-msg">{errorMsg}</p>}
                    {successMsg && <p className="success-msg">{successMsg}</p>}

                    {/* Botón */}
                    <button
                        type="submit"
                        className="btn-confirmar"
                        disabled={loading}
                        style={{
                            marginTop: "8px",
                            opacity: loading ? 0.7 : 1,
                            cursor: loading ? "not-allowed" : "pointer"
                        }}
                    >
                        {loading ? "Procesando..." : "Anular Reserva"}
                    </button>

                </form>
            </div>

            {/* Modal de confirmación — REQ NF01 */}
            {showConfirm && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h3 style={{ color: "#8B0000", marginBottom: "16px" }}>
                            ¿Está seguro?
                        </h3>
                        <p style={{ color: "#444", marginBottom: "8px", fontSize: "0.95rem" }}>
                            Está a punto de anular la reserva:
                        </p>
                        <p style={{
                            fontWeight: "bold",
                            color: "#8B0000",
                            fontSize: "1.1rem",
                            marginBottom: "8px"
                        }}>
                            {reservationCode}
                        </p>
                        <p style={{
                            color: "#444",
                            fontSize: "0.85rem",
                            marginBottom: "8px"
                        }}>
                            Esta acción procesará el reembolso a su tarjeta de crédito y no puede deshacerse.
                        </p>
                        <div className="modal-actions">
                            <button
                                className="btn-cancelar"
                                onClick={() => setShowConfirm(false)}
                            >
                                Cancelar
                            </button>
                            <button
                                className="btn-confirmar-modal"
                                onClick={handleConfirm}
                                style={{ backgroundColor: "#D64045" }}
                            >
                                Confirmar Anulación
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default CancelReservation;