import './Footer.css';
import { Link } from 'react-router-dom';
import { FaInstagram} from "react-icons/fa";

export const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer__container">
        
        <div className="footer__col footer__col--center">
          <h3 className="footer__title">Ambrosía Delicatessen</h3>
          
        </div>

        <div className="footer__col footer__col--center">
          <h4 className="footer__title">Links</h4>
          <ul className="footer__links">
            <li><Link to="/">Inicio</Link></li>
            <li><Link to="/about">Nosotr@s</Link></li>
            <li><Link to="/contact">Contacto</Link></li>
          </ul>

        <div >
          <p> Diseñado con alma por <a className="footer_insta_design" href="https://www.instagram.com/isadisenioweb/" target="_blank" rel="noopener noreferrer" aria-label="Instagram">isadisenioweb 💜</a> </p>
        </div>
        </div>

        <div className="footer__col footer__col--center">
          <h4 className="footer__title">Seguinos</h4>
          <div className="footer__social">
            <a href="https://www.instagram.com/ambrosia.alfajores" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
              <FaInstagram size={48} />
            </a>
          </div>
        </div>

      </div>

      <div className="footer__bottom">
        © 2026 - Ambrosía Delicatessen Todos los derechos reservados
      </div>
    </footer>
  );
}


