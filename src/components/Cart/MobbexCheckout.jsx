import { useState } from "react";
import { useCart } from "../../context/CartContext";
import { startMobbexCheckout } from "../../services/payments";

// Mobbex exige email + nombre + identificación del comprador.
// Crea el checkout en el backend y redirige a pagar (tarjeta, QR, transferencia...).
export const MobbexCheckout = () => {
    const { cart } = useCart();
    const [form, setForm] = useState({ email: "", name: "", identification: "" });
    const [error, setError] = useState("");
    const [busy, setBusy] = useState(false);

    const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const pay = async (e) => {
        e.preventDefault();
        setError("");
        if (!form.email.trim() || !form.name.trim() || !form.identification.trim()) {
            setError("Completá email, nombre y DNI para pagar.");
            return;
        }
        setBusy(true);
        try {
            const { url } = await startMobbexCheckout(cart, {
                email: form.email.trim(),
                name: form.name.trim(),
                identification: form.identification.trim(),
            });
            window.location.href = url;
        } catch (err) {
            setError(err.message || "No se pudo iniciar el pago");
            setBusy(false);
        }
    };

    return (
        <form className="mobbex-checkout" onSubmit={pay}>
            <h3>Pagar online con Mobbex</h3>
            <p>Tarjeta, QR o transferencia. Te redirigimos a la plataforma segura de pago.</p>
            <div className="form-group">
                <label>Email</label>
                <input type="email" name="email" value={form.email} onChange={onChange} placeholder="tu@email.com" />
            </div>
            <div className="form-group">
                <label>Nombre y apellido</label>
                <input type="text" name="name" value={form.name} onChange={onChange} placeholder="Tu nombre" />
            </div>
            <div className="form-group">
                <label>DNI</label>
                <input type="text" name="identification" value={form.identification} onChange={onChange} placeholder="12345678" />
            </div>
            {error && <p className="error">{error}</p>}
            <button type="submit" className="btn bg-primary" disabled={busy}>
                {busy ? "Conectando con Mobbex..." : "Pagar con Mobbex"}
            </button>
        </form>
    );
};
