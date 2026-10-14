import './App.css';
import{Route, Routes, Navigate} from 'react-router-dom';
import { ItemListContainer } from './components/ItemListContainer/ItemListContainer.jsx'; 
import { ItemDetailContainer } from './components/ItemDetailContainer/ItemDetailContainer.jsx';
import {About} from './components/About/About.jsx';
import Contact from './components/Contacto/Contacto.jsx';
import {CartView} from './components/Cart/CartView.jsx';
import { PublicLayout } from './layouts/PublicLayout';
import { ProductFormContainer } from './components/adminComponents/ProductFormContainer';
import { ProductEditContainer } from './components/adminComponents/ProductEditContainer';
import { AdminLayout } from './layouts/AdminLayout';
import { ProductSuccess } from './components/adminComponents/ProductSuccess';
import { ProtectedRoute } from './components/ProtectedRoute/ProtectedRoute';
import { Login } from './components/Login/Login';
import { Dashboard } from './components/adminComponents/Dashboard/Dashboard';



function App() {
  return (
    <>
    
      <Routes>
        {/* Rutas públicas */}
        <Route element={<PublicLayout/>}>  {/* layout público que contiene el header y el footer, y todo lo que esté dentro de este route va a tener ese layout*/}
          <Route path="/" element={<ItemListContainer />} />
          <Route path="/product/:id" element={<ItemDetailContainer />} />
          <Route path="products/category/:category" element={<ItemListContainer />} />
          <Route path="/carrito" element={<CartView />} />

          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
        </Route>

         <Route path="/admin/login" element={<Login />} />
         
        {/* Rutas protegidas para el panel de administración */}


         <Route path="/admin" element={
          <ProtectedRoute>
            <AdminLayout/>
          </ProtectedRoute>
          }
          >
            <Route index element={<Navigate to={"dashboard"}/>}/>   {/* Si el admin esta logueado, redirige a la ruta /admin/dashboard */}
            <Route path="dashboard" element={<Dashboard/>}/>
           

            <Route path="products/new" element={<ProductFormContainer/>}/>
            <Route path="products/edit/:id" element={<ProductEditContainer/>}/>
            <Route path="products/success/:id" element={<ProductSuccess/>}/>

         </Route>
                     
        
      </Routes>
    
    </>
  );
};

export default App;

