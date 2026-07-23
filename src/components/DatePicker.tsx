import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

interface DatePickerProps {
    /** Fecha en formato "aaaa-mm-dd" (igual que <input type="date">), o "" si no hay selección. */
    value: string;
    onChange: (value: string) => void;
    disabled?: boolean;
}

type CalendarView = "days" | "months" | "years";

const WEEKDAYS = ["L", "M", "M", "J", "V", "S", "D"];
const MONTHS = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];
const MONTHS_SHORT = [
    "Ene", "Feb", "Mar", "Abr", "May", "Jun",
    "Jul", "Ago", "Sep", "Oct", "Nov", "Dic",
];
const YEARS_PER_PAGE = 12;

function pad(n: number) {
    return String(n).padStart(2, "0");
}

function parseValue(value: string): { year: number; month: number; day: number } | null {
    const [y, m, d] = value.split("-").map(Number);
    if (!y || !m || !d) return null;
    return { year: y, month: m - 1, day: d };
}

function formatDisplay(value: string): string {
    const parsed = parseValue(value);
    if (!parsed) return "";
    return `${pad(parsed.day)}/${pad(parsed.month + 1)}/${parsed.year}`;
}

/**
 * Selector de fecha propio (texto dd/mm/aaaa + calendario desplegable), para no
 * depender del formato nativo del <input type="date"> del navegador, que varía
 * según la configuración regional de cada equipo.
 *
 * Además de navegar mes a mes, permite saltar directo a un mes o a un año
 * tocando el nombre del mes o el año en el encabezado.
 */
