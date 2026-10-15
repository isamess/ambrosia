import { createContext, useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { decrementStock } from '../services/productService';



//creación de contexto para el carrito de compras
const CartContext = createContext();

//Custom hook para usar el contexto del carrito de compras
export const useCart = ()=>{
    const context= useContext(CartContext);
    if (!context) {
        throw new Error('useCart debe ser usado dentro de un CartProvider');
    }
    return context;
};

//Componente proveedor del contexto del carrito de compras
export const CartProvider = ({children})=>{
    const navigate = useNavigate();            //hook para realizar una navegación programática al home después de finalizar la compra
    const [cart, setCart] = useState([]);

    //clave única por producto + variante (retrocompatible con items sin variante)
    const getKey = (item) => item.cartKey || `${item.id}__${item.variantId ?? "base"}`;

    //some evaluará si al menos un elemento del array cumple con la condición dada, en este caso, si el id del elemento es igual al id del item que se está buscando y devuelve True o False
    const IsInCart=(item)=>{
        const key = getKey(item);
        const inCart = cart.some((element) => getKey(element) === key);
        return inCart;
    };

    //agregar item al carrito
    const addItem=(item)=>{
        const key = getKey(item);
        if (item.active === false) {
            alert('Este producto ya no está disponible');
            return;
        }
        if (IsInCart(item)) {
            alert('El producto ya está en el carrito');
            return;
        }
        if (Number(item.stock ?? 0) <= 0) {
            alert('Sin stock disponible para este producto');
            return;
        }
        setCart([...cart, {...item, cartKey: key, quantity: 1}]);
        alert('Producto agregado al carrito!');
    };

    //aumentar cantidad sin superar el stock conocido
    const increaseQty=(keyOrId)=>{
        setCart((prev) => prev.map((element) => {
            if (getKey(element) !== keyOrId && element.id !== keyOrId) return element;
            const max = Number(element.stock ?? Infinity);
            const next = (element.quantity || 1) + 1;
            if (next > max) {
                alert(`Solo hay ${max} unidad(es) disponible(s)`);
                return element;
            }
            return {...element, quantity: next};
        }));
    };

    //disminuir cantidad con mínimo 1 (para quitar, usar Eliminar)
    const decreaseQty=(keyOrId)=>{
        setCart((prev) => prev.map((element) => {
            if (getKey(element) !== keyOrId && element.id !== keyOrId) return element;
            const next = (element.quantity || 1) - 1;
            return {...element, quantity: Math.max(next, 1)};
        }));
    };

    //Eliminar del carrito
    const removeItem=(keyOrId)=>{
        const updatedCart = cart.filter((element) => getKey(element) !== keyOrId && element.id !== keyOrId);
        setCart(updatedCart);
        alert('Producto eliminado del carrito!');
    };

    //vaciar carrito
    const clearCart=(silent=false)=>{
        setCart([]);
        if (!silent) alert('Carrito vacío!');
    };

    //calcular total de items del carrito sin quantity
   const getTotalItems = () => {
    return cart.reduce((acc, item) => acc + (item.quantity || 1), 0);
};

    //Total a pagar
    const getCartTotal=()=>{
        return cart.reduce((total, item) => total + item.price * (item.quantity || 1), 0);
    };

    //Checkout: descuenta una unidad por item del stock en Firestore y luego vacía el carrito
    const checkout= async ()=>{
        // Lógica de finalización de compra
        try {
            await decrementStock(cart);
        } catch (error) {
            alert(error.message || 'No se pudo completar la compra por falta de stock');
            return false;
        }
        alert('Compra realizada con éxito!');
        setCart([]);
        navigate('/');
        return true;

    }

    const values = {
        cart,
        addItem,
        removeItem,
        increaseQty,
        decreaseQty,
        getTotalItems,
        getCartTotal,
        clearCart,
        checkout,
    };
    return (
        <CartContext.Provider value={{ cart, ...values }}>
            {children}
        </CartContext.Provider>
    );
}

