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
  
  const [errorMsg, setErrorMsg] = useState('');

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
   */
  const handleRegistro = async (e: React.FormEvent) => {
        e.preventDefault();

        // Se valida el número de teléfono
        if (formData.phone.length !== 9) {
            setErrorMsg("Atención: El número de teléfono debe tener exactamente 9 dígitos.");
            return;
        }

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
                    {/* Se reemplaza type="tel" por "text" para mayor control sobre los caracteres permitidos */}
                    <input 
                        type="text" 
                        className="input-field" 
                        placeholder="Teléfono (9 dígitos)" 
                        value={formData.phone}
                        onChange={handlePhoneChange}
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