import { useEffect, useState } from 'react';
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  orderBy,
  getDocs,
  QueryConstraint 
} from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useOportunidadesStore } from '../store/oportunidadesStore';
import { Oportunidad, COLLECTIONS } from '../types';

export const useOportunidades = () => {
  const { 
    oportunidades, 
    filtros, 
    loading, 
    error, 
    setOportunidades, 
    setLoading, 
    setError 
  } = useOportunidadesStore();
  
  const [refreshing, setRefreshing] = useState(false);
  const [allOportunidades, setAllOportunidades] = useState<Oportunidad[]>([]);

  useEffect(() => {
    setLoading(true);

    const constraints: QueryConstraint[] = [
      orderBy('createdAt', 'desc')
    ];

    if (filtros.busqueda) {
      const searchLower = filtros.busqueda.toLowerCase();
      constraints.push(
        where('titleLower', '>=', searchLower),
        where('titleLower', '<=', searchLower + '\uf8ff')
      );
    }

    const q = query(collection(db, COLLECTIONS.OPORTUNIDADES), ...constraints);

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const oportunidadesData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Oportunidad[];

        // Guardar todas las oportunidades sin filtrar
        setAllOportunidades(oportunidadesData);
        
        // Aplicar filtros y actualizar store
        const filtered = applyClientFilters(oportunidadesData, filtros);
        setOportunidades(filtered);
        setLoading(false);
      },
      (err) => {
        console.error('Error fetching oportunidades:', err);
        setError('Error al cargar las oportunidades');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [filtros.busqueda]);

  // Aplicar filtros cuando cambian, usando TODAS las oportunidades
  useEffect(() => {
    if (allOportunidades.length > 0) {
      const filtered = applyClientFilters(allOportunidades, filtros);
      setOportunidades(filtered);
    }
  }, [filtros.campus, filtros.categoria, filtros.modalidad, filtros.status, filtros.habilidades, allOportunidades]);

  const refresh = async () => {
    setRefreshing(true);
    try {
      const constraints: QueryConstraint[] = [orderBy('createdAt', 'desc')];
      const q = query(collection(db, COLLECTIONS.OPORTUNIDADES), ...constraints);
      const snapshot = await getDocs(q);
      
      const oportunidadesData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Oportunidad[];

      // Guardar todas las oportunidades
      setAllOportunidades(oportunidadesData);
      
      // Aplicar filtros
      const filtered = applyClientFilters(oportunidadesData, filtros);
      setOportunidades(filtered);
    } catch (err) {
      console.error('Error refreshing oportunidades:', err);
      setError('Error al actualizar');
    } finally {
      setRefreshing(false);
    }
  };

  return {
    oportunidades,
    loading,
    error,
    refreshing,
    refresh,
  };
};

function applyClientFilters(oportunidades: Oportunidad[], filtros: any): Oportunidad[] {
  return oportunidades.filter((opp) => {
    if (filtros.campus.length > 0 && !filtros.campus.includes(opp.campus)) {
      return false;
    }

    if (filtros.categoria.length > 0 && !filtros.categoria.includes(opp.categoria)) {
      return false;
    }

    if (filtros.modalidad && opp.modalidad !== filtros.modalidad) {
      return false;
    }

    if (filtros.status.length > 0 && !filtros.status.includes(opp.status)) {
      return false;
    }

    if (filtros.habilidades.length > 0) {
      const hasAnySkill = filtros.habilidades.some((skill: string) =>
        opp.habilidades.includes(skill)
      );
      if (!hasAnySkill) return false;
    }

    return true;
  });
}
