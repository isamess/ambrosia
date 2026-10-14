import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./Dashboard.css";
import { useAuth } from "../../../context/AuthContext";
import { getProducts } from "../../../services/productService";

// Componente Dashboard presentacional para el panel de administración
export const Dashboard = () => {
  const { logout } = useAuth();
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);

  useEffect(() => {
    getProducts()
      .then((data) => setProducts(data))
      .catch((error) => console.error("Error al cargar productos:", error))
      .finally(() => setLoadingProducts(false));
  }, []);

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h2>Panel de administración</h2>

        <div className="header-actions">
          <Link className="btn primary" to="/">
            Volver a la tienda
          </Link>
          <button className="btn bg-delete primary" onClick={logout}>
            Cerrar sesión
          </button>
        </div>
      </header>

      <section className="dashboard-actions">
        <h3>Acciones rápidas</h3>

        <div className="actions-grid">
          <Link to="/admin/products/new" className="action-card">
            ➕ Cargar
          </Link>

          <Link to="#" className="action-card disabled">
            🗑️ Eliminar
          </Link>
        </div>
      </section>

      <section className="dashboard-products">
        <h3>✏️ Editar productos</h3>
        {loadingProducts ? (
          <p>Cargando productos...</p>
        ) : !products.length ? (
          <p>No hay productos cargados.</p>
        ) : (
          <ul className="dashboard-product-list">
            {products.map((p) => (
              <li key={p.id}>
                <span>{p.name} <small>({(p.images?.length ?? (p.image ? 1 : 0))}/3 fotos)</small></span>
                <Link to={`/admin/products/edit/${p.id}`} className="btn-edit">
                  Editar
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="dashboard-help">
        <h3>Ayuda</h3>
        <p>Desde este panel podés gestionar los productos de la tienda.</p>
      </section>
    </div>
  );
};
