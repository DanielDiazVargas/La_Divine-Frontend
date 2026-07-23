const BASE_URL = import.meta.env.VITE_API_BACKEND;
const API = `${BASE_URL}/api/payment/process`;

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

// ─── Función del servicio ─────────────────────────────────────────────────────

export const processPayment = async (data: PaymentRequest): Promise<PaymentSuccessData> => {
  const res = await fetch(API, {
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
