import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createProduct, getCategories } from '../../services/productService';
import { ProductFormUI } from './ProductFormUI';
import { validateProduct } from '../../utils/validateProduct';
import { slugify } from '../../utils/slugify';
import { uploadImage } from '../../services/uploadImage';
import './ProductFormContainer.css';




export const ProductFormContainer = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [files, setFiles] = useState([]);
    const [categories, setCategories] = useState([]);
    const [variants, setVariants] = useState([]);
    const[product, setProduct] = useState({
        name: '',
        description: '',
        ingredients: '',
        category: '',
        stock: '',
        price: '',
});

    useEffect(() => {
        getCategories().then(setCategories).catch(() => setCategories([]));
    }, []);


//función para que no tenga que estar repitiendo código en cada input, es decir, es un manejador genérico para todos los campos del formulario. Forma programática de armar las clave-valor del obj de las product.

const handleChange = (e) => {
    const { name, value } = e.target; // desestructuro solo el name y value
    setProduct({...product, [name]: value}); //este name es el atributo del input
};

//manejador de las fotos (acumula hasta 3, permite elegir de distintas carpetas)
const handleFileChange = (e) => {
    const selected = Array.from(e.target.files || []);
    if (!selected.length) return;
    setFiles((prev) => [...(prev || []), ...selected].slice(0, 3));
    e.target.value = ""; // permite volver a elegir el mismo archivo u otra carpeta
};

const handleRemoveFile = (index) => {
    setFiles((prev) => (prev || []).filter((_, i) => i !== index));
};

//manejadores de variantes (presentaciones)
const handleAddVariant = () => {
    setVariants((prev) => [...(prev || []), { name: "", price: "", stock: "", sku: "" }]);
};

const handleVariantChange = (index, field, value) => {
    setVariants((prev) => (prev || []).map((v, i) => (i === index ? { ...v, [field]: value } : v)));
};

const handleRemoveVariant = (index) => {
    setVariants((prev) => (prev || []).filter((_, i) => i !== index));
};

const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    setErrors({}); //lo seteo a vacío para limpiar los errores anteriores cada vez que se intente enviar el formulario

    // Validación simple del formulario
    const newErrors = validateProduct(product, files, variants); //le paso el obj del producto, las fotos y las variantes para validar
    if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        setLoading(false);
        return;
    }
    //subir las imágenes a Cloudinary y obtener las URLs para armar el producto y luego crearlo en la base de datos
    try {
        const imageUrls = await Promise.all(files.map((f) => uploadImage(f)));
        const categorySlug = slugify(product.category);
        const normalizedVariants = (variants || []).map((v) => ({
            id: v.id || slugify(v.name),
            name: String(v.name).trim(),
            price: Number(v.price),
            stock: Number(v.stock),
            sku: String(v.sku || "").trim(),
        }));
        const productData = {
            ...product, 
            price: parseFloat(product.price),
            stock: product.stock === "" ? 0 : Number(product.stock),
            categorySlug, // duplicado para el filtro por categoría (getByCategory)
            variants: normalizedVariants, // array vacío si no hay presentaciones
            image: imageUrls[0], // portada para compatibilidad con listados
            images: imageUrls}; // galería de hasta 3 para el detalle

        //alta-creación  del producto
        const id = await createProduct(productData);

        //vaciar el formulario
        setProduct({ name: "", description: "", ingredients: "", category: "", price: "", stock: "" });
        setVariants([]);
      setFiles([]);
        navigate(`/admin/products/success/${id}`, { replace: true });
        
    } catch (error) {
         setErrors({ general: error.message });  
    }
    finally {
        setLoading(false);
    } 
};  


return (
<ProductFormUI
    product={product}  //estado del obj del producto al componente de presentación
    errors={errors} //renderizar los msj de error del form
    loading={loading}  //muestra indicador de carga mientras se procesa el formulario y lo utilizamos en el botón
    files={files} //fotos acumuladas para previsualizar
    categories={categories} //categorías de Firestore para el desplegable
    variants={variants}
    onChange=  {handleChange}  //le pasamos todos los campos
    onVariantChange={handleVariantChange}
    onAddVariant={handleAddVariant}
    onRemoveVariant={handleRemoveVariant}
    onFileChange={handleFileChange}  //manejador de las fotos
    onRemoveFile={handleRemoveFile} //quitar una foto de la selección
    onSubmit={handleSubmit}
/>
);

};