const BASE_URL = import.meta.env.VITE_API_BACKEND;
const API = `${BASE_URL}/api/Reservation`;

const getToken = () => localStorage.getItem("token");

/**
 * Obtiene el historial de reservas del cliente autenticado.
 * Conectado al endpoint GET /api/reservation/my-reservations
 */
export const getMyReservations = async () => {
    const response = await fetch(`${API}/my-reservations`, {
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${getToken()}`
        }
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Error al obtener las reservas");
    return data;
};