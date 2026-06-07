interface ConfirmModalProps {
  mensaje: string;
  onConfirm: () => void;
  onCancel: () => void;
}

function ConfirmModal({ mensaje, onConfirm, onCancel }: ConfirmModalProps) {
  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 1000,
      background: "rgba(0,0,0,0.5)",
      display: "flex", alignItems: "center", justifyContent: "center"
    }}>
      <div style={{
        background: "#fff", borderRadius: 8,
        border: "1px solid #C0A060",
        padding: "32px 28px", maxWidth: 380, width: "90%",
        boxShadow: "0 8px 32px rgba(0,0,0,0.18)",
        textAlign: "center"
      }}>
        <div style={{ fontSize: 36, marginBottom: 12 }}>🎭</div>
        <h3 style={{ color: "#8B0000", marginBottom: 10, fontSize: "1.1rem" }}>¿Está seguro?</h3>
        <p style={{ color: "#555", fontSize: "0.9rem", marginBottom: 24 }}>{mensaje}</p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
          <button
            onClick={onCancel}
            style={{
              padding: "9px 24px", borderRadius: 4,
              border: "2px solid #8B0000", background: "transparent",
              color: "#8B0000", fontWeight: 700, fontSize: "0.9rem", cursor: "pointer"
            }}
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            style={{
              padding: "9px 24px", borderRadius: 4,
              border: "none", background: "#8B0000",
              color: "#fff", fontWeight: 700, fontSize: "0.9rem", cursor: "pointer"
            }}
          >
            Confirmar
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmModal;