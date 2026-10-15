import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import { fetchOrderStatus } from "../../services/payments";

// Mobbex redirige acá tras pagar: ?orderId=...&status=...&type=...&transactionId=...
// El `status` de la URL es solo orientativo; la verdad la tiene el webhook
// (se confirma consultando el estado de la orden al backend).
export const PagoRetorno = () => {
    const [params] = useSearchParams();
    const { clearCart } = useCart();
    const [state, setState] = useState("verificando"); // verificando | pagado | pendiente | cancelado | expirado

    const orderId = params.get("orderId");
    const status = params.get("status");

    useEffect(() => {
        if (status === "0") return setState("cancelado");
        if (status === "401") return setState("expirado");
        if (!orderId) return setState("pendiente");
        let alive = true;
        // El webhook suele procesar antes del retorno; reintenta unos segundos.
        const check = async (tries = 4) => {
            const s = await fetchOrderStatus(orderId).catch(() => "unknown");
            if (!alive) return;
            if (s === "paid") {
                clearCart(true);
                setState("pagado");
            } else if (tries > 0 && (s === "pending" || s === "unknown")) {
                setTimeout(() => check(tries - 1), 2500);
            } else {
                setState("pendiente");
            }
        };
        check();
        return () => { alive = false; };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [orderId, status]);

    return (
        <section style={{ textAlign: "center", padding: "2rem 1rem" }}>
            {state === "verificando" && <p>Confirmando tu pago...</p>}
            {state === "pagado" && (<>
                <h2>¡Pago aprobado, gracias!</h2>
                <p>Tu pedido está confirmado. Te avisaremos por email.</p>
            </>)}
            {state === "pendiente" && (<>
                <h2>Pago en revisión</h2>
                <p>Estamos confirmando tu pago. Si se acredita, verás el stock actualizado.</p>
            </>)}
            {state === "cancelado" && (<>
                <h2>Pago cancelado</h2>
                <p>No se concretó el pago. Tu carrito sigue intacto.</p>
            </>)}
            {state === "expirado" && (<>
                <h2>El checkout expiró</h2>
                <p>El link de pago venció (60 min). Generá uno nuevo desde el carrito.</p>
            </>)}
            <Link className="btn bg-primary" to="/">Volver a la tienda</Link>
        </section>
    );
};
