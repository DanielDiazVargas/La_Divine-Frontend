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
  
  // Almacena mensajes de error devueltos por el servidor (ej: RUT duplicado)
  const [errorMsg, setErrorMsg] = useState('');

  // Objeto que agrupa los campos del formulario de registro
  const [formData, setFormData] = useState({
        name: '',
        lastName: '',
        email: '',
        rut: '',
        phone: ''
    });

  /**
   * Procesa el envío del formulario, llamando al servicio de registro
   * y redirigiendo al login con un mensaje de éxito si la operación es correcta.
   */
  const handleRegistro = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            await register(formData);

            // Redirección al Login pasando el mensaje de éxito en el estado de la ruta
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
            
            <form className="register-body" onSubmit={handleRegistro}>
                <div className="input-row">
                    <div className="input-group">
                        <div className="input-icon">👤</div>
                        <input 
                            type="text" 
                            className="input-field" 
                            placeholder="Nombre" 
                            value={formData.name}
                            onChange={(e) => setFormData({...formData, name: e.target.value})}
                            required 
                        />
                    </div>
                    <div className="input-group">
                        <div className="input-icon">👤</div>
                        <input 
                            type="text" 
                            className="input-field" 
                            placeholder="Apellido" 
                            value={formData.lastName}
                            onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                            required 
                        />
                    </div>
                </div>
                <div className="input-group">
                    <div className="input-icon">✉️</div>
                    <input 
                        type="email" 
                        className="input-field" 
                        placeholder="Correo Electrónico" 
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        required 
                    />
                </div>
                <div className="input-group">
                    <div className="input-icon">🪪</div>
                    <input 
                        type="text" 
                        className="input-field" 
                        placeholder="RUT (ej.: 12456789K)" 
                        maxLength={9} 
                        value={formData.rut}
                        onChange={(e) => setFormData({...formData, rut: e.target.value})}
                        required 
                    />
                </div>
                <div className="input-group">
                    <div className="input-icon">📞</div>
                    <input 
                        type="tel" 
                        className="input-field" 
                        placeholder="Teléfono de contacto" 
                        value={formData.phone}
                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                        required 
                    />
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