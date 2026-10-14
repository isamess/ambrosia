import {Link} from 'react-router-dom';
import './Nav.css';
import { FaShoppingCart } from 'react-icons/fa';
import { useCart } from '../../context/CartContext';
import { useEffect, useState } from 'react';
import { getCategories } from '../../services/productService';

// Fallback por si Firestore no responde (reglas sin desplegar o sin conexión):
// el menú nunca queda vacío.
const FALLBACK_CATEGORIES = [
    { id: 'alfajores', name: 'Alfajores', slug: 'alfajores' },
    { id: 'cookies', name: 'Cookies', slug: 'cookies' },
    { id: 'barras-energeticas', name: 'Barras Energéticas', slug: 'barras-energeticas' },
];




export const Nav = () => {

    const {getTotalItems} = useCart();
    const totalItems = getTotalItems();
    const [categories, setCategories] = useState(FALLBACK_CATEGORIES);

    useEffect(() => {
        getCategories()
            .then((data) => {
                if (data.length) setCategories(data);
            })
            .catch(() => {});
    }, []);

    return (
        <nav className="menu">
            <ul>
    <li>
        <Link to="/">Home</Link>
    </li>

    {categories.map((c) => (
        <li key={c.id}>
            <Link to={`/products/category/${c.slug || c.id}`}>
                {c.name}
            </Link>
        </li>
    ))}

    <li>
        <Link to="/about">Acerca de</Link>
    </li>

    <li>
        <Link to="/contact">Contacto</Link>
    </li>

    <li>
        <Link to="/carrito" className="cart-link">
            <FaShoppingCart size={26} />
            {totalItems > 0 && <span className="cart-badge">{totalItems}</span>}
        </Link>
    </li>
</ul>
        </nav>
    )
};
