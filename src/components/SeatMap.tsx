import { useEffect, useRef, useState } from "react";
import { createReservation } from "../services/ReservationService";

// ─── Tipos ───────────────────────────────────────────────────────────────────

interface Zone {
  c: string;
  dark: string;
  p: number;
  l: string;
}

interface SeatInfo {
  seatId: string;
  zone: keyof typeof ZONES;
  occupied: boolean;
}

interface SeatMapProps {
  /** ID de la función seleccionada desde Billboard */
  functionId: number;
  /** Precio base de la función (viene del backend) */
  basePrice: number;
  /** Nombre de la función para mostrar en el resumen */
  functionName: string;
  /** Callback para volver a la cartelera */
  onBack: () => void;
}

// ─── Constantes de zonas ─────────────────────────────────────────────────────

const ZONES = {
  vip:     { c: "#D4A017", dark: "#8B6800", p: 85000, l: "VIP Divine" },
  platea:  { c: "#4A7CC7", dark: "#1A3A7A", p: 45000, l: "Platea"     },
  anfi:    { c: "#E07820", dark: "#7A3A00", p: 28000, l: "Anfiteatro"  },
  galeria: { c: "#3A9A5A", dark: "#1A5A2A", p: 18000, l: "Galería"    },
  palco:   { c: "#8B4FC0", dark: "#4A1A7A", p: 65000, l: "Palco"      },
} satisfies Record<string, Zone>;

const OCC_RATE: Record<keyof typeof ZONES, number> = {
  vip: 0.18, platea: 0.28, anfi: 0.30, galeria: 0.22, palco: 0.30,
};

// ─── Helpers SVG ─────────────────────────────────────────────────────────────

const NS = "http://www.w3.org/2000/svg";

function svgEl(
  tag: string,
  attrs: Record<string, string | number>,
  parent?: SVGElement | SVGSVGElement
): SVGElement {
  const n = document.createElementNS(NS, tag) as SVGElement;
  for (const [k, v] of Object.entries(attrs)) n.setAttribute(k, String(v));
  if (parent) parent.appendChild(n);
  return n;
}

function svgTx(
  s: string,
  x: number,
  y: number,
  attrs: Record<string, string>,
  parent: SVGElement | SVGSVGElement
): SVGElement {
  const t = svgEl(
    "text",
    { x, y, "text-anchor": "middle", "dominant-baseline": "middle",
      style: "pointer-events:none", ...attrs },
    parent
  );
  t.textContent = s;
  return t;
}

