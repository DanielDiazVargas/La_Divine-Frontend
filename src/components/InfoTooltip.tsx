import { useRef, useState } from "react";
import { createPortal } from "react-dom";

interface InfoTooltipProps {
    text: string;
}

/**
 * Ícono de ayuda con un mensaje flotante al pasar el mouse o el foco.
 * Se usa para explicar, en lenguaje simple, cómo usar una función de la pantalla.
 *
 * El mensaje se renderiza en un portal con position:fixed (calculado desde la
 * posición real del ícono) para que siempre quede por encima de todo el
 * contenido, incluida la barra superior fija, en vez de ser recortado por el
 * overflow del contenedor donde vive el ícono.
 */
function InfoTooltip({ text }: InfoTooltipProps) {
    const iconRef = useRef<HTMLSpanElement>(null);
    const [position, setPosition] = useState<{ top: number; left: number } | null>(null);

    const updatePosition = () => {
        const rect = iconRef.current?.getBoundingClientRect();
        if (!rect) return;
        setPosition({
            top: rect.top + rect.height / 2,
            left: rect.right + 10,
        });
    };

    const hide = () => setPosition(null);

    return (
        <span
            ref={iconRef}
            className="info-tooltip"
            tabIndex={0}
            onMouseEnter={updatePosition}
            onMouseLeave={hide}
            onFocus={updatePosition}
            onBlur={hide}
        >
            <span className="info-tooltip-icon" aria-label="Ayuda">?</span>
            {position && createPortal(
                <span
                    className="info-tooltip-text info-tooltip-text-portal"
                    style={{ top: position.top, left: position.left }}
                >
                    {text}
                </span>,
                document.body
            )}
        </span>
    );
}

export default InfoTooltip;
