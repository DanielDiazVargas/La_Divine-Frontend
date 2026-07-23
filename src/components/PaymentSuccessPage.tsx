import { useLocation, useNavigate } from "react-router-dom";
import type { PaymentSuccessData } from "../services/PaymentServices";
import type { ReservationSeatDto } from "../services/ReservationService";

interface SuccessState extends PaymentSuccessData {
  seats: ReservationSeatDto[];
  totalPrice: number;
}

export default function PaymentSuccessPage() {
  const location = useLocation();
  const navigate = useNavigate();

  const state = location.state as SuccessState | null;
  if (!state) {
    navigate("/dashboard");
    return null;
  }

  const { transactionCode, reservationCode, amountPaid, seats = [], totalPrice } = state;
  const displayAmount = amountPaid > 0 ? amountPaid : totalPrice;

  return (
    <div style={{
      background: "#F5F0E8",
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "40px 16px",
      boxSizing: "border-box",
    }}>

      {/* ── Boleta ───────────────────────────────────────────────────────── */}
      <div style={{
        maxWidth: 520,
        width: "100%",
        background: "#fff",
        border: "1px solid #C0A060",
        borderRadius: 14,
        boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
        overflow: "hidden",
      }}>

        {/* Franja superior roja */}
        <div style={{
          background: "#8B0000",
          padding: "28px 32px 24px",
          textAlign: "center",
          color: "#fff",
        }}>
          <div style={{ fontSize: 44, marginBottom: 10 }}>🎟️</div>
          <h2 style={{ margin: "0 0 6px", fontSize: "1.8rem", fontWeight: 800 }}>¡Pago realizado!</h2>
          <p style={{ margin: 0, fontSize: 14, opacity: 0.85 }}>
            Tu entrada ha sido confirmada. Guarda estos datos.
          </p>
        </div>

        {/* Separador tipo boleta: línea dorada punteada */}
        <div style={{
          borderTop: "2px dashed #C0A060",
          margin: "0 20px",
        }} />

        {/* Cuerpo de la boleta */}
        <div style={{ padding: "24px 32px 32px" }}>

          {/* Código de transacción */}
          <div style={{ textAlign: "center", marginBottom: 24 }}>
            <div style={{ fontSize: 10, color: "#999", letterSpacing: 2, fontWeight: 700, marginBottom: 8 }}>
              CÓDIGO DE TRANSACCIÓN
            </div>
            <div style={{
              display: "inline-block",
              fontSize: 20, fontWeight: 800, letterSpacing: 5,
              color: "#8B0000",
              background: "#F5F0E8",
              borderRadius: 6, padding: "10px 28px",
              border: "1px dashed #C0A060",
            }}>
              {transactionCode}
            </div>
          </div>

          {/* Código de reserva */}
          <div style={{
            display: "flex", justifyContent: "space-between", alignItems: "center",
            fontSize: 13, marginBottom: 16, paddingBottom: 16,
            borderBottom: "1px solid #f0f0f0",
          }}>
            <span style={{ color: "#888" }}>Código de reserva</span>
            <span style={{ fontWeight: 700, letterSpacing: 2, color: "#333" }}>{reservationCode}</span>
          </div>

          {/* Tabla de asientos */}
          {seats.length > 0 && (
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 10, color: "#999", letterSpacing: 2, fontWeight: 700, marginBottom: 10 }}>
                ASIENTOS RESERVADOS
              </div>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid #eee" }}>
                    <th style={{ textAlign: "left", padding: "6px 0", color: "#777", fontWeight: 600 }}>Asiento</th>
                    <th style={{ textAlign: "left", padding: "6px 0", color: "#777", fontWeight: 600 }}>Sección</th>
                    <th style={{ textAlign: "right", padding: "6px 0", color: "#777", fontWeight: 600 }}>Precio</th>
                  </tr>
                </thead>
                <tbody>
                  {seats.map((s, i) => (
                    <tr key={s.id ?? i} style={{ borderBottom: "1px solid #f8f8f8" }}>
                      <td style={{ padding: "7px 0", fontWeight: 700, color: "#333" }}>{s.seatNumber}</td>
                      <td style={{ padding: "7px 0", color: "#666" }}>{s.section}</td>
                      <td style={{ padding: "7px 0", textAlign: "right", color: "#555" }}>
                        ${s.price.toLocaleString("es-CL")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Total */}
          <div style={{
            display: "flex", justifyContent: "space-between", alignItems: "center",
            borderTop: "2px solid #F5F0E8",
            paddingTop: 16, marginBottom: 24,
          }}>
            <span style={{ fontWeight: 700, color: "#333", fontSize: 16 }}>Total pagado</span>
            <span style={{ fontWeight: 800, color: "#8B0000", fontSize: 22 }}>
              ${displayAmount.toLocaleString("es-CL")}
            </span>
          </div>

          {/* Botón */}
          <button
            onClick={() => navigate("/dashboard/cartelera")}
            style={{
              width: "100%", padding: "13px 0",
              background: "#8B0000", color: "#fff",
              border: "none", borderRadius: 8,
              fontWeight: 700, fontSize: 15, cursor: "pointer",
              boxShadow: "0 4px 14px rgba(139,0,0,0.25)",
              transition: "background 0.15s",
            }}
            onMouseEnter={e => (e.currentTarget.style.background = "#6a0000")}
            onMouseLeave={e => (e.currentTarget.style.background = "#8B0000")}
          >
            Volver a cartelera
          </button>

          <p style={{ textAlign: "center", color: "#bbb", fontSize: 12, marginTop: 16, marginBottom: 0 }}>
            🔒 Pago procesado de forma segura
          </p>
        </div>
      </div>
    </div>
  );
}
