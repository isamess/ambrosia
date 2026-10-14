export const validateProduct = (product, files, variants = []) => {
  const errors = {};

  if (!product.name.trim()) {
    errors.name = "El nombre es obligatorio";
  }

  if (!product.price || product.price <= 0) {
    errors.price = "El precio debe ser mayor que 0";
  }

  if (!product.description.trim()) {
    errors.description = "La descripción es obligatoria";
  }

  if (!product.category.trim()) {
    errors.category = "La categoría es obligatoria";
  }

  const fileList = files ?? product.files ?? (product.file ? [product.file] : []);

  if (!fileList.length) {
    errors.files = "Debes seleccionar al menos una imagen";
  } else if (fileList.length > 3) {
    errors.files = "Máximo 3 imágenes por producto";
  }

  if (!product.ingredients.trim()) {
    errors.ingredients = "Debes colocar los ingredientes";
  }

  if (product.stock === "" || product.stock === null || product.stock === undefined) {
    errors.stock = "El stock es obligatorio";
  } else if (!Number.isInteger(Number(product.stock)) || Number(product.stock) < 0) {
    errors.stock = "El stock debe ser un número entero mayor o igual a 0";
  }

  (variants || []).forEach((v, i) => {
    const n = i + 1;
    if (!String(v.name || "").trim()) {
      errors.variants = `La presentación ${n} necesita un nombre`;
    } else if (!v.price || Number(v.price) <= 0) {
      errors.variants = `La presentación "${v.name}" debe tener precio mayor que 0`;
    } else if (v.stock === "" || v.stock === null || v.stock === undefined || !Number.isInteger(Number(v.stock)) || Number(v.stock) < 0) {
      errors.variants = `La presentación "${v.name}" debe tener stock entero mayor o igual a 0`;
    }
  });

  return errors;
};