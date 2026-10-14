//componente organizador: recibe la lista del container, organiza, prepara y delega la tarea de mostrar cada item al componente Item, que es el que se encarga de renderizarlo.

import { Link } from "react-router-dom";
import { Item } from "../Item/Item";
import "./ItemList.css";

export const ItemList = ({ products }) => {
    if(!products.length) {
        return <p>No hay productos disponibles en esta categoría por el momento.</p>;
    }
   return (
        <div className= "products-container">
            {products.map((product) => (
                //pongo el link acá para que cada producto sea un link a su detalle
                <Link  to={`/product/${product.id}`} key={product.id} className="link">

                    <Item { ...product }/>
                </Link>
            ))}          
        </div>


    );
}