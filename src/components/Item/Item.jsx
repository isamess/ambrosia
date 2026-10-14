//Componente Presentacional exhibidor: se encarga de la apariencia de un único producto, recibe los datos del item y los muestra en pantalla.

import "./Item.css";

export const Item = ({ name, description, ingredients, price, image, images, variants, stock, featured , children }) => {
    const srcOf = (s) => (typeof s === "string" ? s.trim() : s?.url ?? "");
    const valid = (s) => s && s !== "[]" && s.startsWith("http");
    const cover = [srcOf(Array.isArray(images) ? images[0] : null), srcOf(image)].find(valid) ?? "";
    const hasVariants = Array.isArray(variants) && variants.length > 0;
    const minPrice = hasVariants ? Math.min(...variants.map((v) => Number(v.price ?? 0))) : Number(price ?? 0);
    const displayPrice = `${hasVariants ? "Desde $" : "$"}${minPrice.toLocaleString("es-AR")}`;
    const totalStock = hasVariants
        ? variants.reduce((acc, v) => acc + Number(v.stock ?? 0), 0)
        : Number(stock ?? 0);
    return(
        <article>
            <div className= "tarjeta">
                <img src={cover} alt={`Imagen de ${name}`} />
                 <div className="tarjeta__contenido"> 
                <h2 className="tarjeta__nombre">{name}</h2>
                {featured && <span className="tarjeta__badge">Destacado</span>}
                <p className="tarjeta__descripcion">{description}</p>
                {/* <p className="tarjeta__stock">Ingredientes: {ingredients}</p> */}
                <p className="tarjeta__precio">Precio: {displayPrice}</p>
                <p className="tarjeta__stock">{totalStock > 0 ? `Stock: ${totalStock}` : "Sin stock"}</p>
                {hasVariants && <p className="tarjeta__stock">{variants.length} presentaciones</p>}
            </div>

            </div>
            {children}
        </article>
    )
};