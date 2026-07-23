/**
 * URL base del backend configurada mediante variable de entorno.
 */
const BASE_URL = import.meta.env.VITE_API_BACKEND;

/**
 * Ruta base del controlador de reportes.
 */
const REPORT_API = `${BASE_URL}/api/Report`;

/**
 * Resumen general del reporte de ventas.
 */
export type SalesReportSummary = {
    functionCount: number;
    totalSoldTickets: number;
    totalPendingTickets: number;
    totalRevenue: number;
};

/**
 * Representa los ingresos agrupados por función.
 */
export type FunctionSalesReport = {
    functionId: number;
    functionName: string;
    dateFunction: string;
    timeFunction: string;
    soldTickets: number;
    pendingTickets: number;
    totalRevenue: number;
};

/**
 * Representa una entrada individual asociada al reporte.
 */
export type TicketSalesReport = {
    reservationCode: string;
    functionId: number;
    functionName: string;
    dateFunction: string;
    timeFunction: string;
    seatNumber: string;
    section: string;
    seatPrice: number;
    revenueAmount: number;
    paymentStatus: string;
};

/**
 * Representa la ocupación por sección dentro de una función.
 */
export type SectionOccupancyReport = {
    section: string;
    soldSeats: number;
    pendingSeats: number;
    totalSeats: number;
    occupancyPercentage: number;
};

/**
 * Representa la ocupación general de una función.
 */
export type FunctionOccupancyReport = {
    functionId: number;
    functionName: string;
    dateFunction: string;
    timeFunction: string;
    roomName: string;
    soldSeats: number;
    pendingSeats: number;
    totalSeats: number;
    occupancyPercentage: number;
    sections: SectionOccupancyReport[];
};

/**
 * Contiene toda la información del reporte de ventas.
 */
export type SalesReport = {
    startDate: string;
    endDate: string;
    summary: SalesReportSummary;
    functionSales: FunctionSalesReport[];
    ticketDetails: TicketSalesReport[];
    occupancyByFunction: FunctionOccupancyReport[];
};

type SalesReportResponse = {
    success: boolean;
    message: string;
    data: SalesReport;
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
 * Consulta el reporte de ventas para las funciones dentro de un rango de fechas.
 */
export const getSalesReport = async (startDate: string, endDate: string) => {
    const params = new URLSearchParams();

    params.append("startDate", startDate);
    params.append("endDate", endDate);

    const response = await fetch(`${REPORT_API}/sales?${params.toString()}`, {
        method: "GET",
        headers: buildHeaders()
    });

    const data: SalesReportResponse = await response.json();

    if (!response.ok || !data.success) {
        throw new Error(data.message || "Error al generar reporte de ventas.");
    }

    return data.data;
};