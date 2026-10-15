// Backend de pagos Ambrosía (Mobbex) — Cloud Functions v2.
// Requiere plan Blaze (las llamadas a api.mobbex.com son externas).
// Docs: https://mobbex.dev/en-checkout
//
// Flujo:
//  1. Front -> createMobbexCheckout {items, customer} -> valida + crea orden
//     `pending` -> crea checkout en Mobbex -> devuelve {url, orderId}.
//  2. Front redirige a url. Mobbex cobra (tarjeta, QR, transferencia...).
//  3. Mobbex -> mobbexWebhook: valida reference + status 200 + total,
//     marca la orden `paid` y descuenta stock (transacción).
// El stock NUNCA se descuenta desde el front en este flujo.

const { onRequest } = require("firebase-functions/v2/https");
const admin = require("firebase-admin");

admin.initializeApp();
const db = admin.firestore();

const REGION = "southamerica-east1";
const MOBBEX_API = "https://api.mobbex.com/p/checkout";
// Estados finales que Mobbex reporta como pago aprobado.
const PAID_CODE = 200;

const mobbexHeaders = () => ({
    "Content-Type": "application/json",
    "x-api-key": process.env.MOBBEX_API_KEY,
    "x-access-token": process.env.MOBBEX_ACCESS_TOKEN,
});

// Recalcula total y valida contra Firestore. Nunca confía en el total del front.
const quoteCart = async (items) => {
    if (!Array.isArray(items) || !items.length || items.length > 50) {
        throw new Error("Carrito inválido");
    }
    let total = 0;
    const quoted = [];
    for (const it of items) {
        const snap = await db.collection("products").doc(String(it.id)).get();
        if (!snap.exists) throw new Error(`Producto ${it.id} inexistente`);
        const p = snap.data();
        if (p.active === false) throw new Error(`Producto ${p.name || it.id} no disponible`);
        const qty = Math.max(1, Math.min(99, Number(it.quantity) || 1));
        let price;
        let stock;
        let variantName = null;
        if (it.variantId) {
            const v = (p.variants || []).find((x) => (x.id ?? x.name) === it.variantId);
            if (!v) throw new Error("Presentación inexistente");
            price = Number(v.price);
            stock = Number(v.stock ?? 0);
            variantName = v.name ?? null;
        } else {
            price = Number(p.price);
            stock = Number(p.stock ?? 0);
        }
        if (!Number.isFinite(price) || price <= 0) throw new Error("Precio inválido");
        if (!Number.isFinite(stock) || stock < qty) {
            throw new Error(`Sin stock para ${p.name || it.id}`);
        }
        total += price * qty;
        quoted.push({
            id: snap.id,
            name: p.name,
            variantId: it.variantId ?? null,
            variantName,
            price,
            quantity: qty,
        });
    }
    return { quoted, total: Math.round(total * 100) / 100 };
};

// POST /createMobbexCheckout  { items, customer: {email, name, identification} }
exports.createMobbexCheckout = onRequest({ region: REGION, cors: true }, async (req, res) => {
    try {
        if (req.method !== "POST") return res.status(405).json({ error: "Solo POST" });
        const { items, customer } = req.body || {};
        if (!customer?.email || !customer?.name || !customer?.identification) {
            return res.status(400).json({ error: "Faltan datos del comprador (email, nombre, DNI)" });
        }
        const { quoted, total } = await quoteCart(items);

        // Orden pending. El ID se usa como reference (Mobbex exige referencia única).
        const orderRef = await db.collection("orders").add({
            items: quoted,
            total,
            currency: "ARS",
            customer: {
                email: String(customer.email).trim(),
                name: String(customer.name).trim(),
                identification: String(customer.identification).trim(),
            },
            status: "pending",
            provider: "mobbex",
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
        });
        const reference = orderRef.id;

        const base = (process.env.FRONTEND_BASE_URL || "http://localhost:5173").replace(/\/$/, "");
        const resp = await fetch(MOBBEX_API, {
            method: "POST",
            headers: mobbexHeaders(),
            body: JSON.stringify({
                total,
                description: `Ambrosía Delicatessen — pedido ${reference.slice(0, 8)}`,
                reference,
                currency: "ARS",
                test: String(process.env.MOBBEX_TEST).toLowerCase() !== "false",
                return_url: `${base}/pago/retorno?orderId=${reference}`,
                webhook: `https://southamerica-east1-${process.env.GCLOUD_PROJECT}.cloudfunctions.net/mobbexWebhook`,
                webhooksType: "final",
                timeout: 60,
                items: quoted.map((q) => ({
                    description: q.variantName ? `${q.name} (${q.variantName})` : q.name,
                    quantity: q.quantity,
                    total: Math.round(q.price * q.quantity * 100) / 100,
                })),
                customer: {
                    email: String(customer.email).trim(),
                    name: String(customer.name).trim(),
                    identification: String(customer.identification).trim(),
                },
            }),
        });
        const data = await resp.json();
        if (!resp.ok || !data?.result || !data?.data?.url) {
            await orderRef.update({ status: "failed", error: JSON.stringify(data).slice(0, 500) });
            return res.status(502).json({ error: "Mobbex no creó el checkout" });
        }
        await orderRef.update({
            reference,
            checkoutId: data.data.id,
            checkoutUrl: data.data.url,
        });
        return res.json({ url: data.data.url, orderId: reference });
    } catch (e) {
        console.error("createMobbexCheckout:", e);
        return res.status(400).json({ error: e.message || "No se pudo crear el pago" });
    }
});

