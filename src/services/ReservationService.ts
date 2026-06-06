const BASE_URL = import.meta.env.VITE_API_BACKEND;
const RESERVATION_API = `${BASE_URL}/api/Reservation`;

/**
 * Recupera el token de sesión almacenado en el navegador.
 */
const getToken = () => localStorage.getItem("token");

/**
 * Cabeceras estándar con autenticación JWT.
 */
const buildHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${getToken()}`,
});

/**
 * DTO que se envía al backend al confirmar una reserva (FUN-003).
 */
export interface CreateReservationDto {
  /** ID de la función seleccionada */
  functionId: number;
  /** IDs de negocio de los asientos seleccionados, ej. ["A1", "B3", "IZQ-A2"] */
  seatIds: string[];
  /** Precio total calculado en frontend: suma_zonas + cant * precioBase */
  totalPrice: number;
}

/**
 * Respuesta del backend al crear una reserva.
 */
export interface ReservationResponse {
  success: boolean;
  message: string;
  reservationCode: string;
}

/**
 * Envía al backend la reserva con los asientos seleccionados.
 * El backend genera el código único de reserva (ERS FUN-003).
 *
 * Endpoint esperado: POST /api/Reservation
 * Body: { functionId, seatIds, totalPrice }
 */
export const createReservation = async (
  dto: CreateReservationDto
): Promise<ReservationResponse> => {
  const response = await fetch(RESERVATION_API, {
    method: "POST",
    headers: buildHeaders(),
    body: JSON.stringify(dto),
  });

  const data: ReservationResponse = await response.json();

  if (!response.ok || !data.success) {
    throw new Error(data.message || "Error al procesar la reserva.");
  }

  return data;
};
