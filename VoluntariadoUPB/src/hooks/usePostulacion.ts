import { useState } from 'react';
import { 
  collection, 
  addDoc, 
  doc, 
  updateDoc, 
  increment,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useAuthStore } from '../store/useAuthStore';
import { PostulacionFormData, COLLECTIONS, Oportunidad } from '../types';

export const usePostulacion = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuthStore();

  const crearPostulacion = async (
    oportunidad: Oportunidad,
    formData: PostulacionFormData
  ) => {
    if (!user) {
      setError('Debes iniciar sesión para postularte');
      return { success: false };
    }

    try {
      setLoading(true);
      setError(null);

      const postulacionData = {
        estudianteId: user.uid,
        estudianteNombre: user.displayName || user.email || 'Usuario',
        estudianteEmail: user.email,
        oportunidadId: oportunidad.id,
        oportunidadTitulo: oportunidad.titulo,
        motivacion: formData.motivacion,
        disponibilidad: formData.disponibilidad,
        telefono: formData.telefono || '',
        estado: 'submitted',
        confirmado: false,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      await addDoc(collection(db, COLLECTIONS.POSTULACIONES), postulacionData);

      const oportunidadRef = doc(db, COLLECTIONS.OPORTUNIDADES, oportunidad.id);
      const newCuposDisponibles = oportunidad.cuposDisponibles - 1;
      
      const updateData: any = {
        cuposDisponibles: increment(-1),
        updatedAt: serverTimestamp(),
      };

      if (newCuposDisponibles <= 0) {
        updateData.status = 'waitlist';
      }

      await updateDoc(oportunidadRef, updateData);

      setLoading(false);
      return { success: true };
    } catch (err: any) {
      console.error('Error creating postulacion:', err);
      setError(err.message || 'Error al crear la postulación');
      setLoading(false);
      return { success: false, error: err.message };
    }
  };

  return {
    crearPostulacion,
    loading,
    error,
  };
};
