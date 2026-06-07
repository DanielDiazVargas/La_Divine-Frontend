import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/register.css";
import logoUrl from "../assets/icons/LogoLaDivine.svg";
import { register } from '../services/AuthServices';
import ConfirmModal from "./ConfirmModal";

function Register() {
  const navigate = useNavigate();
  const [errorMsg, setErrorMsg] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    lastName: '',
    email: '',
    rut: '',
    phone: ''
  });

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let inputValue = e.target.value.replace(/\D/g, '');
    if (inputValue.length <= 9) {
      setFormData({ ...formData, phone: inputValue });
    }
  };

  const handleRegistro = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    const errors: Record<string, string> = {};
    if (!formData.name.trim())     errors.name     = 'Falta completar el campo Nombre';
    if (!formData.lastName.trim()) errors.lastName = 'Falta completar el campo Apellido';
    if (!formData.email.trim())    errors.email    = 'Falta completar el campo Correo Electrónico';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) errors.email = 'Ingresa un correo electrónico válido';
    if (!formData.rut.trim())      errors.rut      = 'Falta completar el campo RUT';
    if (!formData.phone.trim())    errors.phone    = 'Falta completar el campo Teléfono de contacto';
    else if (formData.phone.length !== 9) errors.phone = 'El número de teléfono debe tener exactamente 9 dígitos';

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setFieldErrors({});
    setShowModal(true);
  };

  const handleConfirm = async () => {
    setShowModal(false);
    setLoading(true);
    try {
      await register(formData);
      navigate("/login", {
        state: { mensajeExito: "¡Registro exitoso! Revisa tu correo electrónico para obtener tu contraseña." }
      });
    } catch (error: any) {
      setErrorMsg("Atención: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const errorSpan = (key: string) => (
    <span style={{ color: '#f56558', fontSize: '0.72rem', display: 'block', minHeight: '1rem', lineHeight: 1.2 }}>
      {fieldErrors[key] || ""}
    </span>
  );

  return (
    <div className="register">
      {showModal && (
        <ConfirmModal
          mensaje="¿Está seguro de que desea registrarse con los datos ingresados?"
          onConfirm={handleConfirm}
          onCancel={() => setShowModal(false)}
        />
      )}

      <img src={logoUrl} alt="Logo Teatro La Divine" className="logo" />
      <div className="register-container">
        <div className="register-header">Crear cuenta</div>

        <form className="register-body" onSubmit={handleRegistro} noValidate>

          <div style={{ display: 'flex', gap: '8px', width: '100%' }}>
            <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '3px' }}>
              <div className="input-group">
                <div className="input-icon">👤</div>
                <input
                  type="text"
                  className="input-field"
                  placeholder="Nombre"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
              </div>
              {errorSpan('name')}
            </div>

            <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '3px' }}>
              <div className="input-group">
                <div className="input-icon">👤</div>
                <input
                  type="text"
                  className="input-field"
                  placeholder="Apellido"
                  value={formData.lastName}
                  onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                />
              </div>
              {errorSpan('lastName')}
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
            <div className="input-group">
              <div className="input-icon">✉️</div>
              <input
                type="email"
                className="input-field"
                placeholder="Correo Electrónico"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
              />
            </div>
            {errorSpan('email')}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
            <div className="input-group">
              <div className="input-icon">🪪</div>
              <input
                type="text"
                className="input-field"
                placeholder="RUT (ej.: 12456789K)"
                maxLength={9}
                value={formData.rut}
                onChange={(e) => setFormData({...formData, rut: e.target.value})}
              />
            </div>
            {errorSpan('rut')}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
            <div className="input-group">
              <div className="input-icon">📞</div>
              <input
                type="text"
                className="input-field"
                placeholder="Teléfono (9 dígitos)"
                value={formData.phone}
                onChange={handlePhoneChange}
              />
            </div>
            {errorSpan('phone')}
          </div>

          {errorMsg && <div className="error-banner">{errorMsg}</div>}

          <button type="submit" className="btn-registrar" disabled={loading}>
            {loading ? "Registrando..." : "Registrarse"}
          </button>

          <div className="login-divider"><span>¿Ya tiene cuenta?</span></div>

          <button type="button" className="btn-volver" disabled={loading} onClick={() => navigate("/")}>
            Iniciar sesión
          </button>

        </form>
      </div>
    </div>
  );
}

export default Register;