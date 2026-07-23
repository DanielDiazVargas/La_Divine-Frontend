const BASE_URL = import.meta.env.VITE_API_BACKEND;
const API_PAYMENT = `${BASE_URL}/api/payment`;

const getToken = () => localStorage.getItem("token");

const headers = () => ({
    "Content-Type": "application/json",
    Authorization: `Bearer ${getToken()}`,
});

// ─── Tipos que coinciden con los DTOs del backend ────────────────────────────

export interface PaymentRequest {
    cardNumber: string;
    securityCode: string;
    expiryMonth: string;
    expiryYear: string;
    cardHolderName: string;
    reservationCode: string;
}

export interface PaymentSuccessData {
    transactionCode: string;
    reservationCode: string;
    amountPaid: number;
}

interface PaymentApiResponse {
    success: boolean;
    transactionCode?: string;
    reservationCode?: string;
    amountPaid?: number;
    message?: string;
}

interface RefundApiResponse {
    success: boolean;
    message?: string;
}

// ─── Funciones del servicio ───────────────────────────────────────────────────

/**
 * Procesa el pago de una reserva con tarjeta de crédito.
 * TAR-001: Solo accesible por usuarios con rol User.
 */
export const processPayment = async (data: PaymentRequest): Promise<PaymentSuccessData> => {
    const res = await fetch(`${API_PAYMENT}/process`, {
        method: "POST",
        headers: headers(),
        body: JSON.stringify(data),
    });

    const json: PaymentApiResponse = await res.json();

    if (!res.ok || !json.success) {
        throw new Error(
            json.message || "El pago no pudo ser procesado. Verifique los datos ingresados e intente nuevamente"
        );
    }

    return {
        transactionCode: json.transactionCode!,
        reservationCode: json.reservationCode!,
        amountPaid: json.amountPaid!,
    };
};

/**
 * Anula una reserva pagada y procesa el reembolso.
 * TAR-002: Solo accesible por usuarios con rol User.
 */
export const cancelAndRefund = async (reservationCode: string, motivo: string): Promise<void> => {
    const res = await fetch(`${API_PAYMENT}/cancel-and-refund`, {
        method: "POST",
        headers: headers(),
        body: JSON.stringify({
            ReservationCode: reservationCode,
            Motivo: motivo
        }),
    });

    const json: RefundApiResponse = await res.json();

    if (!res.ok || !json.success) {
        throw new Error(
            json.message || "Esta reserva no puede ser anulada"
        );
    }
};