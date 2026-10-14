import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
} from "firebase/auth";
import { createContext, useContext, useEffect, useState } from "react";
import { auth } from "../firebase/config";

//creamos el contexto
const AuthContext = createContext();

//custom hook
export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth debe usarse dentro de un AuthProvider");
  }

  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Escucha los cambios en el estado de autenticación del usuario en Firebase. Cuando el estado de autenticación cambia (por ejemplo, cuando un usuario inicia sesión o cierra sesión), se actualiza el estado del usuario en el contexto y se establece loading en false.
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  //función que termino de utilizar en el comp Login. Firebase brinda varios métodos de autenticación, y signInWithEmailAndPassword es uno de ellos. Esta función toma el email y la contraseña del usuario y llama a la función signInWithEmailAndPassword de Firebase para autenticar al usuario. Si la autenticación es exitosa, el estado del usuario en el contexto se actualizará automáticamente gracias al listener onAuthStateChanged.Esto es lo que configuramos en Firebase Authentication, en la sección de Sign-in method, habilitando el método de autenticación por correo electrónico y contraseña.
  const login = (email, password) => {
    return signInWithEmailAndPassword(auth, email, password);
  };

  //singnOut viene de firebase/auth y cierra la sesión del usuario actual. Luego, se actualiza el estado del usuario en el contexto a null, lo que indica que no hay un usuario autenticado actualmente.
  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  // Envía el email de recupero de contraseña de Firebase al correo indicado.
  const resetPassword = (email) => {
    return sendPasswordResetEmail(auth, email);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, resetPassword }}>
      {children}
    </AuthContext.Provider>
  );
};