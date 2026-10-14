
import { Nav } from '../Nav/Nav';
import './Header.css';
import logo from '../../assets/logo.png';
import { Link } from 'react-router-dom';




export const Header = () => {
    return (
       <header className='header'>
        <div>
            <Link className='header__logo' to="/">
                <img src={logo} alt="Logo" />
                <span className='header__span'>Ambrosía Delicatessen</span>
            </Link>
        </div>
            
            <Nav/> 
       
        </header>
    )
}


