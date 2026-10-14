import { useEffect, useState } from "react";
import { useCart } from "../../context/CartContext.jsx";
import './ItemDetail.css';



export const ItemDetail = ({item}) => {
    const {addItem} = useCart();
    const [selected, setSelected] = useState(0);

    const gallerySrc = (src) => (typeof src === "string" ? src.trim() : src?.url ?? "");
    const gallery = [
        ...(Array.isArray(item?.images) ? item.images : []),
        ...(item?.image ? [item.image] : []),
    ]
        .map(gallerySrc)
        .filter((src, i, arr) => src && src !== "[]" && src.startsWith("http") && arr.indexOf(src) === i);

    const variants = Array.isArray(item?.variants) ? item.variants : [];
    const hasVariants = variants.length > 0;
    const [variantIndex, setVariantIndex] = useState(0);
    const activeVariant = hasVariants ? variants[variantIndex] : null;

    const displayPrice = Number(activeVariant?.price ?? item?.price ?? 0).toLocaleString("es-AR");
    const displayStock = Number(activeVariant?.stock ?? item?.stock ?? 0);
    const unavailable = item?.active === false;

    useEffect(() => {
        setSelected(0);
        setVariantIndex(0);
    }, [item?.id]);

    if (!item) {
        return <p>Cargando producto...</p>;
    }
    return (
        //le pongo una función flecha al onClick para que no se autoinvoque el botón al renderizar el componente
        <article>
            <div className="tarjeta tarjeta--detail">
                {gallery.length > 0 && (
                    <img
                        className="gallery-main"
                        src={gallerySrc(gallery[selected] ?? gallery[0])}
                        alt={`Imagen de ${item.name}`}
                    />
                )}
                {gallery.length > 1 && (
                    <div className="gallery-thumbs">
                        {gallery.map((src, i) => (
                            <button
                                key={gallerySrc(src) + i}
                                type="button"
                                className={`thumb${i === selected ? " selected" : ""}`}
                                onClick={() => setSelected(i)}
                                aria-label={`Ver imagen ${i + 1}`}
                            >
                                <img src={gallerySrc(src)} alt="" />
                            </button>
                        ))}
                    </div>
                )}
                <div className="tarjeta__contenido">
                    <h2 className="tarjeta__nombre">{item.name}</h2>
                    <p className="tarjeta__descripcion">{item.description}</p>
                    <p className="tarjeta__stock">Ingredientes: {item.ingredients}</p>
                    {hasVariants && (
                        <div className="variantes">
                            <label>Presentación:</label>
                            <select
                                value={variantIndex}
                                onChange={(e) => setVariantIndex(Number(e.target.value))}
                            >
                                {variants.map((v, i) => (
                                    <option key={v.id ?? v.name ?? i} value={i}>
                                        {v.name} — ${Number(v.price ?? 0).toLocaleString("es-AR")}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}
                    <p className="tarjeta__precio">Precio: ${displayPrice}</p>
                    <p className="tarjeta__stock">Stock: {displayStock}</p>
                    {unavailable && <p className="tarjeta__stock">Producto no disponible</p>}
                </div>
            </div>

            <button className='boton'
            disabled={unavailable}
            onClick={()=> addItem({
                ...item,
                variantId: activeVariant?.id ?? activeVariant?.name ?? null,
                variantName: activeVariant?.name ?? null,
                price: Number(activeVariant?.price ?? item.price ?? 0),
                stock: Number(activeVariant?.stock ?? item.stock ?? 0),
            })}>
                Agregar al carrito
            </button>
        </article>
    );
};
