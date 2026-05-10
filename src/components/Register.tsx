import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/register.css";
import logoUrl from "../assets/icons/LogoLaDivine.svg";
import { register } from '../services/AuthServices';

/**
 * Componente que gestiona el formulario de registro para nuevos clientes.
 * Captura los datos personales y los envía al backend para la creación de la cuenta.
 */
function Register() {
  const navigate = useNavigate();
  
  // Mensaje de error general proveniente del backend
  const [errorMsg, setErrorMsg] = useState('');

  // Errores de validación por campo individual
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // Almacena los datos introducidos por el usuario en los campos del formulario
  const [formData, setFormData] = useState({
    name: '',
    lastName: '',
    email: '',
    rut: '',
    phone: ''
  });

  /**
   * Controla la entrada del teléfono, eliminando caracteres no numéricos
   * y limitando la longitud para cumplir con el formato estándar.
   */
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let inputValue = e.target.value.replace(/\D/g, '');
    if (inputValue.length <= 9) {
      setFormData({ ...formData, phone: inputValue });
    }
  };

  /**
   * Procesa el envío del formulario, aplicando validaciones estrictas.
   */
  const handleRegistro = async (e: React.FormEvent) => {
    e.preventDefault();

    const errors: Record<string, string> = {};
    
    // Validaciones de campos faltantes
    if (!formData.name.trim())     errors.name     = 'Falta completar el campo Nombre';
    if (!formData.lastName.trim()) errors.lastName = 'Falta completar el campo Apellido';
    
    if (!formData.email.trim())    errors.email    = 'Falta completar el campo Correo Electrónico';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) errors.email = 'Ingresa un correo electrónico válido';
    
    if (!formData.rut.trim())      errors.rut      = 'Falta completar el campo RUT';
    
    if (!formData.phone.trim())    errors.phone    = 'Falta completar el campo Teléfono de contacto';
    else if (formData.phone.length !== 9) errors.phone = 'El número de teléfono debe tener exactamente 9 dígitos';

    // Si existen errores, detenemos el envío
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setFieldErrors({});

    try {
      await register(formData);
      navigate("/login", { 
        state: { mensajeExito: "¡Registro exitoso! Revisa tu correo electrónico para obtener tu contraseña." } 
      });
    } catch (error: any) {
      setErrorMsg("Atención: " + error.message);
    }
  };

  return (
    <div className="register">
      <img src={logoUrl} alt="Logo Teatro La Divine" className="logo" />
      <div className="register-container">
        <div className="register-header">Crear cuenta</div>

        <form className="register-body" onSubmit={handleRegistro} noValidate>

          <div style={{ display: 'flex', gap: '12px', width: '100%', alignItems: 'flex-start', overflow: 'visible' }}>
            
            {/* Wrapper Nombre */}
            <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0, gap: '3px', overflow: 'visible' }}>
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
              {fieldErrors.name && (
                <span style={{ color: '#f56558', fontSize: '0.72rem', display: 'block', minHeight: '0.9rem', lineHeight: 1.2 }}>
                  {fieldErrors.name}
                </span>
              )}
            </div>
            
            {/* Wrapper Apellido */}
            <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0, gap: '3px', overflow: 'visible' }}>
              <div className="input-group">
                <input
                  type="text"
                  className="input-field"
                  placeholder="Apellido"
                  value={formData.lastName}
                  onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                />
              </div>
              {fieldErrors.lastName && (
                <span style={{ color: '#f56558', fontSize: '0.72rem', display: 'block', minHeight: '0.9rem', lineHeight: 1.2 }}>
                  {fieldErrors.lastName}
                </span>
              )}
            </div>

          </div>

          {/* Correo Electrónico */}
          <div className="input-field-wrapper">
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
            {fieldErrors.email && <span className="field-error">{fieldErrors.email}</span>}
          </div>

          {/* RUT */}
          <div className="input-field-wrapper">
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
            {fieldErrors.rut && <span className="field-error">{fieldErrors.rut}</span>}
          </div>

          {/* Teléfono */}
          <div className="input-field-wrapper">
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
            {fieldErrors.phone && <span className="field-error">{fieldErrors.phone}</span>}
          </div>

          {errorMsg && <div className="error-banner">{errorMsg}</div>}

          <button type="submit" className="btn-registrar">Registrarse</button>

          <div className="login-divider"><span>¿Ya tiene cuenta?</span></div>

          <button type="button" className="btn-volver" onClick={() => navigate("/")}>
            Iniciar sesión
          </button>

        </form>
      </div>
    </div>
  );
}

export default Register;