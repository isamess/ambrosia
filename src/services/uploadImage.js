const CLOUD_NAME = "hle3sc6s";
const UPLOAD_PRESET = "ambrosia";


export const uploadImage = async (file) => {
  const formData = new FormData();

  formData.append("file", file);
  formData.append("upload_preset", UPLOAD_PRESET);

  try {
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/upload`,
      
      {
        method: "POST",
        body: formData,
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error?.message || "Error al subir imagen");
    }

    return data.secure_url;
  } catch (error) {
    console.error("Cloudinary error:", error);
    throw error;
  }
};