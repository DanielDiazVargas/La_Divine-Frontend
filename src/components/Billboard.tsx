import { useEffect, useState } from "react";
import { getBillboardFunctions, type BillboardFunction } from "../services/BillboardServices";
import SeatMap from "./SeatMap";

/**
 * Componente unificado que muestra las funciones vigentes de la cartelera.
 * Incluye filtros por nombre y fecha, cards con imagen y botón de reserva.
 * Reemplaza tanto la vista de inicio como la vista de cartelera por tabla.
 */
function Billboard() {
    const [functions, setFunctions] = useState<BillboardFunction[]>([]);
    const [nameFilter, setNameFilter] = useState("");
    const [dateFilter, setDateFilter] = useState("");
    const [isSearching, setIsSearching] = useState(false);
    const [message, setMessage] = useState("");
    const [selectedFunction, setSelectedFunction] = useState<BillboardFunction | null>(null);

    // Controla si mostrar el mapa de asientos (FUN-003)
    const [showSeatMap, setShowSeatMap] = useState(false);

    const formatDate = (date: string) => {
        const [year, month, day] = date.split("-");
        if (!year || !month || !day) return date;
        return `${day}-${month}-${year}`;
    };

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

    useEffect(() => {
        loadBillboard(false);
    }, []);

    const handleSearch = () => loadBillboard(true);

    const handleClearFilters = () => {
        setNameFilter("");
        setDateFilter("");
        loadBillboard(false);
    };

    const handleShowDetail = (theaterFunction: BillboardFunction) => {
        setSelectedFunction(theaterFunction);
    };

    /**
     * Abre el mapa de asientos para la función seleccionada (FUN-003).
     */
    const handleReserve = () => {
        setShowSeatMap(true);
    };

    /**
     * Vuelve a la cartelera desde el mapa de asientos.
     */
    const handleBackFromSeatMap = () => {
        setShowSeatMap(false);
        setSelectedFunction(null);
    };

    // ── Vista: Mapa de asientos ──────────────────────────────────────────────
    if (showSeatMap && selectedFunction) {
        return (
            <SeatMap
                functionId={selectedFunction.id}
                functionName={selectedFunction.name}
                onBack={handleBackFromSeatMap}
            />
        );
    }

    // ── Vista: Detalle de función ────────────────────────────────────────────
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

    // ── Vista: Cuadrícula principal ──────────────────────────────────────────
    return (
        <div className="dashboard-page">
            <h2 style={{ color: "#8B0000", borderBottom: "2px solid #8B0000", paddingBottom: "10px", marginBottom: "24px" }}>
                Cartelera
            </h2>

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
                            background: "transparent", border: "1px solid #ccc",
                            borderRadius: "4px", padding: "10px 16px",
                            cursor: "pointer", color: "#666", fontSize: "13px"
                        }}
                    >
                        Limpiar
                    </button>
                )}
            </div>

            {message && <p className="billboard-error">{message}</p>}

            {functions.length > 0 && (
                <div style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
                    gap: "20px", marginTop: "8px"
                }}>
                    {functions.map(f => (
                        <div key={f.id} style={{
                            background: "white", border: "1px solid #C0A060",
                            borderRadius: "8px", overflow: "hidden",
                            boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                            display: "flex", flexDirection: "column"
                        }}>
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

                                <div style={{ padding: "14px", display: "flex", flexDirection: "column", gap: "5px", flex: 1, justifyContent: "space-between" }}>                                <h3 style={{ color: "#8B0000", fontSize: "14px", margin: 0 }}>{f.name}</h3>

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
                                <p style={{ fontSize: "11px", color: "#888", margin: 0 }}>
                                    💺 {f.availableSeats}/{f.totalSeats} disponibles
                                </p>

                                <button
                                    disabled={f.availableSeats === 0}
                                    onClick={() => handleShowDetail(f)}
                                    style={{
                                        marginTop: "auto", padding: "10px", width: "100%",
                                        border: "none", borderRadius: "4px",
                                        fontWeight: "bold", fontSize: "13px",
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