// POST /mobbexWebhook  (lo llama Mobbex, no el front)
exports.mobbexWebhook = onRequest({ region: REGION, cors: false }, async (req, res) => {
    try {
        if (req.method !== "POST") return res.status(405).end();
        const body = req.body || {};
        // Expiración de checkout: nada que cobrar.
        if (body.type === "checkout:expired") {
            const ref = body?.data?.checkout?.reference;
            if (ref) await db.collection("orders").doc(String(ref)).set({ status: "expired" }, { merge: true });
            return res.status(200).end();
        }
        const payment = body?.data?.payment;
        const reference = payment?.reference;
        const code = Number(payment?.status?.code);
        const paidTotal = Number(payment?.total);
        if (!reference) return res.status(400).end();

        await db.runTransaction(async (tx) => {
            const orderRef = db.collection("orders").doc(String(reference));
            const snap = await tx.get(orderRef);
            if (!snap.exists()) throw new Error("Orden inexistente");
            const order = snap.data();
            if (order.status === "paid") return; // webhook duplicado: idempotente
            // Anclas de seguridad: solo vale pago aprobado de ESTA orden por ESTE monto.
            // Mobbex no permite 2 pagos aprobados con la misma referencia.
            if (code !== PAID_CODE) throw new Error(`Estado no aprobado: ${code}`);
            if (Math.abs(Number(order.total) - paidTotal) > 0.01) throw new Error("Monto no coincide");
            // Fase 1: leer todos los productos antes de escribir (lo exige Firestore).
            const reads = [];
            for (const it of order.items || []) {
                const pRef = db.collection("products").doc(it.id);
                const pSnap = await tx.get(pRef);
                if (!pSnap.exists()) throw new Error("Producto inexistente");
                reads.push({ it, pRef, p: pSnap.data() });
            }
            // Fase 2: marcar pagada + descontar stock.
            tx.update(orderRef, {
                status: "paid",
                providerPaymentId: payment?.id ?? null,
                paidAt: admin.firestore.FieldValue.serverTimestamp(),
            });
            for (const { it, pRef, p } of reads) {
                const qty = it.quantity || 1;
                if (it.variantId) {
                    const variants = [...(p.variants || [])];
                    const idx = variants.findIndex((v) => (v.id ?? v.name) === it.variantId);
                    if (idx === -1) throw new Error("Presentación inexistente");
                    variants[idx] = { ...variants[idx], stock: Number(variants[idx].stock ?? 0) - qty };
                    tx.update(pRef, { variants });
                } else {
                    tx.update(pRef, { stock: Number(p.stock ?? 0) - qty });
                }
            }
        });
        return res.status(200).end();
    } catch (e) {
        console.error("mobbexWebhook:", e);
        // 200 igual para no reintentar errores de negocio; 500 solo ante fallas transitorias.
        return res.status(200).end();
    }
});

// GET /getOrderStatus?orderId=... -> { status } (lo usa la página de retorno)
exports.getOrderStatus = onRequest({ region: REGION, cors: true }, async (req, res) => {
    try {
        const snap = await db.collection("orders").doc(String(req.query.orderId || "")).get();
        if (!snap.exists()) return res.status(404).json({ error: "Orden inexistente" });
        return res.json({ status: snap.data().status || "pending" });
    } catch (e) {
        return res.status(400).json({ error: "No se pudo consultar" });
    }
});
