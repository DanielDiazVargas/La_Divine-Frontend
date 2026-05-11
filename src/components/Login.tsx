import { useState } from "react";
import { useNavigate , useLocation } from "react-router-dom";
import "../styles/login.css";
import logoUrl from "../assets/icons/LogoLaDivine.svg";
import { login } from '../services/AuthServices'; 

/**
 * Componente para la autenticación de usuarios.
 * Maneja el envío de credenciales al backend y la persistencia del Token JWT.
 */
function Login() {
  const navigate = useNavigate();
  const location = useLocation();

  // Mensaje de éxito recibido (ej: tras un registro exitoso)
  const [successMsg, setExitoMsg] = useState(location.state?.mensajeExito || "");
  
  // Mensaje de error para mostrar fallos en la autenticación
  const [errorMsg, setErrorMsg] = useState('');

  // Errores de validación por campo individual
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // Objeto que captura los datos del formulario de ingreso
  const [credenciales, setCredenciales] = useState({
    email: '',
    password: ''
  });

  /**
   * Procesa el intento de login, guarda el token en el almacenamiento local y redirige.
   * Aplica validación de formato de correo antes de enviar la petición al backend.
   */
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setExitoMsg("");
    setErrorMsg("");

    // Se valida el formato del correo antes de enviar la petición
    const errors: Record<string, string> = {};
    if (!credenciales.email.trim())
      errors.email = 'Falta completar el campo Correo Electrónico';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(credenciales.email))
      errors.email = 'El correo electrónico no tiene un formato válido';
    if (!credenciales.password.trim())
      errors.password = 'Falta completar el campo Contraseña';

    // Si existen errores de validación, se detiene el envío y se muestran
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setFieldErrors({});

    try {
      const data = await login(credenciales.email, credenciales.password);
      
      // Guarda el token JWT de forma persistente en el navegador
      localStorage.setItem("token", data.token); 
      
      navigate("/dashboard"); 
      
    } catch (error: any) {
      setErrorMsg("Atención: " + error.message);
    }
  };

  return (
    <div className="login">
        <img src={logoUrl} alt="Logo Teatro La Divine" className="logo" />
        <div className="login-container">
            <div className="login-header">Ingreso al sistema</div>

            {successMsg && (
            <div style={{ color: '#2e7d32', marginTop: '10px', marginBottom: '-20px', fontSize: '13px', textAlign: 'center', fontWeight: 'bold' }}>
              {successMsg}
            </div>
            )}

            {errorMsg && (
                <div style={{ color: '#f56558', marginTop: '10px', marginBottom: '-20px', fontSize: '13px', textAlign: 'center', fontWeight: 'bold' }}>
                    {errorMsg}
                </div>
            )}
            
            {/* noValidate desactiva los tooltips nativos del navegador en favor de la validación personalizada */}
            <form className="login-body" onSubmit={handleLogin} noValidate>
                <div className="input-field-wrapper">
                    <div className="input-group">
                        <div className="input-icon">👤</div>
                        <input 
                            type="email" 
                            className="input-field" 
                            placeholder="Correo Electrónico" 
                            value={credenciales.email}
                            onChange={(e) => setCredenciales({...credenciales, email: e.target.value})}
                        />
                    </div>
                    <span className="field-error">{fieldErrors.email || ''}</span>
                </div>

                <div className="input-field-wrapper">
                    <div className="input-group">
                        <div className="input-icon">🔒</div>
                        <input 
                            type="password" 
                            className="input-field" 
                            placeholder="Contraseña" 
                            value={credenciales.password}
                            onChange={(e) => setCredenciales({...credenciales, password: e.target.value})}
                        />
                    </div>
                    <span className="field-error">{fieldErrors.password || ''}</span>
                </div>
                
                <button type="submit" className="btn-ingresar">Ingresar</button>
                
                <div className="login-divider">
                    <span>¿No tiene cuenta?</span>
                </div>
                
                <button type="button" className="btn-crear-cuenta" onClick={() => navigate("/register")}>
                    Crear cuenta
                </button>
            </form>
        </div>
    </div>
  );
}

export default Login;