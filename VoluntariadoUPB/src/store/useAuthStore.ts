import { create } from 'zustand';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithCredential,
  User
} from 'firebase/auth';
import { auth } from '../../config/firebase';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  
  // Acciones
  signUp: (email: string, password: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signInWithGoogle: (idToken: string) => Promise<void>;
  logout: () => Promise<void>;
  setUser: (user: User | null) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: true,
  error: null,

  signUp: async (email: string, password: string) => {
    try {
      set({ isLoading: true, error: null });
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      set({ user: userCredential.user, isLoading: false });
    } catch (error: any) {
      let errorMessage = 'Error al crear la cuenta';
      
      switch (error.code) {
        case 'auth/email-already-in-use':
          errorMessage = 'Este correo ya está registrado';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Correo electrónico inválido';
          break;
        case 'auth/weak-password':
          errorMessage = 'La contraseña debe tener al menos 6 caracteres';
          break;
      }
      
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  signIn: async (email: string, password: string) => {
    try {
      set({ isLoading: true, error: null });
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      set({ user: userCredential.user, isLoading: false });
    } catch (error: any) {
      let errorMessage = 'Error al iniciar sesión';
      
      switch (error.code) {
        case 'auth/user-not-found':
        case 'auth/wrong-password':
          errorMessage = 'Correo o contraseña incorrectos';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Correo electrónico inválido';
          break;
        case 'auth/user-disabled':
          errorMessage = 'Esta cuenta ha sido deshabilitada';
          break;
      }
      
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  signInWithGoogle: async (idToken: string) => {
    try {
      set({ isLoading: true, error: null });
      const credential = GoogleAuthProvider.credential(idToken);
      const userCredential = await signInWithCredential(auth, credential);
      set({ user: userCredential.user, isLoading: false });
    } catch (error: any) {
      let errorMessage = 'Error al iniciar sesión con Google';
      
      if (error.code === 'auth/account-exists-with-different-credential') {
        errorMessage = 'Ya existe una cuenta con este correo usando otro método';
      }
      
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  logout: async () => {
    try {
      set({ isLoading: true, error: null });
      await signOut(auth);
      // Esperamos un tick para asegurarnos de que Firebase procese el cambio
      await new Promise(resolve => setTimeout(resolve, 0));
      set({ user: null, isLoading: false });
    } catch (error: any) {
      set({ error: 'Error al cerrar sesión', isLoading: false });
      throw error;
    }
  },

  setUser: (user) => set({ user, isLoading: false }),
  
  setError: (error) => set({ error }),
  
  clearError: () => set({ error: null }),
}));

// Listener para cambios en el estado de autenticación
onAuthStateChanged(auth, (user) => {
  useAuthStore.getState().setUser(user);
});
