/**
 * URL base del backend configurada mediante variable de entorno.
 */
const BASE_URL = import.meta.env.VITE_API_BACKEND;

/**
 * Ruta base del controlador de funciones.
 */
const FUNCTION_API = `${BASE_URL}/api/Function`;

/**
 * Representa una función vigente mostrada en cartelera.
 */
export type BillboardFunction = {
    id: number;
    name: string;
    description: string;
    dateFunction: string;
    timeFunction: string;
    basePrice: number;
    availableSeats: number;
    totalSeats: number;
    imageUrl: string;
};

type BillboardResponse = {
    success: boolean;
    message: string;
    data: BillboardFunction[];
};

/**
 * Obtiene el token almacenado para consumir endpoints protegidos.
 */
const getToken = () => localStorage.getItem("token");

/**
 * Construye las cabeceras necesarias para consultar el backend.
 */
const buildHeaders = () => ({
    "Content-Type": "application/json",
    "Authorization": `Bearer ${getToken()}`
});

/**
 * Consulta las funciones vigentes disponibles en cartelera.
 * Permite enviar filtros opcionales por nombre y fecha.
 */
export const getBillboardFunctions = async (name?: string, date?: string) => {
    const params = new URLSearchParams();

    // Agrega el filtro por nombre solo si el usuario ingresó texto.
    if (name) {
        params.append("name", name);
    }

    // Agrega el filtro por fecha solo si el usuario seleccionó una fecha.
    if (date) {
        params.append("date", date);
    }

    const queryString = params.toString();

    const url = queryString
        ? `${FUNCTION_API}/cartelera?${queryString}`
        : `${FUNCTION_API}/cartelera`;

    const response = await fetch(url, {
        method: "GET",
        headers: buildHeaders()
    });

    const data: BillboardResponse = await response.json();

    if (!response.ok || !data.success) {
        throw new Error(data.message || "Error al consultar cartelera.");
    }

    return data.data;
};