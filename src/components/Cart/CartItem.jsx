import { useCart } from "../../context/CartContext";




export const CartItem = ({item})=>{
    const {removeItem, increaseQty, decreaseQty}= useCart();
    const cover = item.images?.length ? (typeof item.images[0] === "string" ? item.images[0] : item.images[0]?.url) : item.image;
    const qty = item.quantity || 1;
    const key = item.cartKey || `${item.id}__${item.variantId ?? "base"}`;
    return(
        <article className="cart-item">
            {cover && (
                <img className="cart-thumb" src={cover} alt={`Imagen de ${item.name}`} />
            )}
            <div className="cart-item-info">
                <h3 className="cart-item-name">{item.name}</h3>
                {item.variantName && <p className="cart-item-variant">{item.variantName}</p>}
                <p className="cart-item-price">Precio: ${item.price} c/u</p>
                <div className="qty-controls">
                    <button type="button" className="qty-btn" onClick={()=>decreaseQty(key)} disabled={qty <= 1} aria-label="Quitar una unidad">−</button>
                    <span className="qty-value">{qty}</span>
                    <button type="button" className="qty-btn" onClick={()=>increaseQty(key)} aria-label="Agregar una unidad">+</button>
                </div>
            </div>
            <div className="cart-item-side">
                <p className="cart-item-subtotal">${item.price * qty}</p>
                <button
                className="btn bg-delete primary"
                onClick={()=>removeItem(key)}
                >
                    Eliminar
                </button>
            </div>
        </article>
    );
};
