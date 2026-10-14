import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getByCategory } from "../../services/productService.js";
import { ItemList } from "../ItemList/ItemList";
import ProductSkeleton from "../ProductSkeleton/ProductSkeleton.jsx";
import "./ItemListContainer.css";

//componente cerebro: contiene la logica de negocio, se encarga de traer los datos de la DB y pasarlos al componente ItemList para que los renderice

const PAGE_SIZE = 9; // 3 columnas x 3 filas

export const ItemListContainer = () => {
    const {category} = useParams();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);

    useEffect(() => {
        setLoading(true);
        setPage(1);

        getByCategory(category)
        .then((data) => setProducts(data))
        .catch((error) => console.error("Error al cargar los productos:", error))
        .finally(() => setLoading(false));

    }, [category]);

    const totalPages = Math.max(1, Math.ceil(products.length / PAGE_SIZE));
    const currentPage = Math.min(page, totalPages);
    const visible = products.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

    const setCurrentPageSafe = (next) => {
        setPage(next);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    return (
        <section>
            {loading ? (<div className="products-container" role="status" aria-label="Cargando productos">
        {[...Array(6)].map((_, i) => (
          <ProductSkeleton key={i} />
        ))}
      </div>
            ) : (
                <>
                    <ItemList products={visible} />
                    {totalPages > 1 && (
                        <nav className="pagination" aria-label="Paginación de productos">
                            <button
                                type="button"
                                disabled={currentPage <= 1}
                                onClick={() => setCurrentPageSafe(currentPage - 1)}
                            >
                                Anterior
                            </button>
                            <span>Página <strong>{currentPage}</strong> de {totalPages}</span>
                            <button
                                type="button"
                                disabled={currentPage >= totalPages}
                                onClick={() => setCurrentPageSafe(currentPage + 1)}
                            >
                                Siguiente
                            </button>
                        </nav>
                    )}
                </>
            )}
        </section>
    );
};
