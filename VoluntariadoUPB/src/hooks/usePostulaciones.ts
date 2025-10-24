import { useEffect, useState } from 'react';
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  orderBy,
  getDocs,
} from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useAuthStore } from '../store/useAuthStore';
import { COLLECTIONS } from '../types';

export interface Postulacion {
  id: string;
  estudianteId: string;
  oportunidadId: string;
  titulo: string;
  organizacion: string;
  descripcion: string;
  location: string;
  status: 'pending' | 'accepted' | 'rejected';
  motivacion: string;
  disponibilidad: string;
  telefono?: string;
  applicationDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

export const usePostulaciones = () => {
  const { user } = useAuthStore();
  const [postulaciones, setPostulaciones] = useState<Postulacion[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (!user?.uid) {
      setPostulaciones([]);
      return;
    }

    setLoading(true);
    
    // Query sin orderBy para evitar necesidad de índice compuesto
    const q = query(
      collection(db, COLLECTIONS.POSTULACIONES),
      where('estudianteId', '==', user.uid)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const postulacionesData = snapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            applicationDate: data.applicationDate?.toDate?.() || new Date(),
            createdAt: data.createdAt?.toDate?.() || new Date(),
            updatedAt: data.updatedAt?.toDate?.() || new Date(),
          } as Postulacion;
        });

        // Ordenar en memoria por fecha de creación (más reciente primero)
        postulacionesData.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

        setPostulaciones(postulacionesData);
        setLoading(false);
        setError(null);
      },
      (err) => {
        console.error('Error fetching postulaciones:', err);
        setError('Error al cargar las postulaciones');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user?.uid]);

  const refresh = async () => {
    if (!user?.uid) return;
    
    setRefreshing(true);
    try {
      // Query sin orderBy para evitar necesidad de índice compuesto
      const q = query(
        collection(db, COLLECTIONS.POSTULACIONES),
        where('estudianteId', '==', user.uid)
      );
      
      const snapshot = await getDocs(q);
      const postulacionesData = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          applicationDate: data.applicationDate?.toDate?.() || new Date(),
          createdAt: data.createdAt?.toDate?.() || new Date(),
          updatedAt: data.updatedAt?.toDate?.() || new Date(),
        } as Postulacion;
      });

      // Ordenar en memoria por fecha de creación (más reciente primero)
      postulacionesData.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

      setPostulaciones(postulacionesData);
      setError(null);
    } catch (err) {
      console.error('Error refreshing postulaciones:', err);
      setError('Error al actualizar');
    } finally {
      setRefreshing(false);
    }
  };

  return {
    postulaciones,
    loading,
    error,
    refreshing,
    refresh,
  };
};
