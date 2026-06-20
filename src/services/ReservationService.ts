const BASE_URL = import.meta.env.VITE_API_BACKEND;
const API = `${BASE_URL}/api/Reservation`;

const getToken = () => localStorage.getItem("token");

const headers = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${getToken()}`,
});

// ─── Tipos que coinciden con los DTOs del backend ────────────────────────────

export interface SeatDto {
  id: number;
  seatNumber: string; // ej. "A1", "IZQ-A1"
  section: string;    // "VIP Divine", "Platea", "Anfiteatro", "Galería", "Palco"
  price: number;
  status: number;     // 0 = Disponible, 1 = Reservado
}

export interface GetSeatsResponse {
  success: boolean;
  message: string;
  data: SeatDto[];
}

export interface ReservationSeatDto {
  id: number;
  seatNumber: string;
  section: string;
  price: number;
}

export interface ReservationData {
  id: number;
  reservationCode: string;
  functionId: number;
  functionTitle: string;
  selectedSeats: ReservationSeatDto[];
  totalPrice: number;
  status: number;
  createdAt: string;
}

export interface CreateReservationResponse {
  success: boolean;
  message: string;
  data: ReservationData;
}

export interface MyReservationDto {
  reservationCode: string;
  functionTitle: string;
  functionDate: string;
  functionTime: string;
  seatCount: number;
  seatNumbers: string[];
  totalPrice: number;
  status: number;    // 0 = Activa, 1 = Anulada
  isPaid: boolean;
  createdAt: string;
}

export interface MyReservationsResponse {
  success: boolean;
  message: string;
  data: MyReservationDto[];
}

// ─── Funciones del servicio ───────────────────────────────────────────────────

/**
 * GET /api/reservation/seats/{functionId}
 * Carga los asientos reales con su estado desde la BD.
 */
export const getFunctionSeats = async (functionId: number): Promise<SeatDto[]> => {
  const res = await fetch(`${API}/seats/${functionId}`, { headers: headers() });
  const data: GetSeatsResponse = await res.json();
  if (!res.ok || !data.success) throw new Error(data.message || "Error al cargar asientos.");
  return data.data;
};

/**
 * POST /api/reservation
 * Crea la reserva. SeatIds son IDs numéricos de BD.
 * El backend calcula el precio total.
 */
export const createReservation = async (
  functionId: number,
  seatIds: number[]
): Promise<ReservationData> => {
  const res = await fetch(API, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({ functionId, seatIds }),
  });
  const data: CreateReservationResponse = await res.json();
  if (!res.ok || !data.success) throw new Error(data.message || "Error al crear reserva.");
  return data.data;
};

/**
 * GET /api/reservation/my-reservations
 * Historial de reservas del usuario autenticado (FUN-004).
 */
export const getMyReservations = async (): Promise<MyReservationDto[]> => {
  const res = await fetch(`${API}/my-reservations`, { headers: headers() });
  const data: MyReservationsResponse = await res.json();
  if (!res.ok || !data.success) throw new Error(data.message || "No hay reservas asociadas a su usuario.");
  return data.data;
};

/**
 * DELETE /api/reservation/{code}
 * Anula una reserva y libera sus asientos (TAR-002).
 */
export const cancelReservation = async (code: string): Promise<void> => {
  const res = await fetch(`${API}/${code}/cancel`, {
    method: "PATCH",
    headers: headers(),
  });
  const data = await res.json();
  if (!res.ok || !data.success) throw new Error(data.message || "Error al anular la reserva.");
};

/**
 * GET /api/reservation/{code}/pdf
 * Descarga la entrada en PDF de una reserva pagada (FUN-005).
 */
export const downloadReservationPdf = async (code: string): Promise<void> => {
  const res = await fetch(`${API}/${code}/pdf`, { headers: headers() });

  if (!res.ok) {
    // El backend devuelve JSON con el mensaje de error cuando falla
    const data = await res.json().catch(() => null);
    throw new Error(data?.message || "No se pudo descargar la entrada.");
  }

  // Convierte la respuesta en un archivo descargable
  const blob = await res.blob();
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `entrada_${code}.pdf`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};
