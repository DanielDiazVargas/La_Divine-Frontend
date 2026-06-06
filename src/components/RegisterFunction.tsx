import { useState } from "react";
import { registerFunction } from "../services/FunctionServices.ts";

function RegisterFunction() {
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        dateFunction: "",
        timeFunction: "",
    });

    const [image, setImage] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
    const [errorMsg, setErrorMsg] = useState("");
    const [successMsg, setSuccessMsg] = useState("");
    const [loading, setLoading] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setFieldErrors({ ...fieldErrors, [e.target.name]: "" });
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImage(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMsg("");
        setSuccessMsg("");

        const errors: Record<string, string> = {};
        if (!formData.name.trim()) errors.name = "Falta completar el campo Nombre de la obra";
        if (!formData.description.trim()) errors.description = "Falta completar el campo Descripción de la obra";
        if (!formData.dateFunction) errors.dateFunction = "Falta completar el campo Fecha de la obra";
        if (!formData.timeFunction) errors.timeFunction = "Falta completar el campo Hora de la obra";

        // Validación ERS: fecha y hora no puede ser anterior a la actual
        if (formData.dateFunction && formData.timeFunction) {
            const fechaHora = new Date(`${formData.dateFunction}T${formData.timeFunction}`);
            if (fechaHora < new Date()) {
                errors.dateFunction = "La fecha y hora de la función no puede ser anterior a la fecha actual";
            }
        }

        if (Object.keys(errors).length > 0) {
            setFieldErrors(errors);
            return;
        }

        setLoading(true);
        try {
            // basePrice se envía como 0; el precio real lo determinan los asientos generados automáticamente
            await registerFunction({ ...formData, basePrice: "0", image });
            setSuccessMsg("¡Función registrada exitosamente!");
            setFormData({ name: "", description: "", dateFunction: "", timeFunction: "" });
            setImage(null);
            setImagePreview(null);
        } catch (error: any) {
            setErrorMsg("Atención: " + error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="dashboard-page">
            <div style={{ padding: "20px" }}>
                <h2 style={{ color: "#8B0000", borderBottom: "2px solid #8B0000", paddingBottom: "10px", marginBottom: "24px" }}>
                    🎭 Registrar Función
                </h2>

                <div style={{
                    backgroundColor: "white", border: "1px solid #C0A060",
                    borderRadius: "8px", padding: "30px", maxWidth: "800px"
                }}>
                    <form onSubmit={handleSubmit} noValidate>
                        <div style={{ display: "flex", gap: "30px" }}>

                            {/* Columna izquierda — campos */}
                            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "16px" }}>

                                {/* Nombre */}
                                <div>
                                    <label style={{ fontWeight: "600", color: "#333", display: "block", marginBottom: "4px" }}>
                                        Nombre de la obra
                                    </label>
                                    <input
                                        name="name" type="text" value={formData.name} onChange={handleChange}
                                        style={{ width: "100%", padding: "8px 12px", border: "1px solid #ccc", borderRadius: "4px", fontSize: "0.95rem", boxSizing: "border-box" }}
                                    />
                                    {fieldErrors.name && <span style={{ color: "#f56558", fontSize: "0.75rem" }}>{fieldErrors.name}</span>}
                                </div>

                                {/* Descripción */}
                                <div>
                                    <label style={{ fontWeight: "600", color: "#333", display: "block", marginBottom: "4px" }}>
                                        Descripción de la obra
                                    </label>
                                    <textarea
                                        name="description" value={formData.description} onChange={handleChange} rows={3}
                                        style={{ width: "100%", padding: "8px 12px", border: "1px solid #ccc", borderRadius: "4px", fontSize: "0.95rem", boxSizing: "border-box", resize: "vertical" }}
                                    />
                                    {fieldErrors.description && <span style={{ color: "#f56558", fontSize: "0.75rem" }}>{fieldErrors.description}</span>}
                                </div>

                                {/* Fecha */}
                                <div>
                                    <label style={{ fontWeight: "600", color: "#333", display: "block", marginBottom: "4px" }}>
                                        Fecha de la función
                                    </label>
                                    <input
                                        name="dateFunction" type="date" value={formData.dateFunction} onChange={handleChange}
                                        style={{ width: "100%", padding: "8px 12px", border: "1px solid #ccc", borderRadius: "4px", fontSize: "0.95rem", boxSizing: "border-box" }}
                                    />
                                    {fieldErrors.dateFunction && <span style={{ color: "#f56558", fontSize: "0.75rem" }}>{fieldErrors.dateFunction}</span>}
                                </div>

                                {/* Hora */}
                                <div>
                                    <label style={{ fontWeight: "600", color: "#333", display: "block", marginBottom: "4px" }}>
                                        Hora de la función (FORMATO 24HR)
                                    </label>
                                    <input
                                        name="timeFunction" type="time" value={formData.timeFunction} onChange={handleChange}
                                        style={{ width: "100%", padding: "8px 12px", border: "1px solid #ccc", borderRadius: "4px", fontSize: "0.95rem", boxSizing: "border-box" }}
                                    />
                                    {fieldErrors.timeFunction && <span style={{ color: "#f56558", fontSize: "0.75rem" }}>{fieldErrors.timeFunction}</span>}
                                </div>

                                {/* Nota informativa sobre precios */}
                                <div style={{
                                    background: "#F5F0E8", border: "1px solid #C0A060",
                                    borderRadius: "6px", padding: "10px 14px", fontSize: "12px", color: "#666"
                                }}>
                                    💺 Los precios de las entradas se determinan automáticamente por sección:<br />
                                    VIP Divine $85.000 · Platea $45.000 · Anfiteatro $28.000 · Galería $18.000 · Palco $65.000
                                </div>
                            </div>

                            {/* Columna derecha — imagen */}
                            <div style={{ width: "220px", display: "flex", flexDirection: "column", gap: "8px" }}>
                                <label style={{ fontWeight: "600", color: "#333" }}>
                                    Imagen de portada <span style={{ fontWeight: "normal", color: "#888" }}>(opcional)</span>
                                </label>
                                <div
                                    style={{
                                        width: "100%", height: "200px", border: "1px solid #ccc",
                                        borderRadius: "4px", display: "flex", alignItems: "center",
                                        justifyContent: "center", overflow: "hidden",
                                        backgroundColor: "#fafafa", cursor: "pointer"
                                    }}
                                    onClick={() => document.getElementById("imageInput")?.click()}
                                >
                                    {imagePreview ? (
                                        <img src={imagePreview} alt="Preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                                    ) : (
                                        <span style={{ color: "#aaa", fontSize: "0.85rem", textAlign: "center", padding: "10px" }}>
                                            Haz clic para seleccionar una imagen
                                        </span>
                                    )}
                                </div>
                                <input
                                    id="imageInput" type="file" accept="image/*"
                                    onChange={handleImageChange} style={{ display: "none" }}
                                />
                                {image && <span style={{ fontSize: "0.75rem", color: "#555" }}>{image.name}</span>}
                            </div>
                        </div>

                        {errorMsg && <p style={{ color: "#f56558", marginTop: "16px", fontSize: "0.875rem" }}>{errorMsg}</p>}
                        {successMsg && <p style={{ color: "#2e7d32", marginTop: "16px", fontSize: "0.875rem" }}>{successMsg}</p>}

                        <div style={{ marginTop: "24px" }}>
                            <button
                                type="submit" disabled={loading}
                                style={{
                                    backgroundColor: loading ? "#aaa" : "#8B0000", color: "white",
                                    border: "none", padding: "10px 28px", borderRadius: "4px",
                                    fontWeight: "bold", fontSize: "1rem",
                                    cursor: loading ? "not-allowed" : "pointer"
                                }}
                            >
                                {loading ? "Registrando..." : "Registrar Función"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default RegisterFunction;
