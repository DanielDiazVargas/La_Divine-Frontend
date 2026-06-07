import { useEffect, useRef, useState } from "react";
import {
  getFunctionSeats,
  createReservation,
  type SeatDto,
  type ReservationData,
} from "../services/ReservationService";

// ─── Mapa de sección → zona SVG ──────────────────────────────────────────────

const SECTION_TO_ZONE: Record<string, string> = {
  "VIP Divine": "vip",
  "Platea": "platea",
  "Anfiteatro": "anfi",
  "Galería": "galeria",
  "Palco": "palco",
};

const ZONES: Record<string, { c: string; dark: string; p: number; l: string }> = {
  vip:     { c: "#D4A017", dark: "#8B6800", p: 85000, l: "VIP Divine"  },
  platea:  { c: "#4A7CC7", dark: "#1A3A7A", p: 45000, l: "Platea"      },
  anfi:    { c: "#E07820", dark: "#7A3A00", p: 28000, l: "Anfiteatro"  },
  galeria: { c: "#3A9A5A", dark: "#1A5A2A", p: 18000, l: "Galería"     },
  palco:   { c: "#8B4FC0", dark: "#4A1A7A", p: 65000, l: "Palco"       },
};

interface SeatMapProps {
  functionId: number;
  functionName: string;
  onBack: () => void;
}

const NS = "http://www.w3.org/2000/svg";

function svgEl(tag: string, attrs: Record<string, string | number>, parent?: Element | null): SVGElement {
  const n = document.createElementNS(NS, tag) as SVGElement;
  for (const [k, v] of Object.entries(attrs)) n.setAttribute(k, String(v));
  if (parent) parent.appendChild(n);
  return n;
}

function svgTx(s: string, x: number, y: number, attrs: Record<string, string>, parent: Element | null) {
  const t = svgEl("text", { x, y, "text-anchor": "middle", "dominant-baseline": "middle", style: "pointer-events:none", ...attrs }, parent);
  t.textContent = s;
  return t;
}

function lighten(hex: string) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgb(${Math.min(255, r + 40)},${Math.min(255, g + 40)},${Math.min(255, b + 40)})`;
}

export default function SeatMap({ functionId, functionName, onBack }: SeatMapProps) {
  const svgRef = useRef<SVGSVGElement>(null);

  // Map: seatNumber → SeatDto (datos reales del backend)
  const seatDataMap = useRef<Map<string, SeatDto>>(new Map());
  // Set de IDs numéricos seleccionados
  const selIds = useRef<Set<number>>(new Set());
  // Map: seatNumber → rect SVGElement para colorear
  const rectMap = useRef<Map<string, SVGElement>>(new Map());

  const [selectedSeats, setSelectedSeats] = useState<SeatDto[]>([]);
  const [loadError, setLoadError] = useState("");
  const [loadingSeats, setLoadingSeats] = useState(true);

  // Reserva
  const [confirming, setConfirming] = useState(false);
  const [reserveError, setReserveError] = useState("");
  const [reservationResult, setReservationResult] = useState<ReservationData | null>(null);

  // ── Carga asientos reales del backend ──────────────────────────────────────
  useEffect(() => {
    getFunctionSeats(functionId)
      .then((seats) => {
        seats.forEach((s) => seatDataMap.current.set(s.seatNumber, s));
        setLoadingSeats(false);
      })
      .catch((e) => {
        setLoadError(e.message);
        setLoadingSeats(false);
      });
  }, [functionId]);

  // ── Renderiza SVG una vez que los datos llegaron ───────────────────────────
  useEffect(() => {
    if (loadingSeats || loadError) return;
    const svg = svgRef.current;
    if (!svg) return;
    svg.innerHTML = "";

    const SW = 18, SH = 15, SRX = 3;

    function makeSeat(
      x: number, y: number,
      zone: string, ltr: string, num: number,
      seatNumber: string, angle = 0
    ) {
      const z = ZONES[zone];
      const dto = seatDataMap.current.get(seatNumber);
      // Si no está en BD todavía (raro), se muestra ocupado por seguridad
      const occ = !dto || dto.status !== 0;

      const g = svgEl("g", {
        "data-sn": seatNumber,
        style: occ ? "cursor:default" : "cursor:pointer",
        transform: `rotate(${angle},${x},${y})`,
      }, svg);

      const fill   = occ ? "#E0E0E0" : z.c;
      const stroke = occ ? "#B0B0B0" : z.dark;

      const r = svgEl("rect", {
        x: x - SW / 2, y: y - SH / 2, width: SW, height: SH, rx: SRX,
        fill, stroke, "stroke-width": "0.8",
      }, g) as SVGElement;

      svgEl("rect", {
        x: x - SW / 2 + 1, y: y - SH / 2, width: SW - 2, height: 4, rx: SRX,
        fill: occ ? "#B0B0B0" : z.dark, "stroke-width": "0",
      }, g);

      const tFill = occ ? "#777" : "rgba(255,255,255,0.95)";
      const tl = svgEl("text", { x, y: y - 2, "text-anchor": "middle", "dominant-baseline": "middle", style: "font-size:5px;font-weight:700;pointer-events:none", fill: tFill }, g);
      tl.textContent = ltr;
      const tn = svgEl("text", { x, y: y + 4, "text-anchor": "middle", "dominant-baseline": "middle", style: "font-size:4.5px;pointer-events:none", fill: tFill }, g);
      tn.textContent = String(num);

      if (!occ && dto) {
        rectMap.current.set(seatNumber, r);
        g.addEventListener("click", () => toggleSeat(seatNumber, zone, r, dto));
        g.addEventListener("mouseenter", () => { if (!selIds.current.has(dto.id)) r.setAttribute("fill", lighten(z.c)); });
        g.addEventListener("mouseleave", () => { if (!selIds.current.has(dto.id)) r.setAttribute("fill", z.c); });
      }
    }

    function makeRow(zone: string, x0: number, y: number, ltr: string, n: number, numStart: number, angle = 0, sp = 20, prefix = "") {
      for (let i = 0; i < n; i++) {
        const num = numStart + i;
        makeSeat(x0 + i * sp, y, zone, ltr, num, `${prefix}${ltr}${num}`, angle);
      }
    }

    function zoneLabel(txt: string, x: number, y: number, color: string, fs = 8) {
      svgEl("rect", { x: x - 40, y: y - 10, width: 80, height: 20, rx: 4, fill: "#ffffff", stroke: color, "stroke-width": "1" }, svg);
      svgTx(txt, x, y, { fill: color, style: `font-size:${fs}px;font-weight:700;pointer-events:none` }, svg);
    }

    // Escenario
    svgEl("rect", { x: 260, y: 10, width: 400, height: 52, rx: 4, fill: "#fff", stroke: "#333", "stroke-width": "1.5" }, svg);
    svgTx("ESCENARIO", 460, 36, { fill: "#111", style: "font-size:16px;font-weight:800;letter-spacing:4px;pointer-events:none" }, svg);

    // VIP
    ["A","B","C","D","E"].forEach((ltr, i) => {
      const n = 8 + i; const x0 = 460 - (n - 1) * 20 / 2; const y = 95 + i * 19;
      makeRow("vip", x0, y, ltr, n, 1, 0, 20);
      svgTx(ltr, x0 - 16, y, { fill: ZONES.vip.dark, style: "font-size:8px;font-weight:700;pointer-events:none" }, svg);
    });

    // Platea
    ["F","G","H","I","J","K"].forEach((ltr, i) => {
      const n = 14 + i; const x0 = 460 - (n - 1) * 20 / 2; const y = 220 + i * 19;
      makeRow("platea", x0, y, ltr, n, 1, 0, 20);
      svgTx(ltr, x0 - 16, y, { fill: ZONES.platea.dark, style: "font-size:8px;font-weight:700;pointer-events:none" }, svg);
    });

    // Anfiteatro
    ["L","M","N","O","P","Q"].forEach((ltr, i) => {
      const n = 16 + i * 2; const x0 = 460 - (n - 1) * 20 / 2; const y = 370 + i * 19;
      makeRow("anfi", x0, y, ltr, n, 1, 0, 20);
      svgTx(ltr, x0 - 16, y, { fill: ZONES.anfi.dark, style: "font-size:8px;font-weight:700;pointer-events:none" }, svg);
    });

    // Galería
    ["R","S","T"].forEach((ltr, i) => {
      const n = 26 + i * 2; const x0 = 460 - (n - 1) * 20 / 2; const y = 520 + i * 19;
      makeRow("galeria", x0, y, ltr, n, 1, 0, 20);
      svgTx(ltr, x0 - 16, y, { fill: ZONES.galeria.dark, style: "font-size:8px;font-weight:700;pointer-events:none" }, svg);
    });

    // Palco Izq
    svgTx("PALCO IZQ", 100, 85, { fill: ZONES.palco.dark, style: "font-size:9px;font-weight:800;pointer-events:none" }, svg);
    ["A","B","C","D","E","F","G","H"].forEach((ltr, i) => {
      const n = 4 + Math.floor(i / 2); const cx = 190 - i * 7; const cy = 110 + i * 22;
      const ang = 20; const rad = ang * Math.PI / 180;
      for (let j = 0; j < n; j++) {
        const x = cx - j * 19 * Math.cos(rad); const y = cy + j * 19 * Math.sin(rad);
        makeSeat(x, y, "palco", ltr, j + 1, `IZQ-${ltr}${j + 1}`, ang);
      }
      svgTx(ltr, cx + 16, cy - 2, { fill: ZONES.palco.dark, style: "font-size:8px;font-weight:700;pointer-events:none" }, svg);
    });

    // Palco Der
    svgTx("PALCO DER", 820, 85, { fill: ZONES.palco.dark, style: "font-size:9px;font-weight:800;pointer-events:none" }, svg);
    ["A","B","C","D","E","F","G","H"].forEach((ltr, i) => {
      const n = 4 + Math.floor(i / 2); const cx = 730 + i * 7; const cy = 110 + i * 22;
      const ang = -20; const rad = Math.abs(ang) * Math.PI / 180;
      for (let j = 0; j < n; j++) {
        const x = cx + j * 19 * Math.cos(rad); const y = cy + j * 19 * Math.sin(rad);
        makeSeat(x, y, "palco", ltr, j + 1, `DER-${ltr}${j + 1}`, ang);
      }
      svgTx(ltr, cx - 16, cy - 2, { fill: ZONES.palco.dark, style: "font-size:8px;font-weight:700;pointer-events:none" }, svg);
    });

    zoneLabel("VIP Divine", 460, 75,  ZONES.vip.dark);
    zoneLabel("Platea",     460, 200, ZONES.platea.dark);
    zoneLabel("Anfiteatro", 460, 350, ZONES.anfi.dark);
    zoneLabel("Galería",    460, 500, ZONES.galeria.dark);

    svgTx("↑  ENTRADA PRINCIPAL", 460, 595, { fill: "#888", style: "font-size:9px;font-weight:700;letter-spacing:2px;pointer-events:none" }, svg);
    svgEl("line", { x1: 300, y1: 575, x2: 620, y2: 575, stroke: "#ddd", "stroke-width": "1.5", "stroke-dasharray": "4 4" }, svg);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadingSeats, loadError]);

  // ── Toggle asiento ─────────────────────────────────────────────────────────
  function toggleSeat(_seatNumber: string, zone: string, r: SVGElement, dto: SeatDto) {
    const z = ZONES[zone];
    if (selIds.current.has(dto.id)) {
      selIds.current.delete(dto.id);
      r.setAttribute("fill", z.c);
      r.setAttribute("stroke", z.dark);
    } else {
      selIds.current.add(dto.id);
      r.setAttribute("fill", "#C0392B");
      r.setAttribute("stroke", "#7B241C");
    }
    const arr = [...selIds.current];
    setSelectedSeats(
      arr.map((id) => [...seatDataMap.current.values()].find((s) => s.id === id)!)
         .filter(Boolean)
    );
  }

  // ── Limpiar selección ──────────────────────────────────────────────────────
  function clearSelection() {
    selIds.current.forEach((id) => {
      const dto = [...seatDataMap.current.values()].find((s) => s.id === id);
      if (!dto) return;
      const r = rectMap.current.get(dto.seatNumber);
      const zone = SECTION_TO_ZONE[dto.section] || "vip";
      if (r) { r.setAttribute("fill", ZONES[zone].c); r.setAttribute("stroke", ZONES[zone].dark); }
    });
    selIds.current.clear();
    setSelectedSeats([]);
  }

  // ── Confirmar reserva ──────────────────────────────────────────────────────
  async function handleConfirm() {
    if (selectedSeats.length === 0) return;
    if (!confirm("¿Está seguro de que desea reservar los asientos seleccionados?")) return;
    setConfirming(true);
    setReserveError("");
    try {
      const result = await createReservation(functionId, [...selIds.current]);
      setReservationResult(result);
    } catch (e: any) {
      setReserveError(e.message);
    } finally {
      setConfirming(false);
    }
  }

  // ── Cálculo de total (suma de precios de asientos seleccionados) ────────────
  const totalPrice = selectedSeats.reduce((acc, s) => acc + s.price, 0);

  // ── Pantalla: cargando ─────────────────────────────────────────────────────
  if (loadingSeats) {
    return (
      <div className="dashboard-page" style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: 300 }}>
        <p style={{ color: "#888", fontSize: 14 }}>Cargando mapa de asientos...</p>
      </div>
    );
  }

  // ── Pantalla: reserva confirmada ───────────────────────────────────────────
  if (reservationResult) {
    return (
      <div className="dashboard-page">
        <div style={{
          maxWidth: 560, margin: "40px auto",
          background: "#fff", border: "1px solid #C0A060",
          borderRadius: 10, padding: "36px 32px",
          boxShadow: "0 4px 20px rgba(0,0,0,0.08)"
        }}>
          <div style={{ textAlign: "center", marginBottom: 24 }}>
            <div style={{ fontSize: 44, marginBottom: 10 }}>🎭</div>
            <h2 style={{ color: "#8B0000", margin: 0 }}>¡Reserva confirmada!</h2>
            <p style={{ color: "#666", marginTop: 6, fontSize: 13 }}>
              Guarda tu código, lo necesitarás para mostrar en taquilla.
            </p>
          </div>

          {/* Código */}
          <div style={{ textAlign: "center", marginBottom: 24 }}>
            <div style={{ fontSize: 12, color: "#999", marginBottom: 4, letterSpacing: 1 }}>CÓDIGO DE RESERVA</div>
            <div style={{
              display: "inline-block", fontSize: 22, fontWeight: 800,
              letterSpacing: 5, color: "#8B0000",
              background: "#F5F0E8", borderRadius: 6,
              padding: "10px 28px", border: "1px dashed #C0A060"
            }}>
              {reservationResult.reservationCode}
            </div>
          </div>

          {/* Resumen */}
          <div style={{ background: "#fafafa", borderRadius: 8, border: "1px solid #eee", padding: "16px 20px", marginBottom: 20 }}>
            <div style={{ fontSize: 12, color: "#999", fontWeight: 700, letterSpacing: 1, marginBottom: 10 }}>RESUMEN</div>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr style={{ borderBottom: "1px solid #eee" }}>
                  <th style={{ textAlign: "left", padding: "4px 0", color: "#555", fontWeight: 600 }}>Asiento</th>
                  <th style={{ textAlign: "left", padding: "4px 0", color: "#555", fontWeight: 600 }}>Sección</th>
                  <th style={{ textAlign: "right", padding: "4px 0", color: "#555", fontWeight: 600 }}>Precio</th>
                </tr>
              </thead>
              <tbody>
                {reservationResult.selectedSeats.map((s) => (
                  <tr key={s.id} style={{ borderBottom: "1px solid #f5f5f5" }}>
                    <td style={{ padding: "5px 0", fontWeight: 700 }}>{s.seatNumber}</td>
                    <td style={{ padding: "5px 0", color: "#666" }}>{s.section}</td>
                    <td style={{ padding: "5px 0", textAlign: "right" }}>${s.price.toLocaleString("es-CL")}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan={2} style={{ paddingTop: 10, fontWeight: 700, color: "#333" }}>Total</td>
                  <td style={{ paddingTop: 10, textAlign: "right", fontWeight: 800, fontSize: 15, color: "#8B0000" }}>
                    ${reservationResult.totalPrice.toLocaleString("es-CL")}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
            <button
              onClick={onBack}
              style={{
                background: "#8B0000", color: "#fff", border: "none",
                borderRadius: 6, padding: "10px 24px",
                fontWeight: 700, fontSize: 13, cursor: "pointer"
              }}
            >
              Volver a cartelera
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Vista principal: mapa ──────────────────────────────────────────────────
  return (
    <div className="dashboard-page">
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
        <button
          onClick={onBack}
          style={{
            background: "transparent", border: "1px solid #ccc",
            borderRadius: 6, padding: "6px 14px",
            cursor: "pointer", color: "#555", fontSize: 13
          }}
        >
          ← Volver
        </button>
        <h2 style={{ color: "#8B0000", margin: 0 }}>
          {functionName} — Selección de asientos
        </h2>
      </div>

      {/* Error de carga */}
      {loadError && <p style={{ color: "#f56558", fontSize: 13, marginBottom: 10 }}>{loadError}</p>}

      {/* Leyenda */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: "6px 14px", justifyContent: "center", marginBottom: 10 }}>
        {Object.entries(ZONES).map(([key, z]) => (
          <div key={key} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: "#444" }}>
            <span style={{ width: 16, height: 12, borderRadius: 3, background: z.c, display: "inline-block", border: "1px solid rgba(0,0,0,0.2)" }} />
            {z.l} (${z.p.toLocaleString("es-CL")})
          </div>
        ))}
        <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: "#444" }}>
          <span style={{ width: 16, height: 12, borderRadius: 3, background: "#E0E0E0", display: "inline-block", border: "1px solid #ccc" }} />Ocupado
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: "#444" }}>
          <span style={{ width: 16, height: 12, borderRadius: 3, background: "#C0392B", display: "inline-block", border: "1px solid #7B241C" }} />Seleccionado
        </div>
      </div>

      {/* SVG — viewBox ajustado para que no se vea tan grande */}
      <div style={{
        background: "#fff", borderRadius: 8,
        border: "1px solid #eaeaea",
        overflowX: "auto", padding: "4px 0"
      }}>
        <svg
          ref={svgRef}
          viewBox="0 0 920 620"
          xmlns={NS}
          style={{ display: "block", width: "100%", maxWidth: 860, margin: "0 auto", height: "auto" }}
        />
      </div>

      {/* Error de reserva */}
      {reserveError && (
        <p style={{ color: "#f56558", fontSize: 13, marginTop: 8 }}>{reserveError}</p>
      )}

      {/* Barra de resumen inferior */}
      {selectedSeats.length > 0 && (
        <div style={{
          marginTop: 12, padding: "14px 18px",
          background: "#F5F0E8", border: "1px solid #C0A060",
          borderRadius: 8, display: "flex", flexWrap: "wrap",
          gap: "8px 20px", alignItems: "center", fontSize: 13
        }}>
          <span>Asientos: <strong>{selectedSeats.length}</strong></span>
          <span style={{ color: "#555" }}>
            {selectedSeats.map((s) => s.seatNumber).join(", ")}
          </span>
          <span>
            Total estimado: <strong style={{ color: "#8B0000", fontSize: 15 }}>
              ${totalPrice.toLocaleString("es-CL")}
            </strong>
          </span>
          <button
            onClick={clearSelection}
            style={{
              padding: "5px 12px", border: "1px solid #ccc", borderRadius: 4,
              background: "#fff", color: "#555", cursor: "pointer", fontSize: 11, fontWeight: 600
            }}
          >
            ✕ Limpiar
          </button>
          <button
            onClick={handleConfirm}
            disabled={confirming}
            style={{
              marginLeft: "auto", padding: "8px 22px", border: "none", borderRadius: 6,
              background: confirming ? "#aaa" : "#8B0000", color: "#fff",
              fontWeight: 700, fontSize: 13, cursor: confirming ? "not-allowed" : "pointer"
            }}
          >
            {confirming ? "Procesando..." : "Confirmar reserva"}
          </button>
        </div>
      )}
    </div>
  );
}