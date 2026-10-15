import { 
    collection,
    getDocs,
    addDoc,
    updateDoc,
    doc,
    query, 
    getDoc, 
    where,
    runTransaction
 } from "firebase/firestore";
import { db } from "../firebase/config";
import { slugify } from "../utils/slugify";
//creamos colección de productos, la referencia a la colección de productos en firebase, y podemos usarla para hacer consultas a esa colección
const productsRef = collection(db, "products");
const categoriesRef = collection(db, "categories");

// Trae las categorías activas ordenadas para los selects del admin.
// Filtra y ordena en cliente para no exigir índice compuesto.
export const getCategories = async () => {
    try {
        const snapshot = await getDocs(categoriesRef);
        return snapshot.docs
            .map((doc) => ({ id: doc.id, ...doc.data() }))
            .filter((c) => c.active !== false)
            .sort((a, b) => Number(a.order ?? 0) - Number(b.order ?? 0));
    } catch (error) {
        console.error("Error fetching categories:", error);
        return [];
    }
};


// Función para obtener todos los productos no la necesito si quiero mostrar por categoría, pero la dejo por si quiero mostrar todo en algún momento

// Solo visibles en tienda: active !== false (los docs viejos sin campo siguen visibles)
const isActive = (d) => d?.active !== false;

export const getProducts = async () => {
    try {
        const snapshot = await getDocs(productsRef);
        const productsFormat = snapshot.docs.map((doc) => {
        return { id: doc.id, ...doc.data() };   //coloco mi id dentro del objeto que me devuelve firebase, para poder usarlo luego en el detalle del producto
        }).filter(isActive);
        return productsFormat;
    } catch (error) {
        console.error("Error fetching products:", error);
        return [];
    }};

    //traer un producto por su id
export const getProductById = async (id) => {
    try {
        const productRef = doc(db, "products", id);
        const snapshot = await getDoc(productRef);
        if (snapshot.exists()) {
            const product = { id: snapshot.id, ...snapshot.data() };
            console.log("Doc:", product);
            return product;
        } else {
            return null;
        }
    } catch (error) {
        console.error("Error fetching product:", error);
        return null;
    }};


export const getByCategory = async (category) => {
    try{
        let queryRef;
//verificamos, filtramos por esa categoría, 
//guardamos en queryRef para hacer la consulta a firebase,
//mapeamos para devolver un array de productos con su id incluido
//nota: filtra por categorySlug (esquema nuevo) y cae a category (docs viejos del admin) para no mostrar vacío durante la migración
        if(category){
            const slug = slugify(category);
            const bySlug = query(productsRef, where("categorySlug", "==", slug));
            const snapSlug = await getDocs(bySlug);
            if (!snapSlug.empty) {
                return snapSlug.docs.map((doc) => ({ id: doc.id, ...doc.data() })).filter(isActive);
            }
            //fallback para docs viejos: category con el valor crudo o normalizado simple
            const byRaw = await getDocs(query(productsRef, where("category", "==", category)));
            if (!byRaw.empty) {
                return byRaw.docs.map((doc) => ({ id: doc.id, ...doc.data() })).filter(isActive);
            }
            queryRef = query(productsRef, where("category", "==", category));
        }else{
            queryRef = productsRef;
    }
        const snapshot = await getDocs(queryRef);

        const productsFormat = snapshot.docs.map((doc) => {
            return { id: doc.id, ...doc.data() };
        }).filter(isActive);
        return productsFormat;
    }catch(error){
        console.error("Error fetching products by category:", error);
        return [];
    }
};

//Alta de producto, recibe un objeto con los datos del producto, y lo agrega a la colección de productos en firebase, devuelve el id del nuevo producto creado, o lanza un error si hubo un problema al crear el producto

export const createProduct = async (productData) => {
    try {
        const docRef = await addDoc(productsRef, productData); //agrega un nuevo producto a la coleccion de Firestore, con los datos que le pasamos como argumento, y devuelve una referencia al documento creado
        return docRef.id; // Devuelve el ID del nuevo producto creado. Opcional
    } catch (error) {
        console.error("Error creando el producto:", error);
        throw error; // Lanza el error para que pueda ser manejado por el componente que llama a esta función
    };
}

//Modificación de producto: actualiza los campos indicados del documento con ese id
export const updateProduct = async (id, productData) => {
    try {
        const productRef = doc(db, "products", id);
        await updateDoc(productRef, productData);
    } catch (error) {
        console.error("Error actualizando el producto:", error);
        throw error;
    };
}

//Descuenta el stock de cada item del carrito en una transacción.
//Si el item tiene variantId, descuenta del array variants; si no, del stock del producto.
//Lee el stock actual (acepta número o string heredado), valida y escribe el nuevo valor ya como número.
export const decrementStock = async (cartItems) => {
    try {
        await runTransaction(db, async (transaction) => {
            // Fase 1: TODAS las lecturas primero (Firestore lo exige antes de escribir)
            const reads = [];
            for (const item of cartItems) {
                const qty = item.quantity || 1;
                const productRef = doc(db, "products", item.id);
                const snapshot = await transaction.get(productRef);
                reads.push({ item, qty, productRef, snapshot });
            }
            // Fase 2: validaciones + escrituras
            for (const { item, qty, productRef, snapshot } of reads) {
                if (!snapshot.exists()) {
                    throw new Error(`El producto "${item.name || item.id}" ya no existe`);
                }
                const data = snapshot.data();
                if (data.active === false) {
                    throw new Error(`El producto "${item.name || item.id}" ya no está disponible`);
                }
                if (item.variantId) {
                    const variants = Array.isArray(data.variants) ? [...data.variants] : [];
                    const idx = variants.findIndex((v) => (v.id ?? v.name) === item.variantId);
                    if (idx === -1) {
                        throw new Error(`La presentación "${item.variantName || item.variantId}" ya no existe`);
                    }
                    const current = Number(variants[idx].stock ?? 0);
                    if (!Number.isFinite(current) || current < qty) {
                        throw new Error(`Stock insuficiente para "${item.name || item.id} (${variants[idx].name || ""})" (disponible: ${Number.isFinite(current) ? current : 0})`);
                    }
                    variants[idx] = { ...variants[idx], stock: current - qty };
                    transaction.update(productRef, { variants });
                } else {
                    const current = Number(data.stock ?? 0);
                    if (!Number.isFinite(current) || current < qty) {
                        throw new Error(`Stock insuficiente para "${item.name || item.id}" (disponible: ${Number.isFinite(current) ? current : 0})`);
                    }
                    transaction.update(productRef, { stock: current - qty });
                }
            }
        });
    } catch (error) {
        console.error("Error descontando stock:", error);
        throw error;
    };
}