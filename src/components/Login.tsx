import { useNavigate } from "react-router-dom";
import "../styles/login.css";
import logoUrl from "../assets/icons/LogoLaDivine.svg";

function Login() {
  const navigate = useNavigate();

  return (
    <div className="login">
        <img src={logoUrl} alt="Logo Teatro La Divine" className="logo" />
        <div className="login-container">
            <div className="login-header">Ingreso al sistema</div>
            <div className="login-body">
                <div className="input-group">
                    <div className="input-icon">👤</div>
                    <input type="email" className="input-field" placeholder="Correo Electrónico" id="email" required />
                </div>
                <div className="input-group">
                    <div className="input-icon">🔒</div>
                    <input type="password" className="input-field" placeholder="Contraseña" id="password" required />
                </div>
                <button className="btn-olvido">¿Olvidó su contraseña?</button>
                <button className="btn-ingresar" id="btn-login">Ingresar</button>
                <div className="login-divider">
                    <span>¿No tiene cuenta?</span>
                </div>
                <button className="btn-crear-cuenta" onClick={() => navigate("/register")}>
                    Crear cuenta
                </button>
            </div>
        </div>
    </div>
  );
}

export default Login;