import React from 'react';
import "./Contacto.css";
import { useState } from "react";
import emailjs from "@emailjs/browser";


const Contact = () => {
  const [form, setForm] = useState({
    nombre: "",
    email: "",
    mensaje: ""
  });
  const [sending, setSending] = useState(false);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSending(true);

    try {
      await emailjs.send(
        import.meta.env.VITE_EMAILJS_SERVICE_ID,
        import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
        {
          nombre: form.nombre,
          email: form.email,
          mensaje: form.mensaje,
        },
        { publicKey: import.meta.env.VITE_EMAILJS_PUBLIC_KEY }
      );

      alert("Gracias por tu mensaje ✨");
      setForm({ nombre: "", email: "", mensaje: "" });
    } catch (error) {
      console.error("Error enviando mensaje:", error);
      alert("No se pudo enviar. Intentá de nuevo.");
    } finally {
      setSending(false);
    }
  };

  return (
    <section className="container contact">
      <h1>Contacto</h1>

      <p>
        Si querés preguntar algo, consultar por un producto, hacer alguna sugerencia o simplemente
        conectar, podés escribirnos a través de este formulario y te contestaremos a la brevedad.
      </p>

      <form onSubmit={handleSubmit} className="contact-form">
        <input
          type="text"
          name="nombre"
          placeholder="Tu nombre"
          value={form.nombre}
          onChange={handleChange}
          required
        />

        <input
          type="email"
          name="email"
          placeholder="Tu email"
          value={form.email}
          onChange={handleChange}
          required
        />

        <textarea
          name="mensaje"
          placeholder="Escribí tu mensaje..."
          value={form.mensaje}
          onChange={handleChange}
          required
        />

        <button type="submit" disabled={sending}>{sending ? "Enviando..." : "Enviar"}</button>
      </form>
    </section>
  );
};

export default Contact;