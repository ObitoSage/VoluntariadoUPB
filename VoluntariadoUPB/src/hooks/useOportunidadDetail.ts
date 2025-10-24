import { useEffect, useState } from 'react';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useAuthStore } from '../store/useAuthStore';
import { Oportunidad, COLLECTIONS } from '../types';

export const useOportunidadDetail = (oportunidadId: string) => {
  const [oportunidad, setOportunidad] = useState<Oportunidad | null>(null);
  const [yaPostulado, setYaPostulado] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const { user } = useAuthStore();

  useEffect(() => {
    const fetchOportunidad = async () => {
      if (!oportunidadId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        
        // Obtener la oportunidad
        const oportunidadRef = doc(db, COLLECTIONS.OPORTUNIDADES, oportunidadId);
        const oportunidadSnap = await getDoc(oportunidadRef);

        if (oportunidadSnap.exists()) {
          const oportunidadData = {
            id: oportunidadSnap.id,
            ...oportunidadSnap.data(),
          } as Oportunidad;
          
          setOportunidad(oportunidadData);

          // Verificar si el usuario ya se postuló
          if (user?.uid) {
            const postulacionesRef = collection(db, COLLECTIONS.POSTULACIONES);
            const q = query(
              postulacionesRef,
              where('oportunidadId', '==', oportunidadId),
              where('estudianteId', '==', user.uid)
            );
            
            const postulacionesSnap = await getDocs(q);
            setYaPostulado(!postulacionesSnap.empty);
          }
        } else {
          setError('Oportunidad no encontrada');
        }
      } catch (err) {
        console.error('Error fetching oportunidad:', err);
        setError('Error al cargar la oportunidad');
      } finally {
        setLoading(false);
      }
    };

    fetchOportunidad();
  }, [oportunidadId, user?.uid]);

  return {
    oportunidad,
    yaPostulado,
    loading,
    error,
  };
};
