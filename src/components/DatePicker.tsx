import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

interface DatePickerProps {
    /** Fecha en formato "aaaa-mm-dd" (igual que <input type="date">), o "" si no hay selección. */
    value: string;
    onChange: (value: string) => void;
    disabled?: boolean;
}

const WEEKDAYS = ["L", "M", "M", "J", "V", "S", "D"];
const MONTHS = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];

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
 */
function DatePicker({ value, onChange, disabled }: DatePickerProps) {
    const [open, setOpen] = useState(false);
    const [position, setPosition] = useState<{ top: number; left: number } | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    const parsed = parseValue(value);
    const today = new Date();
    const [viewYear, setViewYear] = useState(parsed?.year ?? today.getFullYear());
    const [viewMonth, setViewMonth] = useState(parsed?.month ?? today.getMonth());

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
            setViewYear(parsed?.year ?? today.getFullYear());
            setViewMonth(parsed?.month ?? today.getMonth());
            const rect = containerRef.current?.getBoundingClientRect();
            if (rect) setPosition({ top: rect.bottom + 4, left: rect.left });
        }
        setOpen(!open);
    };

    const selectDay = (day: number) => {
        onChange(`${viewYear}-${pad(viewMonth + 1)}-${pad(day)}`);
        setOpen(false);
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
                    <div className="date-picker-header">
                        <button type="button" onClick={goPrevMonth} aria-label="Mes anterior">‹</button>
                        <span>{MONTHS[viewMonth]} {viewYear}</span>
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
                </div>,
                document.body
            )}
        </div>
    );
}

export default DatePicker;
