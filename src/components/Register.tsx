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
    let inputValue = e.target.value;

    // Se suprimen letras y símbolos mediante expresión regular
    inputValue = inputValue.replace(/\D/g, '');

    // Se restringe la longitud a un máximo de 9 dígitos
    if (inputValue.length <= 9) {
      setFormData({ ...formData, phone: inputValue });
    }
  };

  /**
   * Procesa el envío del formulario, aplicando validaciones estrictas
   * antes de llamar al servicio de registro.
   * Todos los campos usan validación manual con mensajes personalizados
   * para mantener consistencia visual y cumplir con los requerimientos del sistema.
   */
  const handleRegistro = async (e: React.FormEvent) => {
    e.preventDefault();

    // Se construye un mapa de errores por campo para mostrarlos individualmente
    const errors: Record<string, string> = {};
    if (!formData.name.trim())     errors.name     = 'Falta completar el campo Nombre';
    if (!formData.lastName.trim()) errors.lastName = 'Falta completar el campo Apellido';
    if (!formData.email.trim())    errors.email    = 'Falta completar el campo Correo Electrónico';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) errors.email = 'Ingresa un correo electrónico válido';
    if (!formData.rut.trim())      errors.rut      = 'Falta completar el campo RUT';
    if (!formData.phone.trim())    errors.phone    = 'Falta completar el campo Teléfono de contacto';
    else if (formData.phone.length !== 9) errors.phone = 'El número de teléfono debe tener exactamente 9 dígitos';

    // Si existen errores de validación, se detiene el envío y se muestran
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

        {/* noValidate desactiva los tooltips nativos del navegador en favor de la validación personalizada */}
        <form className="register-body" onSubmit={handleRegistro} noValidate>

          <div className="input-row">
            {/* Wrapper con espacio reservado para error de Nombre */}
            <div className="input-group-wrapper">
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
              <span className="field-error">{fieldErrors.name || ''}</span>
            </div>

            {/* Wrapper con espacio reservado para error de Apellido */}
            <div className="input-group-wrapper">
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
              <span className="field-error">{fieldErrors.lastName || ''}</span>
            </div>
          </div>

          {/* Wrapper con espacio reservado para error de Correo Electrónico */}
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
            <span className="field-error">{fieldErrors.email || ''}</span>
          </div>

          {/* Wrapper con espacio reservado para error de RUT */}
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
            <span className="field-error">{fieldErrors.rut || ''}</span>
          </div>

          {/* Wrapper con espacio reservado para error de Teléfono */}
          <div className="input-field-wrapper">
            <div className="input-group">
              <div className="input-icon">📞</div>
              {/* Se reemplaza type="tel" por "text" para mayor control sobre los caracteres permitidos */}
              <input
                type="text"
                className="input-field"
                placeholder="Teléfono (9 dígitos)"
                value={formData.phone}
                onChange={handlePhoneChange}
              />
            </div>
            <span className="field-error">{fieldErrors.phone || ''}</span>
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