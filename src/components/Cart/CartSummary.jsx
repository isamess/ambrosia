import { useState } from "react";
import { useCart } from "../../context/CartContext";


export const CartSummary = () => {
    const {getCartTotal, checkout} = useCart();
    const [processing, setProcessing] = useState(false);

    const total = getCartTotal();

    const handleCheckout = async () => {
        setProcessing(true);
        try {
            await checkout();
        } finally {
            setProcessing(false);
        }
    };

    return(
        <>
        <p>Total: ${total}</p>
        <button className="btn bg-primary" onClick={handleCheckout} disabled={processing}>
            {processing ? "Procesando..." : "Finalizar Compra"}
        </button>

        </>
    );
};
