// Cliente de pagos: habla con las Cloud Functions, nunca con Mobbex directo.
// Producción: https://southamerica-east1-ambrosia-f0273.cloudfunctions.net
// Emulador local: VITE_FUNCTIONS_BASE_URL=http://127.0.0.1:5001/ambrosia-f0273/southamerica-east1
const BASE =
    import.meta.env.VITE_FUNCTIONS_BASE_URL ||
    "https://southamerica-east1-ambrosia-f0273.cloudfunctions.net";

export const startMobbexCheckout = async (cart, customer) => {
    const res = await fetch(`${BASE}/createMobbexCheckout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            items: cart.map((it) => ({
                id: it.id,
                variantId: it.variantId ?? null,
                quantity: it.quantity || 1,
            })),
            customer,
        }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data?.url) {
        throw new Error(data?.error || "No se pudo iniciar el pago");
    }
    return data; // { url, orderId }
};

export const fetchOrderStatus = async (orderId) => {
    const res = await fetch(`${BASE}/getOrderStatus?orderId=${encodeURIComponent(orderId)}`);
    const data = await res.json().catch(() => ({}));
    return data?.status || "unknown";
};
