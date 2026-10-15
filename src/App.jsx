import './App.css';
import{Route, Routes, Navigate, useLocation} from 'react-router-dom';
import { useEffect } from 'react';
import { ItemListContainer } from './components/ItemListContainer/ItemListContainer.jsx'; 
import { ItemDetailContainer } from './components/ItemDetailContainer/ItemDetailContainer.jsx';
import {About} from './components/About/About.jsx';
import Contact from './components/Contacto/Contacto.jsx';
import {CartView} from './components/Cart/CartView.jsx';
import { PagoRetorno } from './components/Pago/PagoRetorno.jsx';
import { PublicLayout } from './layouts/PublicLayout';
import { ProductFormContainer } from './components/adminComponents/ProductFormContainer';
import { ProductEditContainer } from './components/adminComponents/ProductEditContainer';
import { AdminLayout } from './layouts/AdminLayout';
import { ProductSuccess } from './components/adminComponents/ProductSuccess';
import { ProtectedRoute } from './components/ProtectedRoute/ProtectedRoute';
import { Login } from './components/Login/Login';
import { Dashboard } from './components/adminComponents/Dashboard/Dashboard';



function App() {
  const { pathname } = useLocation();

  // Al cambiar de ruta, volver arriba: sin esto, en móvil parece que el link no hace nada.
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [pathname]);

  return (
    <>
    
      <Routes>
        {/* Rutas públicas */}
        <Route element={<PublicLayout/>}>  {/* layout público que contiene el header y el footer, y todo lo que esté dentro de este route va a tener ese layout*/}
          <Route path="/" element={<ItemListContainer />} />
          <Route path="/product/:id" element={<ItemDetailContainer />} />
          <Route path="products/category/:category" element={<ItemListContainer />} />
          <Route path="/carrito" element={<CartView />} />
          <Route path="/pago/retorno" element={<PagoRetorno />} />

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

