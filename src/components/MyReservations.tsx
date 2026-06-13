import { useEffect, useState } from "react";
import { getMyReservations } from "../services/ReservationService";
import { getProfile } from "../services/AuthServices";

interface Reservation {
    reservationCode: string;
    functionTitle: string;
    functionDate: string;
    functionTime: string;
    seatCount: number;
    seatNumbers: string[];
    totalPrice: number;
    status: number; // 0 = Activa, 1 = Anulada
    isPaid: boolean;
    createdAt: string;
}

/**
 * Componente para consultar el historial de reservas del cliente.
 * Cumple Req FUN-004: lista en tabla las reservas del usuario autenticado,
 * ordenadas de la más antigua a la más reciente.
 */
function MyReservations() {
    const [reservations, setReservations] = useState<Reservation[]>([]);
    const [clientName, setClientName] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [errorMsg, setErrorMsg] = useState("");

    useEffect(() => {
        // Carga en paralelo el perfil del cliente y sus reservas
        Promise.all([getProfile(), getMyReservations()])
            .then(([profile, reservationsResponse]) => {
                setClientName(`${profile.name} ${profile.lastName ?? ""}`.trim());
                setReservations(reservationsResponse ?? []);
            })
            .catch((error: any) => {
                // Mensaje textual exacto de la ERS cuando no hay reservas
                setErrorMsg(error.message || "No hay reservas asociadas a su usuario");
            })
            .finally(() => setIsLoading(false));
    }, []);

    if (isLoading) return <p style={{ padding: "24px" }}>Cargando reservas...</p>;

    return (
        <div className="dashboard-page">
            <div style={{ padding: "20px" }}>
                <h2 style={{ color: "#8B0000", borderBottom: "2px solid #8B0000", paddingBottom: "10px", marginBottom: "24px" }}>
                    Consultar Reserva
                </h2>

                <div style={{ background: "#fff", borderRadius: 8, border: "1px solid #C0A060", padding: "20px" }}>

                    {/* Mensaje de error en color ERS #f56558 */}
                    {errorMsg && (
                        <p style={{ color: "#f56558", fontWeight: "bold", marginTop: "10px" }}>
                            {errorMsg}
                        </p>
                    )}

                    {!errorMsg && (
                        <div style={{ overflowX: "auto", width: "100%" }}>
                            <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "10px" }}>
                                <thead>
                                    <tr style={{ backgroundColor: "#8B0000", color: "#fff", textAlign: "left" }}>
                                        <th style={{ padding: "12px" }}>Código Reserva</th>
                                        <th style={{ padding: "12px" }}>Cliente</th>
                                        <th style={{ padding: "12px" }}>Nombre de la función</th>
                                        <th style={{ padding: "12px" }}>Fecha de la función</th>
                                        <th style={{ padding: "12px" }}>Hora de la función</th>
                                        <th style={{ padding: "12px" }}>Asientos reservados</th>
                                        <th style={{ padding: "12px" }}>Precio total</th>
                                        <th style={{ padding: "12px" }}>Estado</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {reservations.map((r) => (
                                        <tr key={r.reservationCode} style={{ borderBottom: "1px solid #eee" }}>
                                            <td style={{ padding: "12px" }}>{r.reservationCode}</td>
                                            <td style={{ padding: "12px" }}>{clientName}</td>
                                            <td style={{ padding: "12px" }}>{r.functionTitle}</td>
                                            <td style={{ padding: "12px" }}>
                                                {new Date(r.functionDate).toLocaleDateString("es-CL", { day: "2-digit", month: "2-digit", year: "numeric" })}
                                            </td>
                                            <td style={{ padding: "12px" }}>{r.functionTime}</td>
                                            <td style={{ padding: "12px", fontSize: "0.85rem", color: "#444" }}>
                                                {r.seatNumbers && r.seatNumbers.length > 0
                                                    ? <>{r.seatNumbers.join(", ")} <strong>({r.seatCount})</strong></>
                                                    : <strong>({r.seatCount})</strong>
                                                }
                                            </td>
                                            <td style={{ padding: "12px" }}>${r.totalPrice.toLocaleString("es-CL")}</td>
                                            <td style={{ padding: "12px" }}>
                                                <span style={{
                                                    padding: "4px 12px",
                                                    borderRadius: "12px",
                                                    backgroundColor: r.isPaid ? "#4CAF50" : "#D64045",
                                                    color: "#fff",
                                                    fontWeight: "bold",
                                                    fontSize: "0.85em"
                                                }}>
                                                    {r.isPaid ? "Pagada" : "Anulada"}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default MyReservations;