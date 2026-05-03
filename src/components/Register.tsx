import { useNavigate } from "react-router-dom";
import "../styles/register.css";
import logoUrl from "../assets/icons/LogoLaDivine.svg";

function Register() {
  const navigate = useNavigate();

  return (
    <div className="register">
        <img src={logoUrl} alt="Logo Teatro La Divine" className="logo" />
        <div className="register-container">
            <div className="register-header">Crear cuenta</div>
            <div className="register-body">
                <div className="input-row">
                    <div className="input-group">
                        <div className="input-icon">👤</div>
                        <input type="text" className="input-field" placeholder="Nombre" id="nombre" required />
                    </div>
                    <div className="input-group">
                        <div className="input-icon">👤</div>
                        <input type="text" className="input-field" placeholder="Apellido" id="apellido" required />
                    </div>
                </div>
                <div className="input-group">
                    <div className="input-icon">✉️</div>
                    <input type="email" className="input-field" placeholder="Correo Electrónico" id="email" required />
                </div>
                <div className="input-group">
                    <div className="input-icon">🪪</div>
                    <input type="text" className="input-field" placeholder="RUT (ej.: 12456789K)" id="rut" maxLength={9} required />
                </div>
                <div className="input-group">
                    <div className="input-icon">📞</div>
                    <input type="tel" className="input-field" placeholder="Teléfono de contacto" id="telefono" required />
                </div>
                <p className="register-info">
                    Se generará una contraseña temporal y será enviada a su correo electrónico.
                </p>
                <button className="btn-registrar" id="btn-register">Registrarse</button>
                <div className="login-divider">
                    <span>¿Ya tiene cuenta?</span>
                </div>
                <button className="btn-volver" onClick={() => navigate("/")}>
                    Iniciar sesión
                </button>
            </div>
        </div>
    </div>
  );
}

export default Register;