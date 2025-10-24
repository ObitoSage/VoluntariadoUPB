import { useEffect, useState } from 'react';
import { 
  collection, 
  query, 
  where, 
  getDocs,
  orderBy,
  limit,
} from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useAuthStore } from '../store/useAuthStore';
import { COLLECTIONS } from '../types';

export interface NextActivity {
  id: string;
  titulo: string;
  organizacion: string;
  fecha: Date;
  daysUntil: number;
}

export interface UserStats {
  completedActivities: number;
  monthlyGoal: number;
  nextActivity: NextActivity | null;
  loading: boolean;
  error: string | null;
}

export const useUserStats = (userMonthlyGoal?: number) => {
  const { user } = useAuthStore();
  const [stats, setStats] = useState<UserStats>({
    completedActivities: 0,
    monthlyGoal: userMonthlyGoal || 5,
    nextActivity: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    if (!user?.uid) {
      setStats({
        completedActivities: 0,
        monthlyGoal: userMonthlyGoal || 5,
        nextActivity: null,
        loading: false,
        error: null,
      });
      return;
    }

    const fetchUserStats = async () => {
      try {
        setStats(prev => ({ ...prev, loading: true, error: null }));

        const now = new Date();
        const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        
        const postulacionesRef = collection(db, COLLECTIONS.POSTULACIONES);
        const q = query(
          postulacionesRef,
          where('estudianteId', '==', user.uid),
          where('estado', '==', 'accepted')
        );
        
        const postulacionesSnap = await getDocs(q);
        
        const postulacionesDelMes = postulacionesSnap.docs.filter(doc => {
          const data = doc.data();
          const createdAt = data.createdAt?.toDate?.() || new Date(0);
          return createdAt >= firstDayOfMonth;
        });

        let nextActivity: NextActivity | null = null;

        try {
          const oportunidadesRef = collection(db, COLLECTIONS.OPORTUNIDADES);
          const oportunidadesQuery = query(
            oportunidadesRef,
            where('status', '==', 'open')
          );
          
          const oportunidadesSnap = await getDocs(oportunidadesQuery);
          
          const oportunidadesFuturas = oportunidadesSnap.docs
            .map(doc => {
              const data = doc.data();
              const deadline = data.deadline?.toDate?.() || new Date(0);
              
              if (deadline > now) {
                return {
                  id: doc.id,
                  titulo: data.titulo || 'Sin título',
                  organizacion: data.organizacion || 'Sin organización',
                  fecha: deadline,
                  daysUntil: Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)),
                };
              }
              return null;
            })
            .filter(Boolean) as NextActivity[];
          
          if (oportunidadesFuturas.length > 0) {
            nextActivity = oportunidadesFuturas.reduce((closest, current) => 
              current.daysUntil < closest.daysUntil ? current : closest
            );
          }
        } catch (err) {
          console.error('Error fetching next activity:', err);
        }

        setStats({
          completedActivities: postulacionesDelMes.length,
          monthlyGoal: userMonthlyGoal || 5,
          nextActivity,
          loading: false,
          error: null,
        });

      } catch (err) {
        console.error('Error fetching user stats:', err);
        setStats(prev => ({
          ...prev,
          loading: false,
          error: 'Error al cargar estadísticas',
        }));
      }
    };

    fetchUserStats();
  }, [user?.uid, userMonthlyGoal]);

  return stats;
};
