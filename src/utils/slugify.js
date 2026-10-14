// Normaliza un texto a slug URL: minúsculas, sin acentos, espacios -> guiones.
// Ej: "Barras Energéticas" -> "barras-energeticas"
export const slugify = (text) =>
    String(text ?? "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-");
