import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom"
import { useState } from "react"
import "./Login.css"

export const Login = () => {
    const {login, resetPassword} = useAuth()
    const navigate = useNavigate()
    const [formData, setFormData] = useState({
    email: "",
    password: "",
  })
  const [mode, setMode] = useState("login"); // "login" | "reset"
  const [status, setStatus] = useState({ type: "", text: "" });
  const [sending, setSending] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };


  const handleSubmit = async(e) => {
    e.preventDefault();

    try {
      //Viene del context
      await login(formData.email, formData.password);
      console.log("Login exitoso");
      navigate("/admin", { replace: true });  // Redirige a la página de administración después del login exitoso


    } catch (error) {
      console.error(error);
      alert("Error al iniciar sesión");
    }

  }

  const handleReset = async (e) => {
    e.preventDefault();
    setStatus({ type: "", text: "" });
    if (!formData.email.trim()) {
      setStatus({ type: "error", text: "Ingresá tu email para enviarte el enlace." });
      return;
    }
    setSending(true);
    try {
      await resetPassword(formData.email.trim());
      setStatus({ type: "ok", text: "Te enviamos un email con el enlace para cambiar tu contraseña." });
    } catch (error) {
      console.error(error);
      setStatus({ type: "error", text: "No pudimos enviar el email. Verificá que el correo sea correcto." });
    } finally {
      setSending(false);
    }
  };

   return (
    <form onSubmit={mode === "login" ? handleSubmit : handleReset} className="login-form">
      <h2>{mode === "login" ? "Iniciar Sesión" : "Recuperar contraseña"}</h2>

      <div className="form-group">
        <label>Email</label>
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
        />
      </div>

      {mode === "login" && (
        <div className="form-group">
          <label>Password</label>
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
          />
        </div>
      )}

      {status.text && (
        <p className={status.type === "ok" ? "success" : "error"}>{status.text}</p>
      )}

      <button type="submit" disabled={sending}>
        {mode === "login" ? "Login" : (sending ? "Enviando..." : "Enviar enlace")}
      </button>

      <button
        type="button"
        className="link-btn"
        onClick={() => { setMode(mode === "login" ? "reset" : "login"); setStatus({ type: "", text: "" }); }}
      >
        {mode === "login" ? "¿Olvidaste tu contraseña?" : "Volver al login"}
      </button>
    </form>
  );

}
