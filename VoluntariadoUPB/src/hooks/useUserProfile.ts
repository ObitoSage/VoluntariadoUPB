import { useEffect, useState } from 'react';
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useAuthStore } from '../store/useAuthStore';
import { User, UserProfileUpdate, COLLECTIONS } from '../types';

export const useUserProfile = () => {
  const { user: authUser } = useAuthStore();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!authUser?.uid) {
        setUser(null);
        return;
      }

      try {
        setLoading(true);
        const userRef = doc(db, COLLECTIONS.USERS, authUser.uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          const userData = {
            uid: userSnap.id,
            ...userSnap.data(),
          } as User;
          setUser(userData);
        } else {
          // Si el usuario no existe en Firestore, crear perfil básico
          const newUser = {
            nombre: authUser.displayName || 'Usuario',
            email: authUser.email || '',
            avatar: authUser.photoURL || '', // Usar foto de Google si está disponible
            role: 'student' as const,
            campus: '',
            intereses: [],
            favoritos: [],
            createdAt: serverTimestamp(),
          };
          
          // Crear el documento del usuario con setDoc
          await setDoc(userRef, newUser);
          
          const userData: User = {
            uid: authUser.uid,
            nombre: newUser.nombre,
            email: newUser.email,
            avatar: newUser.avatar,
            role: newUser.role,
            campus: newUser.campus,
            intereses: newUser.intereses,
            favoritos: newUser.favoritos,
            createdAt: new Date(),
          };
          setUser(userData);
        }
      } catch (err) {
        console.error('Error fetching user profile:', err);
        setError('Error al cargar el perfil');
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [authUser?.uid]);

  const updateProfile = async (updates: UserProfileUpdate) => {
    if (!authUser?.uid) {
      setError('Usuario no autenticado');
      return { success: false };
    }

    try {
      setLoading(true);
      const userRef = doc(db, COLLECTIONS.USERS, authUser.uid);
      
      await updateDoc(userRef, {
        ...updates,
        updatedAt: serverTimestamp(),
      });

      // Actualizar estado local
      setUser(prev => prev ? { ...prev, ...updates } : null);
      setLoading(false);
      return { success: true };
    } catch (err: any) {
      console.error('Error updating profile:', err);
      setError('Error al actualizar el perfil');
      setLoading(false);
      return { success: false, error: err.message };
    }
  };

  const toggleFavorito = async (oportunidadId: string) => {
    if (!authUser?.uid || !user) {
      setError('Usuario no autenticado');
      return { success: false };
    }

    try {
      const favoritos = user.favoritos || [];
      const isFavorito = favoritos.includes(oportunidadId);

      const newFavoritos = isFavorito
        ? favoritos.filter((id: string) => id !== oportunidadId)
        : [...favoritos, oportunidadId];

      const userRef = doc(db, COLLECTIONS.USERS, authUser.uid);
      await updateDoc(userRef, {
        favoritos: newFavoritos,
        updatedAt: serverTimestamp(),
      });

      // Actualizar estado local
      setUser(prev => prev ? { ...prev, favoritos: newFavoritos } : null);
      return { success: true };
    } catch (err: any) {
      console.error('Error toggling favorito:', err);
      setError('Error al actualizar favoritos');
      return { success: false, error: err.message };
    }
  };

  const uploadAvatar = async (imageUri: string): Promise<{ success: boolean; url?: string }> => {
    // Esta función se implementará con useFirebaseStorage
    // Por ahora retornamos un placeholder
    return { success: false };
  };

  return {
    user,
    loading,
    error,
    updateProfile,
    uploadAvatar,
    toggleFavorito,
  };
};
