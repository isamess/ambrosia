import './ProductFormUI.css';

export const ProductFormUI = ({ //recibimos las props del componente contenedor
  product,
  errors,
  loading,
  files = [],
  categories = [],
  variants = [],
  existingImages = [],
  title = "Agregar nuevo producto",
  submitLabel = "Guardar",
  onChange,
  onVariantChange,
  onAddVariant,
  onRemoveVariant,
  onFileChange,
  onRemoveFile,
  onRemoveExisting,
  onSubmit,
}) => {
  const editMode = !!onRemoveExisting;
  return (
    <section>
      <form className="product-form" onSubmit={onSubmit}>
        <h2>{title}</h2>

        <div>
          <label>Nombre:</label>
          <input
            type="text"
            name="name"
            value={product.name} //el value necesita el estado del obj del producto para que se vea reflejado en el input y el control lo tenga React y no el navegador
            onChange={onChange}
          />
          {errors.name && <p className="error">{errors.name}</p>}
        </div>

        <div>
          <label>Precio:</label>
          <input
            type="number"
            name="price"
            value={product.price}
            onChange={onChange}
            min="0"
          />
          {errors.price && <p className="error">{errors.price}</p>}
        </div>

        <div>
          <label>Categoría:</label>
          {categories.length > 0 ? (
            <select name="category" value={product.category} onChange={onChange}>
              <option value="">Seleccionar...</option>
              {categories.map((c) => (
                <option key={c.id} value={c.slug || c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          ) : (
            <input
              type="text"
              name="category"
              value={product.category}
              onChange={onChange}
            />
          )}
          {errors.category && <p className="error">{errors.category}</p>}
        </div>

        <div>
          <label>Descripción:</label>
          <textarea
            name="description"
            value={product.description}
            onChange={onChange}
          />
          {errors.description && <p className="error">{errors.description}</p>}
        </div>

<div>
          <label>Ingredientes:</label>
          <textarea
            name="ingredients"
            value={product.ingredients}
            onChange={onChange}
          />
          {errors.ingredients && <p className="error">{errors.ingredients}</p>}
        </div>


        <div>
          <label>{editMode ? `Imágenes actuales (${existingImages.length + files.length}/3):` : "Imágenes (hasta 3, puedes elegir de distintas carpetas):"}</label>
          {existingImages.length > 0 && (
            <div className="file-previews">
              {existingImages.map((src, i) => (
                <div key={`existing-${i}`} className="file-preview">
                  <img src={src} alt={`Imagen actual ${i + 1}`} />
                  {onRemoveExisting && (
                    <button type="button" onClick={() => onRemoveExisting(i)}>Quitar</button>
                  )}
                </div>
              ))}
            </div>
          )}
          {editMode && <label>Agregar nuevas (hasta completar 3):</label>}
          <input type="file" accept="image/*" multiple onChange={onFileChange} />
          <small>{editMode ? `${files.length} nueva(s) seleccionada(s). Cada elección se suma a las anteriores.` : `${files.length}/3 seleccionadas. Cada elección se suma a las anteriores.`}</small>
          {files.length > 0 && (
            <div className="file-previews">
              {files.map((f, i) => (
                <div key={`${f.name}-${f.size}-${i}`} className="file-preview">
                  <img src={URL.createObjectURL(f)} alt={`Vista previa ${i + 1}`} />
                  <span>{f.name}</span>
                  <button type="button" onClick={() => onRemoveFile(i)}>Quitar</button>
                </div>
              ))}
            </div>
          )}
          {errors.files && <p className="error">{errors.files}</p>}
        </div>

        <div>
          <label> Stock:</label>
          <input
            type="number"
            name="stock"
            value={product.stock}
            onChange={onChange}
            min="0"
            step="1"
          />
          {errors.stock && <p className="error">{errors.stock}</p>}
        </div>

        <div>
          <label>Presentaciones / variantes (opcional):</label>
          <small>Ej: Unidad, Caja x6, Caja x12. Cada una con su precio y stock. Si no agregás ninguna, se usa el precio y stock de arriba.</small>
          {(variants || []).map((v, i) => (
            <div key={i} className="variant-row">
              <input
                type="text"
                placeholder="Nombre (ej: Caja x6)"
                value={v.name}
                onChange={(e) => onVariantChange(i, "name", e.target.value)}
              />
              <input
                type="number"
                placeholder="Precio"
                value={v.price}
                onChange={(e) => onVariantChange(i, "price", e.target.value)}
                min="0"
              />
              <input
                type="number"
                placeholder="Stock"
                value={v.stock}
                onChange={(e) => onVariantChange(i, "stock", e.target.value)}
                min="0"
                step="1"
              />
              <input
                type="text"
                placeholder="SKU (opcional)"
                value={v.sku || ""}
                onChange={(e) => onVariantChange(i, "sku", e.target.value)}
              />
              <button type="button" onClick={() => onRemoveVariant(i)}>Quitar</button>
            </div>
          ))}
          <button type="button" onClick={onAddVariant}>Agregar presentación</button>
          {errors.variants && <p className="error">{errors.variants}</p>}
        </div>

        <button className="btn" type="submit" disabled={loading}>
          {loading ? "Guardando..." : submitLabel}
        </button>

        {errors.general && <p className="error">{errors.general}</p>}
      </form>
    </section>
  );
};