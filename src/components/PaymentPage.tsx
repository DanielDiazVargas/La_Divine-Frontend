import { useState, useRef, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { processPayment, type PaymentRequest } from "../services/PaymentServices";
import { cancelReservation, type ReservationSeatDto } from "../services/ReservationService";
import ConfirmModal from "./ConfirmModal";
import InfoTooltip from "./InfoTooltip";
import "../styles/login.css";

const TIMEOUT_SECONDS = 10 * 60; // 10 minutos para completar el pago

interface PaymentLocationState {
  reservationCode: string;
  totalPrice: number;
  seats: ReservationSeatDto[];
  functionId: number;
  functionName: string;
}

const formatTime = (secs: number) => {
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
};

export default function PaymentPage() {
  const location = useLocation();
  const navigate = useNavigate();

  const state = location.state as PaymentLocationState | null;
  if (!state) {
    navigate("/dashboard");
    return null;
  }

  const { reservationCode, totalPrice, seats, functionId, functionName } = state;

  const [cardNumber, setCardNumber] = useState("");
  const [securityCode, setSecurityCode] = useState("");
  const [expiryMonth, setExpiryMonth] = useState("");
  const [expiryYear, setExpiryYear] = useState("");
  const [cardHolderName, setCardHolderName] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [paymentError, setPaymentError] = useState("");
  const [loading, setLoading] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [timeLeft, setTimeLeft] = useState(TIMEOUT_SECONDS);

  // Hover del botón volver
  const [hoverBack, setHoverBack] = useState(false);
  // Hover del botón pagar
  const [hoverPay, setHoverPay] = useState(false);

  // Refs para controlar cancelaciones y evitar doble llamado
  const isPaidRef    = useRef(false); // true cuando el pago fue exitoso
  const cancelledRef = useRef(false); // true cuando ya se canceló la reserva

  // ── Cancela la reserva una sola vez, sin importar el origen ──────────────
  const doCancel = () => {
    if (isPaidRef.current || cancelledRef.current) return;
    cancelledRef.current = true;
    cancelReservation(reservationCode).catch(() => {});
  };

  // ── Timer de 10 minutos ───────────────────────────────────────────────────
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          // Cancela y redirige al mapa de asientos de la misma función
          doCancel();
          navigate("/dashboard", {
            state: { returnToSeatMap: true, functionId, functionName },
          });
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Cancela al desmontar el componente (cambio de URL, navegación, etc.) ─
  // setTimeout(0) evita que React Strict Mode (desarrollo) dispare el cancel
  // durante el desmontaje falso que hace para detectar side-effects.
  useEffect(() => {
    let settled = false;
    const id = setTimeout(() => { settled = true; }, 0);
    return () => {
      clearTimeout(id);
      if (settled) doCancel();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Cancela al cerrar la pestaña (best-effort, sin token en beacon) ──────
  // El servicio de limpieza del backend cubre este caso tras 10 minutos.
  useEffect(() => {
    const handleBeforeUnload = () => { doCancel(); };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Volver: cancela la reserva y regresa al SeatMap ──────────────────────
  const handleGoBack = async () => {
    cancelledRef.current = true; // evita que el cleanup llame doCancel de nuevo
    setCancelling(true);
    try {
      await cancelReservation(reservationCode);
    } catch {
      // Si falla igual navega para no dejar al usuario atrapado
    } finally {
      navigate("/dashboard", {
        state: { returnToSeatMap: true, functionId, functionName },
      });
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!/^\d{16}$/.test(cardNumber.replace(/\D/g, "")))
      newErrors.cardNumber = "El número de tarjeta debe tener exactamente 16 dígitos.";

    if (!/^\d{3}$/.test(securityCode))
      newErrors.securityCode = "El código de seguridad debe tener exactamente 3 dígitos.";

    const month = parseInt(expiryMonth, 10);
    if (!expiryMonth || isNaN(month) || month < 1 || month > 12)
      newErrors.expiryMonth = "El mes debe estar entre 1 y 12.";

    const year = parseInt(expiryYear, 10);
    const currentYear = new Date().getFullYear();
    if (!/^\d{4}$/.test(expiryYear) || year < currentYear)
      newErrors.expiryYear = `El año debe ser ${currentYear} o posterior.`;

    if (!cardHolderName.trim())
      newErrors.cardHolderName = "El nombre del titular no puede estar vacío.";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPaymentError("");
    if (validate()) setShowConfirmModal(true);
  };

  const handlePayment = async () => {
    setShowConfirmModal(false);
    setLoading(true);
    setPaymentError("");

    const payload: PaymentRequest = {
      cardNumber: cardNumber.replace(/\D/g, ""),
      securityCode,
      expiryMonth: String(parseInt(expiryMonth, 10)),
      expiryYear,
      cardHolderName,
      reservationCode,
    };
    try {
      const result = await processPayment(payload);
      isPaidRef.current = true; // Impide que el cleanup cancele la reserva ya pagada
      navigate("/payment/success", { state: { ...result, seats, totalPrice } });
    } catch (err) {
      setPaymentError(
        err instanceof Error
          ? err.message
          : "El pago no pudo ser procesado. Verifique los datos ingresados e intente nuevamente"
      );
    } finally {
      setLoading(false);
    }
  };

  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "10px 12px", border: "1px solid #ccc",
    borderRadius: 4, fontSize: 14, boxSizing: "border-box",
  };

  const labelStyle: React.CSSProperties = {
    fontSize: 12, fontWeight: 600, color: "#555",
    letterSpacing: 0.5, marginBottom: 4, display: "block",
  };

  const fieldErrorStyle: React.CSSProperties = {
    color: "#f56558", fontSize: 12, marginTop: 3,
  };

  const isDisabled = loading || cancelling;
  const timerCritical = timeLeft <= 60;

  return (
    <div style={{
      background: "#F5F0E8",
      minHeight: "100vh",
      padding: "20px 24px",
      boxSizing: "border-box",
    }}>

      {showConfirmModal && (
        <ConfirmModal
          mensaje="¿Está seguro que desea procesar el pago? Esta acción no se puede deshacer."
          onConfirm={handlePayment}
          onCancel={() => setShowConfirmModal(false)}
        />
      )}

      {/* ── Encabezado ───────────────────────────────────────────────────── */}
      <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 20, flexWrap: "wrap" }}>
        <button
          onClick={handleGoBack}
          disabled={isDisabled}
          onMouseEnter={() => setHoverBack(true)}
          onMouseLeave={() => setHoverBack(false)}
          style={{
            display: "flex", alignItems: "center", gap: 6,
            background: isDisabled ? "#ccc" : hoverBack ? "#6a0000" : "#8B0000",
            border: "none", borderRadius: 6,
            padding: "8px 16px", color: "#fff",
            fontWeight: 600, fontSize: 13,
            cursor: isDisabled ? "not-allowed" : "pointer",
            whiteSpace: "nowrap",
            transition: "background 0.15s",
          }}
        >
          ← {cancelling ? "Volviendo..." : "Volver a seleccionar asientos"}
        </button>

        <div style={{ display: "flex", alignItems: "center", gap: 10, flex: 1 }}>
          <span style={{ fontSize: 24 }}>💳</span>
          <div>
            <h2 style={{ margin: 0, color: "#8B0000", fontSize: "1.8rem" }}>
              Pago seguro
              <InfoTooltip text="Completa los datos de tu tarjeta para confirmar la compra. Tienes 10 minutos: si el tiempo se agota antes de pagar, la reserva se cancela y los asientos vuelven a estar disponibles para otras personas." />
            </h2>
            <p style={{ margin: 0, color: "#888", fontSize: 15 }}>Teatro La Divine</p>
          </div>
        </div>

        {/* ── Contador de tiempo restante ──────────────────────────────── */}
        <div style={{
          display: "flex", alignItems: "center", gap: 8,
          background: timerCritical ? "#fff0f0" : "#fff",
          border: `1px solid ${timerCritical ? "#f56558" : "#C0A060"}`,
          borderRadius: 8, padding: "8px 14px",
          boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
        }}>
          <span style={{ fontSize: 16 }}>{timerCritical ? "⚠️" : "⏱️"}</span>
          <div style={{ lineHeight: 1.2 }}>
            <div style={{ fontSize: 10, color: "#999", fontWeight: 600, letterSpacing: 0.8 }}>
              TIEMPO RESTANTE
            </div>
            <div style={{
              fontSize: 18, fontWeight: 800,
              color: timerCritical ? "#f56558" : "#8B0000",
              letterSpacing: 1,
            }}>
              {formatTime(timeLeft)}
            </div>
          </div>
        </div>
      </div>

      {/* ── Dos columnas — llenan todo el ancho disponible ──────────── */}
      <div style={{
        display: "flex",
        flexWrap: "wrap",
        gap: 24,
        width: "100%",
        alignItems: "flex-start",
      }}>

        {/* ── Columna izquierda: formulario ────────────────────────────── */}
        <div style={{
          flex: "2 1 0",
          background: "#fff",
          border: "1px solid #C0A060",
          borderRadius: 10,
          padding: "28px",
          boxShadow: "0 4px 20px rgba(0,0,0,0.07)",
        }}>

          {/* Selector de medio de pago */}
          <div style={{ marginBottom: 24 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "#999", letterSpacing: 1, marginBottom: 12 }}>
              MEDIO DE PAGO
            </div>
            <div style={{
              display: "flex", alignItems: "center", gap: 12,
              border: "2px solid #8B0000", borderRadius: 8,
              padding: "12px 16px", background: "#fff8f8",
            }}>
              <span style={{ fontSize: 22 }}>💳</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, color: "#333", fontSize: 14 }}>Tarjeta de crédito</div>
                <div style={{ color: "#888", fontSize: 12 }}>Único medio de pago disponible</div>
              </div>
              <span style={{ color: "#8B0000", fontWeight: 800, fontSize: 18 }}>✓</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} noValidate>
            <div style={{ fontSize: 11, fontWeight: 700, color: "#999", letterSpacing: 1, marginBottom: 16 }}>
              DATOS DE TARJETA
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>Número de tarjeta</label>
              <input
                type="text"
                maxLength={19}
                placeholder="1234 5678 9012 3456"
                value={cardNumber}
                onChange={e => {
                  // Extrae solo dígitos (funciona con pegado con o sin espacios)
                  const raw = e.target.value.replace(/\D/g, "").slice(0, 16);
                  // Separa visualmente en grupos de 4
                  setCardNumber(raw.replace(/(.{4})/g, "$1 ").trim());
                }}
                style={{ ...inputStyle, borderColor: errors.cardNumber ? "#f56558" : "#ccc" }}
              />
              {errors.cardNumber && <p style={fieldErrorStyle}>{errors.cardNumber}</p>}
            </div>

            <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
              <div style={{ flex: 1 }}>
                <label style={labelStyle}>
                  CVV
                  <InfoTooltip text="Son los 3 números que están al reverso de tu tarjeta, junto a la firma." />
                </label>
                <input
                  type="text"
                  maxLength={3}
                  placeholder="123"
                  value={securityCode}
                  onChange={e => setSecurityCode(e.target.value.replace(/\D/g, ""))}
                  style={{ ...inputStyle, borderColor: errors.securityCode ? "#f56558" : "#ccc" }}
                />
                {errors.securityCode && <p style={fieldErrorStyle}>{errors.securityCode}</p>}
              </div>
              <div style={{ flex: 1 }}>
                <label style={labelStyle}>Mes de expiración</label>
                <input
                  type="text"
                  maxLength={2}
                  placeholder="MM"
                  value={expiryMonth}
                  onChange={e => setExpiryMonth(e.target.value.replace(/\D/g, ""))}
                  style={{ ...inputStyle, borderColor: errors.expiryMonth ? "#f56558" : "#ccc" }}
                />
                {errors.expiryMonth && <p style={fieldErrorStyle}>{errors.expiryMonth}</p>}
              </div>
              <div style={{ flex: 1 }}>
                <label style={labelStyle}>Año de expiración</label>
                <input
                  type="text"
                  maxLength={4}
                  placeholder="AAAA"
                  value={expiryYear}
                  onChange={e => setExpiryYear(e.target.value.replace(/\D/g, ""))}
                  style={{ ...inputStyle, borderColor: errors.expiryYear ? "#f56558" : "#ccc" }}
                />
                {errors.expiryYear && <p style={fieldErrorStyle}>{errors.expiryYear}</p>}
              </div>
            </div>

            <div style={{ marginBottom: 24 }}>
              <label style={labelStyle}>Nombre del titular</label>
              <input
                type="text"
                placeholder="Nombre y apellido"
                value={cardHolderName}
                onChange={e => setCardHolderName(e.target.value)}
                style={{ ...inputStyle, borderColor: errors.cardHolderName ? "#f56558" : "#ccc" }}
              />
              {errors.cardHolderName && <p style={fieldErrorStyle}>{errors.cardHolderName}</p>}
            </div>

            {paymentError && (
              <p style={{ color: "#f56558", fontSize: 13, marginBottom: 16, textAlign: "center" }}>
                {paymentError}
              </p>
            )}

            <button
              type="submit"
              disabled={isDisabled}
              onMouseEnter={() => setHoverPay(true)}
              onMouseLeave={() => setHoverPay(false)}
              style={{
                width: "100%", padding: "12px 0",
                background: isDisabled ? "#ccc" : hoverPay ? "#6a0000" : "#8B0000",
                color: "#fff", border: "none", borderRadius: 6,
                fontWeight: 700, fontSize: 15,
                cursor: isDisabled ? "not-allowed" : "pointer",
                transition: "background 0.15s",
              }}
            >
              {loading ? "Procesando..." : "Pagar"}
            </button>
          </form>
        </div>

        {/* ── Columna derecha: resumen ──────────────────────────────────── */}
        <div style={{
          flex: "1 1 0",
          background: "#fff",
          border: "1px solid #C0A060",
          borderRadius: 10,
          padding: "28px",
          boxShadow: "0 4px 20px rgba(0,0,0,0.07)",
        }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: "#999", letterSpacing: 1, marginBottom: 18 }}>
            RESUMEN DE COMPRA
          </div>

          <div style={{ fontSize: 14, color: "#888", marginBottom: 14, display: "flex", justifyContent: "space-between" }}>
            <span>Código de reserva</span>
            <span style={{ fontWeight: 700, color: "#8B0000", letterSpacing: 2 }}>{reservationCode}</span>
          </div>

          <div style={{ borderTop: "1px solid #eee", marginBottom: 14 }} />

          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 15 }}>
            <thead>
              <tr style={{ borderBottom: "1px solid #eee" }}>
                <th style={{ textAlign: "left", padding: "6px 0", color: "#555", fontWeight: 600 }}>Asiento</th>
                <th style={{ textAlign: "left", padding: "6px 0", color: "#555", fontWeight: 600 }}>Sección</th>
                <th style={{ textAlign: "right", padding: "6px 0", color: "#555", fontWeight: 600 }}>Precio</th>
              </tr>
            </thead>
            <tbody>
              {seats.map(s => (
                <tr key={s.id} style={{ borderBottom: "1px solid #f5f5f5" }}>
                  <td style={{ padding: "7px 0", fontWeight: 700 }}>{s.seatNumber}</td>
                  <td style={{ padding: "7px 0", color: "#666" }}>{s.section}</td>
                  <td style={{ padding: "7px 0", textAlign: "right" }}>${s.price.toLocaleString("es-CL")}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={2} style={{ paddingTop: 14, fontWeight: 700, color: "#333", fontSize: 16 }}>Total</td>
                <td style={{ paddingTop: 14, textAlign: "right", fontWeight: 800, fontSize: 20, color: "#8B0000" }}>
                  ${totalPrice.toLocaleString("es-CL")}
                </td>
              </tr>
            </tfoot>
          </table>

          <div style={{ borderTop: "1px solid #eee", marginTop: 18, paddingTop: 16 }}>
            <p style={{ color: "#aaa", fontSize: 13, margin: 0, textAlign: "center" }}>
              🔒 Pago procesado de forma segura
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
