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
  status: 'pending' | 'accepted' | 'rejected';
  motivacion: string;
  disponibilidad: string;
  telefono?: string;
  applicationDate: Date;
  createdAt: Date;
  updatedAt: Date;
  estudianteNombre?: string;
  estudianteEmail?: string;
  estudianteFoto?: string;
}

export const usePostulaciones = () => {
  const { user } = useAuthStore();
  const { canViewAllApplications } = useRolePermissions();
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
    
    const q = canViewAllApplications()
      ? query(collection(db, COLLECTIONS.POSTULACIONES))
      : query(
          collection(db, COLLECTIONS.POSTULACIONES),
          where('estudianteId', '==', user.uid)
        );

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

    const unsubscribe = onSnapshot(
      q,
      async (snapshot) => {
        const postulacionesPromises = snapshot.docs.map(async (doc) => {
          const data = doc.data();
          
          let estudianteData = {};
          if (canViewAllApplications) {
            const estudianteDoc = await getDoc(doc(db, COLLECTIONS.USUARIOS, data.estudianteId));
            if (estudianteDoc.exists()) {
              estudianteData = {
                estudianteNombre: estudianteDoc.data().displayName,
                estudianteEmail: estudianteDoc.data().email,
                estudianteFoto: estudianteDoc.data().photoURL,
              };
            }
          }

          return {
            id: doc.id,
            ...data,
            ...estudianteData,
            applicationDate: data.applicationDate?.toDate?.() || new Date(),
            createdAt: data.createdAt?.toDate?.() || new Date(),
            updatedAt: data.updatedAt?.toDate?.() || new Date(),
          } as Postulacion;
        });

        const postulacionesData = await Promise.all(postulacionesPromises);

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

  const updatePostulacionStatus = async (postulacionId: string, newStatus: 'accepted' | 'rejected' | 'pending') => {
    try {
      await updateDoc(doc(db, COLLECTIONS.POSTULACIONES, postulacionId), {
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