function lighten(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgb(${Math.min(255, r + 40)},${Math.min(255, g + 40)},${Math.min(255, b + 40)})`;
}

// ─── Componente principal ─────────────────────────────────────────────────────

export default function SeatMap({ functionId, basePrice, functionName, onBack }: SeatMapProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const selRef = useRef<Set<string>>(new Set());

  // Estado reactivo para el resumen inferior
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [total, setTotal] = useState(0);

  // Estado de envío
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [reservationCode, setReservationCode] = useState("");

  // Mapa seatId → zone (para calcular precio al seleccionar)
  const seatZoneMap = useRef<Map<string, keyof typeof ZONES>>(new Map());

  // ── Cálculo de precio según ERS ──────────────────────────────────────────
  // Precio total = suma de precio por zona de cada asiento + cant * precio base
  function calcTotal(seats: string[]): number {
    const zoneSum = seats.reduce((acc, id) => {
      const z = seatZoneMap.current.get(id);
      return acc + (z ? ZONES[z].p : 0);
    }, 0);
    return zoneSum + seats.length * basePrice;
  }

  // ── Toggle de asiento ────────────────────────────────────────────────────
  function toggleSeat(seatId: string, zone: keyof typeof ZONES, rectEl: SVGElement) {
    const sel = selRef.current;
    if (sel.has(seatId)) {
      sel.delete(seatId);
      rectEl.setAttribute("fill", ZONES[zone].c);
      rectEl.setAttribute("stroke", ZONES[zone].dark);
    } else {
      sel.add(seatId);
      rectEl.setAttribute("fill", "#C0392B");
      rectEl.setAttribute("stroke", "#7B241C");
    }
    const arr = [...sel];
    setSelectedSeats(arr);
    setTotal(calcTotal(arr));
  }

  // ── Limpiar selección ────────────────────────────────────────────────────
  function clearSelection() {
    selRef.current.forEach((id) => {
      const zone = seatZoneMap.current.get(id)!;
      const rect = svgRef.current?.querySelector<SVGElement>(`[data-seat-id="${id}"] rect`);
      if (rect) {
        rect.setAttribute("fill", ZONES[zone].c);
        rect.setAttribute("stroke", ZONES[zone].dark);
      }
    });
    selRef.current.clear();
    setSelectedSeats([]);
    setTotal(0);
  }

  // ── Renderizado SVG (idéntico al HTML original) ──────────────────────────
  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    svg.innerHTML = "";

    const SW = 18, SH = 15, SRX = 3;

    function makeSeat(
      x: number, y: number,
      zone: keyof typeof ZONES,
      ltr: string, num: number,
      occ: boolean,
      angle = 0,
      seatId: string
    ) {
      seatZoneMap.current.set(seatId, zone);
      const z = ZONES[zone];
      const g = svgEl("g", {
        "data-seat-id": seatId,
        "data-zone": zone,
        style: occ ? "" : "cursor:pointer",
        transform: `rotate(${angle},${x},${y})`,
      }, svg) as SVGElement;

      const fill   = occ ? "#E0E0E0" : z.c;
      const stroke = occ ? "#B0B0B0" : z.dark;

      const r = svgEl("rect", {
        x: x - SW / 2, y: y - SH / 2, width: SW, height: SH, rx: SRX,
        fill, stroke, "stroke-width": "0.8",
        "data-seat-id": seatId, "data-zone": zone,
      }, g) as SVGElement;

      svgEl("rect", {
        x: x - SW / 2 + 1, y: y - SH / 2, width: SW - 2, height: 4, rx: SRX,
        fill: occ ? "#B0B0B0" : z.dark, "stroke-width": "0",
      }, g);

      const tFill = occ ? "#777" : "rgba(255,255,255,0.95)";

      const tl = svgEl("text", {
        x, y: y - 2, "text-anchor": "middle", "dominant-baseline": "middle",
        style: "font-size:5px;font-weight:700;pointer-events:none", fill: tFill,
      }, g);
      tl.textContent = ltr;

      const tn = svgEl("text", {
        x, y: y + 4, "text-anchor": "middle", "dominant-baseline": "middle",
        style: "font-size:4.5px;pointer-events:none", fill: tFill,
      }, g);
      tn.textContent = String(num);

      if (!occ) {
        g.addEventListener("click", () => toggleSeat(seatId, zone, r));
        g.addEventListener("mouseenter", () => {
          if (!selRef.current.has(seatId)) r.setAttribute("fill", lighten(z.c));
        });
        g.addEventListener("mouseleave", () => {
          if (!selRef.current.has(seatId)) r.setAttribute("fill", z.c);
        });
      }
    }

    function makeRow(
      zone: keyof typeof ZONES, x0: number, y: number,
      ltr: string, n: number, numStart: number,
      angle = 0, sp = 20, prefix = ""
    ) {
      for (let i = 0; i < n; i++) {
        const num = numStart + i;
        const seatId = prefix + ltr + num;
        const occ = Math.random() < OCC_RATE[zone];
        makeSeat(x0 + i * sp, y, zone, ltr, num, occ, angle, seatId);
      }
    }

    function zoneLabel(txt: string, x: number, y: number, color: string, fs = 8) {
      svgEl("rect", { x: x - 40, y: y - 10, width: 80, height: 20, rx: 4,
        fill: "#ffffff", stroke: color, "stroke-width": "1" }, svg);
      svgTx(txt, x, y, { fill: color,
        style: `font-size:${fs}px;font-weight:700;pointer-events:none` }, svg);
    }

    // Escenario
    svgEl("rect", { x: 260, y: 10, width: 400, height: 52, rx: 4,
      fill: "#fff", stroke: "#333", "stroke-width": "1.5" }, svg);
    svgTx("ESCENARIO", 460, 36,
      { fill: "#111", style: "font-size:16px;font-weight:800;letter-spacing:4px;pointer-events:none" }, svg);

    // VIP
    ["A","B","C","D","E"].forEach((ltr, i) => {
      const n = 8 + i;
      const x0 = 460 - (n - 1) * 20 / 2;
      const y = 95 + i * 19;
      makeRow("vip", x0, y, ltr, n, 1, 0, 20);
      svgTx(ltr, x0 - 16, y,
        { fill: ZONES.vip.dark, style: "font-size:8px;font-weight:700;pointer-events:none" }, svg);
    });

    // Platea
    ["F","G","H","I","J","K"].forEach((ltr, i) => {
      const n = 14 + i;
      const x0 = 460 - (n - 1) * 20 / 2;
      const y = 220 + i * 19;
      makeRow("platea", x0, y, ltr, n, 1, 0, 20);
      svgTx(ltr, x0 - 16, y,
        { fill: ZONES.platea.dark, style: "font-size:8px;font-weight:700;pointer-events:none" }, svg);
    });

    // Anfiteatro
    ["L","M","N","O","P","Q"].forEach((ltr, i) => {
      const n = 16 + i * 2;
      const x0 = 460 - (n - 1) * 20 / 2;
      const y = 370 + i * 19;
      makeRow("anfi", x0, y, ltr, n, 1, 0, 20);
      svgTx(ltr, x0 - 16, y,
        { fill: ZONES.anfi.dark, style: "font-size:8px;font-weight:700;pointer-events:none" }, svg);
    });

    // Galería
    ["R","S","T"].forEach((ltr, i) => {
      const n = 26 + i * 2;
      const x0 = 460 - (n - 1) * 20 / 2;
      const y = 520 + i * 19;
      makeRow("galeria", x0, y, ltr, n, 1, 0, 20);
      svgTx(ltr, x0 - 16, y,
        { fill: ZONES.galeria.dark, style: "font-size:8px;font-weight:700;pointer-events:none" }, svg);
    });

    // Palco Izquierda
    svgTx("PALCO IZQ", 100, 85,
      { fill: ZONES.palco.dark, style: "font-size:9px;font-weight:800;pointer-events:none" }, svg);
    const palcoLetters = ["A","B","C","D","E","F","G","H"];
    palcoLetters.forEach((ltr, i) => {
      const n = 4 + Math.floor(i / 2);
      const cx = 190 - i * 7;
      const cy = 110 + i * 22;
      const ang = 20;
      const rad = ang * Math.PI / 180;
      for (let j = 0; j < n; j++) {
        const x = cx - j * 19 * Math.cos(rad);
        const y = cy + j * 19 * Math.sin(rad);
        const seatId = "IZQ-" + ltr + (j + 1);
        const occ = Math.random() < OCC_RATE.palco;
        makeSeat(x, y, "palco", ltr, j + 1, occ, ang, seatId);
      }
      svgTx(ltr, cx + 16, cy - 2,
        { fill: ZONES.palco.dark, style: "font-size:8px;font-weight:700;pointer-events:none" }, svg);
    });

    // Palco Derecha
    svgTx("PALCO DER", 820, 85,
      { fill: ZONES.palco.dark, style: "font-size:9px;font-weight:800;pointer-events:none" }, svg);
    palcoLetters.forEach((ltr, i) => {
      const n = 4 + Math.floor(i / 2);
      const cx = 730 + i * 7;
      const cy = 110 + i * 22;
      const ang = -20;
      const rad = Math.abs(ang) * Math.PI / 180;
      for (let j = 0; j < n; j++) {
        const x = cx + j * 19 * Math.cos(rad);
        const y = cy + j * 19 * Math.sin(rad);
        const seatId = "DER-" + ltr + (j + 1);
        const occ = Math.random() < OCC_RATE.palco;
        makeSeat(x, y, "palco", ltr, j + 1, occ, ang, seatId);
      }
      svgTx(ltr, cx - 16, cy - 2,
        { fill: ZONES.palco.dark, style: "font-size:8px;font-weight:700;pointer-events:none" }, svg);
    });

    // Etiquetas de zona
    zoneLabel("VIP Divine", 460, 75,  ZONES.vip.dark,     8);
    zoneLabel("Platea",     460, 200, ZONES.platea.dark,   8);
    zoneLabel("Anfiteatro", 460, 350, ZONES.anfi.dark,     8);
    zoneLabel("Galería",    460, 500, ZONES.galeria.dark,  8);

    // Orientación
    svgTx("↑  ENTRADA PRINCIPAL", 460, 595,
      { fill: "#888", style: "font-size:9px;font-weight:700;letter-spacing:2px;pointer-events:none" }, svg);
    svgEl("line", { x1: 300, y1: 575, x2: 620, y2: 575,
      stroke: "#ddd", "stroke-width": "1.5", "stroke-dasharray": "4 4" }, svg);

  // Solo se ejecuta al montar; los handlers usan refs para no re-renderizar el SVG.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Confirmar reserva ────────────────────────────────────────────────────
  async function handleReserve() {
    if (selectedSeats.length === 0) return;
    if (!confirm("¿Está seguro de que desea reservar los asientos seleccionados?")) return;

    setLoading(true);
    setError("");
    try {
      const response = await createReservation({
        functionId,
        seatIds: selectedSeats,
        totalPrice: total,
      });
      setReservationCode(response.reservationCode);
      setSuccess(true);
    } catch (e: any) {
      setError(e.message || "Error al procesar la reserva.");
    } finally {
      setLoading(false);
    }
  }

  // ── Pantalla de éxito ────────────────────────────────────────────────────
  if (success) {
    return (
      <div className="dashboard-page">
        <div style={{
          maxWidth: 480, margin: "60px auto", textAlign: "center",
          background: "#fff", border: "1px solid #C0A060", borderRadius: 10,
          padding: "40px 32px", boxShadow: "0 4px 20px rgba(0,0,0,0.08)"
        }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🎭</div>
          <h2 style={{ color: "#8B0000", marginBottom: 8 }}>¡Reserva confirmada!</h2>
          <p style={{ color: "#555", marginBottom: 16 }}>
            Tu código de reserva es:
          </p>
          <div style={{
            fontSize: 24, fontWeight: 800, letterSpacing: 4,
            color: "#8B0000", background: "#F5F0E8",
            borderRadius: 6, padding: "12px 24px", marginBottom: 24,
            display: "inline-block"
          }}>
            {reservationCode}
          </div>
          <br />
          <button
            onClick={onBack}
            style={{
              background: "#8B0000", color: "#fff", border: "none",
              borderRadius: 6, padding: "10px 24px", fontWeight: 700,
              fontSize: 14, cursor: "pointer"
            }}
          >
            Volver a cartelera
          </button>
        </div>
      </div>
    );
  }

  // ── Vista principal ──────────────────────────────────────────────────────
  return (
    <div className="dashboard-page">
      {/* Encabezado */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
        <button
          onClick={onBack}
          style={{
            background: "transparent", border: "1px solid #ccc",
            borderRadius: 6, padding: "6px 14px", cursor: "pointer",
            color: "#555", fontSize: 13
          }}
        >
          ← Volver
        </button>
        <h2 style={{ color: "#8B0000", margin: 0, borderBottom: "none" }}>
          {functionName} — Selección de asientos
        </h2>
      </div>

      {/* Leyenda */}
      <div style={{
        display: "flex", flexWrap: "wrap", gap: "8px 16px",
        justifyContent: "center", marginBottom: 12
      }}>
        {(Object.entries(ZONES) as [keyof typeof ZONES, Zone][]).map(([key, z]) => (
          <div key={key} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: "#444", fontWeight: 500 }}>
            <span style={{
              width: 18, height: 14, borderRadius: 3, background: z.c,
              display: "inline-block", border: "1px solid rgba(0,0,0,0.2)"
            }} />
            {z.l} (${z.p.toLocaleString("es-CL")})
          </div>
        ))}
        <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: "#444", fontWeight: 500 }}>
          <span style={{ width: 18, height: 14, borderRadius: 3, background: "#E0E0E0", display: "inline-block", border: "1px solid rgba(0,0,0,0.2)" }} />
          Ocupado
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: "#444", fontWeight: 500 }}>
          <span style={{ width: 18, height: 14, borderRadius: 3, background: "#C0392B", display: "inline-block", border: "1px solid #7B241C" }} />
          Seleccionado
        </div>
      </div>

      {/* SVG del mapa */}
      <div style={{ background: "#fff", borderRadius: 8, border: "1px solid #eaeaea", padding: "8px 0", overflowX: "auto" }}>
        <svg
          ref={svgRef}
          viewBox="0 0 920 620"
          xmlns={NS}
          style={{ display: "block", width: "100%", height: "auto" }}
        />
      </div>

      {/* Error de asiento (ERS: mostrar en #f56558) */}
      {error && (
        <p style={{ color: "#f56558", fontSize: 13, marginTop: 8 }}>{error}</p>
      )}

      {/* Barra de resumen y confirmación */}
      {selectedSeats.length > 0 && (
        <div style={{
          marginTop: 12, padding: "14px 18px",
          background: "#F5F0E8", border: "1px solid #C0A060",
          borderRadius: 8, display: "flex", flexWrap: "wrap",
          gap: "10px 20px", alignItems: "center", fontSize: 13, color: "#444"
        }}>
          <span>Asientos seleccionados: <strong style={{ color: "#000" }}>{selectedSeats.length}</strong></span>
          <span>Asientos: <strong style={{ color: "#000" }}>{selectedSeats.join(", ")}</strong></span>
          <span>Total: <strong style={{ color: "#8B0000", fontSize: 15 }}>${total.toLocaleString("es-CL")}</strong></span>

          <button
            onClick={clearSelection}
            style={{
              padding: "6px 14px", border: "1px solid #ccc", borderRadius: 4,
              background: "#fff", color: "#333", cursor: "pointer",
              fontSize: 11, fontWeight: 600
            }}
          >
            ✕ Limpiar
          </button>

          <button
            onClick={handleReserve}
            disabled={loading}
            style={{
              padding: "8px 20px", border: "none", borderRadius: 6,
              background: loading ? "#aaa" : "#8B0000", color: "#fff",
              fontWeight: 700, fontSize: 13, cursor: loading ? "not-allowed" : "pointer",
              marginLeft: "auto"
            }}
          >
            {loading ? "Procesando..." : "Confirmar reserva"}
          </button>
        </div>
      )}
    </div>
  );
}