function DatePicker({ value, onChange, disabled }: DatePickerProps) {
    const [open, setOpen] = useState(false);
    const [position, setPosition] = useState<{ top: number; left: number } | null>(null);
    const [view, setView] = useState<CalendarView>("days");
    const containerRef = useRef<HTMLDivElement>(null);

    const parsed = parseValue(value);
    const today = new Date();
    const [viewYear, setViewYear] = useState(parsed?.year ?? today.getFullYear());
    const [viewMonth, setViewMonth] = useState(parsed?.month ?? today.getMonth());
    const [yearRangeStart, setYearRangeStart] = useState(
        () => (parsed?.year ?? today.getFullYear()) - Math.floor(YEARS_PER_PAGE / 2)
    );

    useEffect(() => {
        if (!open) return;
        const handleClickOutside = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            if (containerRef.current?.contains(target)) return;
            if (target.closest(".date-picker-calendar")) return;
            setOpen(false);
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [open]);

    const toggleOpen = () => {
        if (disabled) return;
        if (!open) {
            const y = parsed?.year ?? today.getFullYear();
            setViewYear(y);
            setViewMonth(parsed?.month ?? today.getMonth());
            setYearRangeStart(y - Math.floor(YEARS_PER_PAGE / 2));
            setView("days");
            const rect = containerRef.current?.getBoundingClientRect();
            if (rect) setPosition({ top: rect.bottom + 4, left: rect.left });
        }
        setOpen(!open);
    };

    const selectDay = (day: number) => {
        onChange(`${viewYear}-${pad(viewMonth + 1)}-${pad(day)}`);
        setOpen(false);
    };

    const selectMonth = (month: number) => {
        setViewMonth(month);
        setView("days");
    };

    const selectYear = (year: number) => {
        setViewYear(year);
        setView("days");
    };

    const goPrevMonth = () => {
        if (viewMonth === 0) { setViewMonth(11); setViewYear(viewYear - 1); }
        else setViewMonth(viewMonth - 1);
    };

    const goNextMonth = () => {
        if (viewMonth === 11) { setViewMonth(0); setViewYear(viewYear + 1); }
        else setViewMonth(viewMonth + 1);
    };

    // Días de calendario, alineados a semana partiendo en lunes.
    const firstDayOfMonth = new Date(viewYear, viewMonth, 1).getDay();
    const leadingBlanks = (firstDayOfMonth + 6) % 7;
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const cells: (number | null)[] = [
        ...Array(leadingBlanks).fill(null),
        ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
    ];

    const yearOptions = Array.from({ length: YEARS_PER_PAGE }, (_, i) => yearRangeStart + i);

    return (
        <div className="date-picker" ref={containerRef}>
            <button
                type="button"
                className="date-picker-input"
                onClick={toggleOpen}
                disabled={disabled}
            >
                <span className={parsed ? "" : "date-picker-placeholder"}>
                    {parsed ? formatDisplay(value) : "dd/mm/aaaa"}
                </span>
                <span className="date-picker-icon">📅</span>
            </button>

            {open && position && createPortal(
                <div className="date-picker-calendar" style={{ top: position.top, left: position.left }}>

                    {view === "days" && (
                        <>
                            <div className="date-picker-header">
                                <button type="button" onClick={goPrevMonth} aria-label="Mes anterior">‹</button>
                                <span className="date-picker-header-title">
                                    <button type="button" className="date-picker-header-link" onClick={() => setView("months")}>
                                        {MONTHS[viewMonth]}
                                    </button>
                                    <button type="button" className="date-picker-header-link" onClick={() => setView("years")}>
                                        {viewYear}
                                    </button>
                                </span>
                                <button type="button" onClick={goNextMonth} aria-label="Mes siguiente">›</button>
                            </div>
                            <div className="date-picker-weekdays">
                                {WEEKDAYS.map((w, i) => <span key={i}>{w}</span>)}
                            </div>
                            <div className="date-picker-days">
                                {cells.map((day, i) => {
                                    const isSelected = !!(parsed && parsed.year === viewYear && parsed.month === viewMonth && parsed.day === day);
                                    return day ? (
                                        <button
                                            type="button"
                                            key={i}
                                            className={`date-picker-day${isSelected ? " selected" : ""}`}
                                            onClick={() => selectDay(day)}
                                        >
                                            {day}
                                        </button>
                                    ) : <span key={i} />;
                                })}
                            </div>
                        </>
                    )}

                    {view === "months" && (
                        <>
                            <div className="date-picker-header">
                                <button type="button" onClick={() => setViewYear(viewYear - 1)} aria-label="Año anterior">‹</button>
                                <button type="button" className="date-picker-header-link" onClick={() => setView("years")}>
                                    {viewYear}
                                </button>
                                <button type="button" onClick={() => setViewYear(viewYear + 1)} aria-label="Año siguiente">›</button>
                            </div>
                            <div className="date-picker-grid">
                                {MONTHS_SHORT.map((m, i) => (
                                    <button
                                        type="button"
                                        key={m}
                                        className={`date-picker-grid-item${i === viewMonth ? " selected" : ""}`}
                                        onClick={() => selectMonth(i)}
                                    >
                                        {m}
                                    </button>
                                ))}
                            </div>
                        </>
                    )}

                    {view === "years" && (
                        <>
                            <div className="date-picker-header">
                                <button
                                    type="button"
                                    onClick={() => setYearRangeStart(yearRangeStart - YEARS_PER_PAGE)}
                                    aria-label="Años anteriores"
                                >
                                    ‹
                                </button>
                                <span className="date-picker-header-title">
                                    {yearRangeStart} - {yearRangeStart + YEARS_PER_PAGE - 1}
                                </span>
                                <button
                                    type="button"
                                    onClick={() => setYearRangeStart(yearRangeStart + YEARS_PER_PAGE)}
                                    aria-label="Años siguientes"
                                >
                                    ›
                                </button>
                            </div>
                            <div className="date-picker-grid">
                                {yearOptions.map((y) => (
                                    <button
                                        type="button"
                                        key={y}
                                        className={`date-picker-grid-item${y === viewYear ? " selected" : ""}`}
                                        onClick={() => selectYear(y)}
                                    >
                                        {y}
                                    </button>
                                ))}
                            </div>
                        </>
                    )}
                </div>,
                document.body
            )}
        </div>
    );
}

export default DatePicker;
