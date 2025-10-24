import { useEffect, useState } from 'react';
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  orderBy,
  getDocs,
  getDoc,
  doc,
  DocumentData,
  updateDoc,
  serverTimestamp,
  FirestoreError
} from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useAuthStore } from '../store/useAuthStore';
import { useRolePermissions } from './useRolePermissions';
import { COLLECTIONS } from '../types';

interface UserData {
  displayName: string;
  email: string;
  photoURL?: string;
}

export interface Postulacion {
  id: string;
  estudianteId: string;
  oportunidadId: string;
  titulo: string;
  organizacion: string;
  descripcion: string;
  location: string;
  status: 'pending' | 'accepted' | 'rejected' | 'waitlisted';
  motivacion: string;
  disponibilidad: string;
  telefono?: string;
  applicationDate: Date;
  createdAt: Date;
  updatedAt: Date;
  // Campos adicionales cuando se ve como admin/organizador
  estudianteNombre?: string;
  estudianteEmail?: string;
  estudianteFoto?: string;
}

export const usePostulaciones = () => {
  const { user } = useAuthStore();
  const { canViewAllApplications } = useRolePermissions();
  // Resolve permission once to avoid function identity changes causing repeated effect runs
  const canViewAll = canViewAllApplications ? canViewAllApplications() : false;
  const [postulaciones, setPostulaciones] = useState<Postulacion[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchUserData = async (userId: string) => {
    if (!userId) {
      console.error('User ID is required');
      return null;
    }

    try {
      const userRef = doc(db, COLLECTIONS.USERS, userId);
      const userSnap = await getDoc(userRef);
      
      if (userSnap.exists()) {
        const userData = userSnap.data() as UserData;
        return {
          estudianteNombre: userData.displayName || 'Sin nombre',
          estudianteEmail: userData.email || 'No disponible',
          estudianteFoto: userData.photoURL,
        };
      }
      return null;
    } catch (error) {
      console.error('Error fetching user data:', error);
      return null;
    }
  };

  useEffect(() => {
    if (!user?.uid) {
      setPostulaciones([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const postulacionesRef = collection(db, COLLECTIONS.POSTULACIONES);
      const q = canViewAll
        ? query(postulacionesRef)
        : query(postulacionesRef, where('estudianteId', '==', user.uid));

      const unsubscribe = onSnapshot(
        q,
        async (snapshot) => {
          try {
            const postulacionesPromises = snapshot.docs.map(async (docSnap) => {
              const data = docSnap.data();
              
              let estudianteData = {};
              if (canViewAll) {
                const userData = await fetchUserData(data.estudianteId);
                if (userData) {
                  estudianteData = userData;
                }
              }

              const applicationDate = data.applicationDate?.toDate?.() || new Date();
              const createdAt = data.createdAt?.toDate?.() || new Date();
              const updatedAt = data.updatedAt?.toDate?.() || new Date();

              return {
                id: docSnap.id,
                ...data,
                ...estudianteData,
                applicationDate,
                createdAt,
                updatedAt,
                status: data.status || 'pending',
              } as Postulacion;
            });

            const postulacionesData = await Promise.all(postulacionesPromises);
            postulacionesData.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

            setPostulaciones(postulacionesData);
            setLoading(false);
            setError(null);
          } catch (err) {
            console.error('Error processing postulaciones:', err);
            setError('Error al procesar las postulaciones');
            setLoading(false);
          }
        },
        (err: FirestoreError) => {
          console.error('Error fetching postulaciones:', err);
          setError('Error al cargar las postulaciones');
          setLoading(false);
        }
      );

      return () => unsubscribe();
    } catch (err) {
      console.error('Error setting up postulaciones listener:', err);
      setError('Error al configurar la escucha de postulaciones');
      setLoading(false);
    }
  }, [user?.uid, canViewAll]);

  const refresh = async () => {
    if (!user?.uid) return;
    
    setRefreshing(true);
    try {
      const postulacionesRef = collection(db, COLLECTIONS.POSTULACIONES);
      const q = canViewAll
        ? query(postulacionesRef)
        : query(postulacionesRef, where('estudianteId', '==', user.uid));
      
      const snapshot = await getDocs(q);
      const postulacionesPromises = snapshot.docs.map(async (docSnap) => {
        const data = docSnap.data();
        let estudianteData = {};
        
        if (canViewAllApplications()) {
          const userData = await fetchUserData(data.estudianteId);
          if (userData) {
            estudianteData = userData;
          }
        }

        return {
          id: docSnap.id,
          ...data,
          ...estudianteData,
          applicationDate: data.applicationDate?.toDate?.() || new Date(),
          createdAt: data.createdAt?.toDate?.() || new Date(),
          updatedAt: data.updatedAt?.toDate?.() || new Date(),
          status: data.status || 'pending',
        } as Postulacion;
      });

      const postulacionesData = await Promise.all(postulacionesPromises);
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

  const updatePostulacionStatus = async (postulacionId: string, newStatus: 'accepted' | 'rejected' | 'pending' | 'waitlisted') => {
    try {
      const postulacionRef = doc(db, COLLECTIONS.POSTULACIONES, postulacionId);
      await updateDoc(postulacionRef, {
        status: newStatus,
        updatedAt: serverTimestamp(),
      });
      return true;
    } catch (error) {
      console.error('Error updating postulacion status:', error);
      return false;
    }
  };

  return {
    postulaciones,
    loading,
    error,
    refreshing,
    refresh,
    updatePostulacionStatus,
  };
};