import { useState, useEffect } from 'react';
import { collection, query, where, getDocs, doc, onSnapshot } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { Oportunidad, COLLECTIONS } from '../types';
import { useAuthStore } from '../../app/store/useAuthStore';

export const useFavoriteOportunidades = () => {
  const { user: authUser } = useAuthStore();
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [favoriteOportunidades, setFavoriteOportunidades] = useState<Oportunidad[]>([]);
  const [loading, setLoading] = useState(true);

  // Escuchar cambios en el perfil del usuario en tiempo real
  useEffect(() => {
    if (!authUser?.uid) {
      setFavoriteIds([]);
      setFavoriteOportunidades([]);
      setLoading(false);
      return;
    }

    const userRef = doc(db, COLLECTIONS.USERS, authUser.uid);
    const unsubscribe = onSnapshot(userRef, (snapshot) => {
      if (snapshot.exists()) {
        const userData = snapshot.data();
        setFavoriteIds(userData?.favoritos || []);
      } else {
        setFavoriteIds([]);
      }
    }, (error) => {
      console.error('Error listening to user favorites:', error);
      setFavoriteIds([]);
    });

    return () => unsubscribe();
  }, [authUser?.uid]);

  // Obtener las oportunidades favoritas cuando cambien los IDs
  useEffect(() => {
    const fetchFavorites = async () => {
      if (!favoriteIds || favoriteIds.length === 0) {
        setFavoriteOportunidades([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        
        // Firestore 'in' queries tienen un límite de 10 items
        const chunks = [];
        for (let i = 0; i < favoriteIds.length; i += 10) {
          chunks.push(favoriteIds.slice(i, i + 10));
        }

        const allOportunidades: Oportunidad[] = [];

        for (const chunk of chunks) {
          const q = query(
            collection(db, COLLECTIONS.OPORTUNIDADES),
            where('__name__', 'in', chunk)
          );

          const snapshot = await getDocs(q);
          const oportunidades = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
          })) as Oportunidad[];

          allOportunidades.push(...oportunidades);
        }

        setFavoriteOportunidades(allOportunidades);
      } catch (error) {
        console.error('Error fetching favorite oportunidades:', error);
        setFavoriteOportunidades([]);
      } finally {
        setLoading(false);
      }
    };

    fetchFavorites();
  }, [favoriteIds.length, favoriteIds.join(',')]); // Usar join para detectar cambios en el array

  return {
    favoriteOportunidades,
    loading,
    count: favoriteOportunidades.length,
  };
};
