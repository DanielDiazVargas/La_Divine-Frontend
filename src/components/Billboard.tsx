import { useEffect, useState } from "react";
import { getBillboardFunctions, type BillboardFunction } from "../services/BillboardServices";

/**
 * Componente unificado que muestra las funciones vigentes de la cartelera.
 * Incluye filtros por nombre y fecha, cards con imagen y botón de reserva.
 * Reemplaza tanto la vista de inicio como la vista de cartelera por tabla.
 */
function Billboard() {
    // Funciones actualmente mostradas en la cuadrícula de cards.
    const [functions, setFunctions] = useState<BillboardFunction[]>([]);

    // Filtro ingresado por nombre de obra.
    const [nameFilter, setNameFilter] = useState("");

    // Filtro seleccionado por fecha.
    const [dateFilter, setDateFilter] = useState("");

    // Controla el estado visual del botón Buscar.
    const [isSearching, setIsSearching] = useState(false);

    // Mensaje mostrado cuando no hay funciones o cuando el filtro no arroja resultados.
    const [message, setMessage] = useState("");

    // Función seleccionada para ver el detalle previo a reservar.
    const [selectedFunction, setSelectedFunction] = useState<BillboardFunction | null>(null);

    /**
     * Formatea la fecha recibida desde backend al formato dd-mm-yyyy.
     */
    const formatDate = (date: string) => {
        const [year, month, day] = date.split("-");
        if (!year || !month || !day) return date;
        return `${day}-${month}-${year}`;
    };

    /**
     * Formatea el precio usando separador de miles chileno.
     */
    const formatPrice = (price: number) => {
        return `$${price.toLocaleString("es-CL")}`;
    };

    /**
     * Carga la cartelera desde el backend.
     * Cuando useFilters es true, se envían los filtros actuales.
     */
    const loadBillboard = async (useFilters = false) => {
        setIsSearching(true);
        setMessage("");

        try {
            const result = await getBillboardFunctions(
                useFilters ? nameFilter : "",
                useFilters ? dateFilter : ""
            );

            setFunctions(result);

            if (!useFilters && result.length === 0) {
                setMessage("No hay funciones disponibles en este momento");
            }

            if (useFilters && result.length === 0) {
                setMessage("No se encontraron funciones con los criterios indicados");
            }
        } catch (error: any) {
            setFunctions([]);
            setMessage(error.message || "Error al consultar cartelera.");
        } finally {
            setIsSearching(false);
        }
    };

    /**
     * Carga inicial de funciones vigentes al entrar a la vista.
     */
    useEffect(() => {
        loadBillboard(false);
    }, []);

    /**
     * Ejecuta la búsqueda cuando el usuario presiona el botón Buscar.
     */
    const handleSearch = () => {
        loadBillboard(true);
    };

    /**
     * Limpia los filtros y recarga todas las funciones.
     */
    const handleClearFilters = () => {
        setNameFilter("");
        setDateFilter("");
        loadBillboard(false);
    };

    /**
     * Muestra el detalle de la función seleccionada antes de iniciar una reserva.
     */
    const handleShowDetail = (theaterFunction: BillboardFunction) => {
        setSelectedFunction(theaterFunction);
    };

    /**
     * Acción temporal del botón Reservar dentro del detalle.
     * TODO: Redirigir al requerimiento FUN-003 (Reservar Entrada) cuando sea implementado.
     */
    const handleReserve = () => {
        alert("Funcionalidad Reservar Entrada aún no implementada.");
    };

    // Vista de detalle de una función seleccionada
    if (selectedFunction) {
        return (
            <div className="dashboard-page">
                <div className="billboard-card" style={{ maxWidth: "none" }}>
                    <h2>Consultar Cartelera</h2>

                    <div className="billboard-detail">
                        {selectedFunction.imageUrl ? (
                            <img
                                src={selectedFunction.imageUrl}
                                alt={selectedFunction.name}
                                className="billboard-poster"
                            />
                        ) : (
                            <div className="billboard-poster-placeholder">
                                Sin portada
                            </div>
                        )}

                        <div className="billboard-info">
                            <h1>{selectedFunction.name}</h1>

                            <h4>Descripción</h4>
                            <p>{selectedFunction.description}</p>

                            <h4>Fecha</h4>
                            <p>{formatDate(selectedFunction.dateFunction)}</p>

                            <h4>Hora</h4>
                            <p>{selectedFunction.timeFunction}</p>

                            <h4>Precio base</h4>
                            <p>{formatPrice(selectedFunction.basePrice)}</p>

                            <h4>Asientos disponibles</h4>
                            <p>{selectedFunction.availableSeats} de {selectedFunction.totalSeats}</p>
                        </div>
                    </div>

                    <div className="billboard-detail-actions">
                        <button
                            className="billboard-reserve-main"
                            onClick={handleReserve}
                        >
                            Reservar
                        </button>

                        <button
                            className="billboard-back-button"
                            onClick={() => setSelectedFunction(null)}
                        >
                            Volver a cartelera
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Vista principal: cuadrícula de cards con filtros
    return (
        <div className="dashboard-page">
            <h2 style={{ color: "#8B0000", borderBottom: "2px solid #8B0000", paddingBottom: "10px", marginBottom: "24px" }}>
                Cartelera
            </h2>

            {/* Filtros de búsqueda */}
            <div className="billboard-filters">
                <input
                    type="text"
                    placeholder="Buscar por nombre..."
                    value={nameFilter}
                    onChange={e => setNameFilter(e.target.value)}
                />
                <input
                    type="date"
                    value={dateFilter}
                    onChange={e => setDateFilter(e.target.value)}
                />
                <button
                    className="billboard-search-button"
                    onClick={handleSearch}
                    disabled={isSearching}
                >
                    <strong>{isSearching ? "Buscando..." : "Buscar"}</strong>
                </button>
                {(nameFilter || dateFilter) && (
                    <button
                        onClick={handleClearFilters}
                        style={{
                            background: "transparent",
                            border: "1px solid #ccc",
                            borderRadius: "4px",
                            padding: "10px 16px",
                            cursor: "pointer",
                            color: "#666",
                            fontSize: "13px"
                        }}
                    >
                        Limpiar
                    </button>
                )}
            </div>

            {/* Mensaje de error o sin resultados */}
            {message && (
                <p className="billboard-error">{message}</p>
            )}

            {/* Cuadrícula de cards */}
            {functions.length > 0 && (
                <div style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
                    gap: "20px",
                    marginTop: "8px"
                }}>
                    {functions.map(f => (
                        <div key={f.id} style={{
                            background: "white",
                            border: "1px solid #C0A060",
                            borderRadius: "8px",
                            overflow: "hidden",
                            boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                            display: "flex",
                            flexDirection: "column"
                        }}>
                            {/* Área de imagen o espacio en blanco */}
                            <div style={{ height: "160px", borderBottom: "1px solid #eee" }}>
                                {f.imageUrl ? (
                                    <img
                                        src={f.imageUrl}
                                        alt={f.name}
                                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                                    />
                                ) : (
                                    <div style={{ width: "100%", height: "100%", background: "#fff" }} />
                                )}
                            </div>

                            {/* Información de la función */}
                            <div style={{ padding: "14px", display: "flex", flexDirection: "column", gap: "5px", flex: 1 }}>
                                <h3 style={{ color: "#8B0000", fontSize: "14px", margin: 0 }}>{f.name}</h3>

                                {f.description && (
                                    <p style={{
                                        fontSize: "12px", color: "#555", margin: 0,
                                        overflow: "hidden", textOverflow: "ellipsis",
                                        display: "-webkit-box",
                                        WebkitLineClamp: 2,
                                        WebkitBoxOrient: "vertical" as const
                                    }}>
                                        {f.description}
                                    </p>
                                )}

                                <p style={{ fontSize: "12px", color: "#777", margin: 0 }}>
                                    📅 {formatDate(f.dateFunction)} &nbsp;🕐 {f.timeFunction}
                                </p>

                                <p style={{ fontSize: "13px", fontWeight: "bold", color: "#8B0000", margin: 0 }}>
                                    {formatPrice(f.basePrice)}
                                </p>

                                <p style={{ fontSize: "11px", color: "#888", margin: 0 }}>
                                    💺 {f.availableSeats}/{f.totalSeats} disponibles
                                </p>

                                {/* Botón Reservar o No disponible */}
                                <button
                                    disabled={f.availableSeats === 0}
                                    onClick={() => handleShowDetail(f)}
                                    style={{
                                        marginTop: "8px",
                                        padding: "10px",
                                        width: "100%",
                                        border: "none",
                                        borderRadius: "4px",
                                        fontWeight: "bold",
                                        fontSize: "13px",
                                        cursor: f.availableSeats > 0 ? "pointer" : "not-allowed",
                                        backgroundColor: f.availableSeats > 0 ? "#00a650" : "#f56558",
                                        color: "white"
                                    }}
                                >
                                    {f.availableSeats > 0 ? "Reservar" : "No disponible"}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default Billboard;
