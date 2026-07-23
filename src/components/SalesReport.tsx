import { useState } from "react";
import {
    getSalesReport,
    type SalesReport
} from "../services/ReportServices";
import InfoTooltip from "./InfoTooltip";
import DatePicker from "./DatePicker";

/**
 * Componente que permite al administrador visualizar el reporte de ventas.
 * El filtro por rango de fechas se aplica sobre la fecha de la función.
 */
function SalesReportComponent() {
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [report, setReport] = useState<SalesReport | null>(null);
    const [message, setMessage] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    /**
     * Formatea valores monetarios en pesos chilenos.
     */
    const formatCurrency = (value: number) => {
        return value.toLocaleString("es-CL", {
            style: "currency",
            currency: "CLP"
        });
    };

    /**
     * Convierte una fecha en formato yyyy-MM-dd a dd/MM/yyyy.
     */
    const formatDate = (date: string) => {
        const [year, month, day] = date.split("-");
        if (!year || !month || !day) return date;

        return `${day}/${month}/${year}`;
    };

    /**
     * Valida las fechas ingresadas antes de consultar el backend.
     */
    const validateDates = () => {
        if (!startDate) {
            return "Debe ingresar una fecha de inicio.";
        }

        if (!endDate) {
            return "Debe ingresar una fecha de término.";
        }

        if (startDate > endDate) {
            return "La fecha de inicio no puede ser posterior a la fecha de término";
        }

        return "";
    };

    /**
     * Consulta el reporte de ventas en el backend.
     */
    const handleGenerateReport = async () => {
        const validationMessage = validateDates();

        if (validationMessage) {
            setMessage(validationMessage);
            setReport(null);
            return;
        }

        setIsLoading(true);
        setMessage("");
        setReport(null);

        try {
            const result = await getSalesReport(startDate, endDate);
            setReport(result);
        } catch (error: any) {
            setMessage(error.message || "Error al generar reporte de ventas.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="dashboard-page">
            <div className="sales-report-card">
                <h2>
                    Reporte de ventas
                    <InfoTooltip text="Elige una fecha de inicio y una de término, luego presiona 'Generar reporte' para ver cuántas entradas se vendieron, cuánto dinero se recaudó y qué tan llenas estuvieron las funciones en ese período." />
                </h2>

                <p className="sales-report-description">
                    El reporte considera las funciones dentro del rango de fechas seleccionado.
                </p>

                <div className="sales-report-filters">
                    <div className="sales-report-field">
                        <label>Fecha inicio</label>
                        <DatePicker value={startDate} onChange={setStartDate} />
                    </div>

                    <div className="sales-report-field">
                        <label>Fecha término</label>
                        <DatePicker value={endDate} onChange={setEndDate} />
                    </div>

                    <button
                        className="sales-report-button"
                        onClick={handleGenerateReport}
                        disabled={isLoading}
                    >
                        <strong>{isLoading ? "Generando..." : "Generar reporte"}</strong>
                    </button>
                </div>

                {message && (
                    <p className="sales-report-error">
                        {message}
                    </p>
                )}

                {report && (
                    <>
                        <section className="sales-report-summary">
                            <div className="sales-summary-box">
                                <span>Funciones</span>
                                <strong>{report.summary.functionCount}</strong>
                            </div>

                            <div className="sales-summary-box">
                                <span>Entradas vendidas</span>
                                <strong>{report.summary.totalSoldTickets}</strong>
                            </div>

                            <div className="sales-summary-box">
                                <span>Entradas pendientes</span>
                                <strong>{report.summary.totalPendingTickets}</strong>
                            </div>

                            <div className="sales-summary-box">
                                <span>Monto ganado</span>
                                <strong>{formatCurrency(report.summary.totalRevenue)}</strong>
                            </div>
                        </section>

                        <section className="sales-report-section">
                            <h3>Ingresos por función</h3>

                            <div className="sales-table-wrapper">
                                <table className="sales-report-table">
                                    <thead>
                                        <tr>
                                            <th>Función</th>
                                            <th>Fecha</th>
                                            <th>Hora</th>
                                            <th>Vendidas</th>
                                            <th>Pendientes</th>
                                            <th>Ingreso total</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {report.functionSales.map((functionSale) => (
                                            <tr key={functionSale.functionId}>
                                                <td>{functionSale.functionName}</td>
                                                <td>{formatDate(functionSale.dateFunction)}</td>
                                                <td>{functionSale.timeFunction}</td>
                                                <td>{functionSale.soldTickets}</td>
                                                <td>{functionSale.pendingTickets}</td>
                                                <td>{formatCurrency(functionSale.totalRevenue)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </section>

                        <section className="sales-report-section">
                            <h3>Detalle de entradas</h3>

                            <div className="sales-table-wrapper">
                                <table className="sales-report-table">
                                    <thead>
                                        <tr>
                                            <th>Código</th>
                                            <th>Función</th>
                                            <th>Fecha</th>
                                            <th>Asiento</th>
                                            <th>Sección</th>
                                            <th>Estado</th>
                                            <th>Monto</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {report.ticketDetails.map((ticket, index) => (
                                            <tr key={`${ticket.reservationCode}-${ticket.seatNumber}-${index}`}>
                                                <td>{ticket.reservationCode}</td>
                                                <td>{ticket.functionName}</td>
                                                <td>{formatDate(ticket.dateFunction)}</td>
                                                <td>{ticket.seatNumber}</td>
                                                <td>{ticket.section}</td>
                                                <td>
                                                    <span className={`sales-status ${ticket.paymentStatus === "Pagada" ? "paid" : "pending"}`}>
                                                        {ticket.paymentStatus}
                                                    </span>
                                                </td>
                                                <td>{formatCurrency(ticket.revenueAmount)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </section>

                        <section className="sales-report-section">
                            <h3>Ocupación por función y sección</h3>

                            {report.occupancyByFunction.map((occupancy) => (
                                <div
                                    className="sales-occupancy-card"
                                    key={occupancy.functionId}
                                >
                                    <div className="sales-occupancy-header">
                                        <div>
                                            <h4>{occupancy.functionName}</h4>
                                            <p>
                                                {formatDate(occupancy.dateFunction)} · {occupancy.timeFunction} · {occupancy.roomName}
                                            </p>
                                        </div>

                                        <div className="sales-occupancy-percentage">
                                            <span>Ocupación general</span>
                                            <strong>{occupancy.occupancyPercentage}%</strong>
                                            <small>
                                                {occupancy.soldSeats} / {occupancy.totalSeats} asientos vendidos
                                            </small>
                                        </div>
                                    </div>

                                    <div className="sales-table-wrapper">
                                        <table className="sales-report-table">
                                            <thead>
                                                <tr>
                                                    <th>Sección</th>
                                                    <th>Vendidos</th>
                                                    <th>Pendientes</th>
                                                    <th>Total asientos</th>
                                                    <th>Ocupación</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {occupancy.sections.map((section) => (
                                                    <tr key={`${occupancy.functionId}-${section.section}`}>
                                                        <td>{section.section}</td>
                                                        <td>{section.soldSeats}</td>
                                                        <td>{section.pendingSeats}</td>
                                                        <td>{section.totalSeats}</td>
                                                        <td>{section.occupancyPercentage}%</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            ))}
                        </section>
                    </>
                )}
            </div>
        </div>
    );
}

export default SalesReportComponent;