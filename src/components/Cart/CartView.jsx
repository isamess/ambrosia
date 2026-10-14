import { Link } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import { CartList } from "./CartList";
import { CartSummary } from "./CartSummary";
import "./Cart.css";



export const CartView = () => {

    const {cart} = useCart();
    return(
       <section className="cart-container">
        <h2>Carrito de Compras 🛒</h2>
        
        {cart.length ?(
        <>
            <CartList/>
            <CartSummary/>
        </> 
        ) : (
            <>
            <p className="empty-cart">Tu carrito está vacío</p>
            <Link className="btn bg-primary" to={"/"}>
                Seguir comprando
            </Link>
            </>
        )}
       </section>
    );
};