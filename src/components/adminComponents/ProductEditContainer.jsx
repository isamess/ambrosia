import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getProductById, updateProduct, getCategories } from '../../services/productService';
import { ProductFormUI } from './ProductFormUI';
import { validateProduct } from '../../utils/validateProduct';
import { slugify } from '../../utils/slugify';
import { uploadImage } from '../../services/uploadImage';
import './ProductFormContainer.css';



export const ProductEditContainer = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [errors, setErrors] = useState({});
    const [files, setFiles] = useState([]); // fotos nuevas por subir
    const [existingImages, setExistingImages] = useState([]); // urls ya guardadas
    const [categories, setCategories] = useState([]);
    const [variants, setVariants] = useState([]);
    const [product, setProduct] = useState({
        name: '',
        description: '',
        ingredients: '',
        category: '',
        stock: '',
        price: '',
    });

    useEffect(() => {
        getCategories().then(setCategories).catch(() => setCategories([]));
        getProductById(id)
            .then((data) => {
                if (!data) {
                    setErrors({ general: "Producto no encontrado" });
                    return;
                }
                setProduct({
                    name: data.name || '',
                    description: data.description || '',
                    ingredients: data.ingredients || '',
                    category: data.category || data.categorySlug || '',
                    stock: data.stock ?? '',
                    price: data.price ?? '',
                });
                setExistingImages(data.images?.length ? data.images : (data.image ? [data.image] : []));
                setVariants(
                    (Array.isArray(data.variants) ? data.variants : []).map((v) => ({
                        id: v.id || "",
                        name: v.name || "",
                        price: v.price ?? "",
                        stock: v.stock ?? "",
                        sku: v.sku || "",
                    }))
                );
            })
            .catch((error) => setErrors({ general: error.message }))
            .finally(() => setLoading(false));
    }, [id]);

const handleChange = (e) => {
    const { name, value } = e.target;
    setProduct({...product, [name]: value});
};

//fotos nuevas: cada elección se acumula (permite distintas carpetas)
const handleFileChange = (e) => {
    const selected = Array.from(e.target.files || []);
    if (!selected.length) return;
    setFiles((prev) => [...(prev || []), ...selected].slice(0, 3 - existingImages.length));
    e.target.value = "";
};

const handleRemoveFile = (index) => {
    setFiles((prev) => (prev || []).filter((_, i) => i !== index));
};

const handleRemoveExisting = (index) => {
    setExistingImages((prev) => prev.filter((_, i) => i !== index));
};

//manejadores de variantes (presentaciones)
const handleAddVariant = () => {
    setVariants((prev) => [...(prev || []), { id: "", name: "", price: "", stock: "", sku: "" }]);
};

const handleVariantChange = (index, field, value) => {
    setVariants((prev) => (prev || []).map((v, i) => (i === index ? { ...v, [field]: value } : v)));
};

const handleRemoveVariant = (index) => {
    setVariants((prev) => (prev || []).filter((_, i) => i !== index));
};

const handleSubmit = async (e) => {
    e.preventDefault();

    setSaving(true);
    setErrors({});

    //valido campos + total de fotos (actuales + nuevas) entre 1 y 3
    const combined = [...existingImages, ...files];
    const newErrors = validateProduct(product, combined, variants);
    if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        setSaving(false);
        return;
    }
    try {
        const newUrls = await Promise.all(files.map((f) => uploadImage(f)));
        const merged = [...existingImages, ...newUrls].slice(0, 3);
        const normalizedVariants = (variants || []).map((v) => ({
            id: v.id || slugify(v.name),
            name: String(v.name).trim(),
            price: Number(v.price),
            stock: Number(v.stock),
            sku: String(v.sku || "").trim(),
        }));
        await updateProduct(id, {
            ...product,
            price: parseFloat(product.price),
            stock: product.stock === "" ? 0 : Number(product.stock),
            categorySlug: slugify(product.category),
            variants: normalizedVariants,
            image: merged[0], // portada para compatibilidad con listados
            images: merged,
        });

        navigate(`/admin/products/success/${id}`, { replace: true });

    } catch (error) {
         setErrors({ general: error.message });
    }
    finally {
        setSaving(false);
    }
};

if (loading) return <p>Cargando producto...</p>;

return (
<ProductFormUI
    product={product}
    errors={errors}
    loading={saving}
    files={files}
    categories={categories}
    variants={variants}
    existingImages={existingImages}
    title="Editar producto"
    submitLabel="Guardar cambios"
    onChange={handleChange}
    onVariantChange={handleVariantChange}
    onAddVariant={handleAddVariant}
    onRemoveVariant={handleRemoveVariant}
    onFileChange={handleFileChange}
    onRemoveFile={handleRemoveFile}
    onRemoveExisting={handleRemoveExisting}
    onSubmit={handleSubmit}
/>
);

};
