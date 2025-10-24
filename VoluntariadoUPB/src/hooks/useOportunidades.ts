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

  useEffect(() => {
    setLoading(true);
    
    const constraints: QueryConstraint[] = [
      orderBy('createdAt', 'desc')
    ];

    // Filtrar por búsqueda si existe
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

        // Aplicar filtros del lado del cliente
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
  }, [filtros.busqueda]); // Solo recargar cuando cambie la búsqueda

  // Aplicar filtros cada vez que cambien
  useEffect(() => {
    if (oportunidades.length > 0) {
      const filtered = applyClientFilters(oportunidades, filtros);
      // Solo actualizar si hay cambios reales
      if (JSON.stringify(filtered) !== JSON.stringify(oportunidades)) {
        setOportunidades(filtered);
      }
    }
  }, [filtros.campus, filtros.categoria, filtros.modalidad, filtros.status, filtros.habilidades]);

  const refresh = async () => {
    setRefreshing(true);
    try {
      const constraints: QueryConstraint[] = [orderBy('createdAt', 'desc')];
      const q = query(collection(db, COLLECTIONS.OPORTUNIDADES), ...constraints);
      const snapshot = await getDocs(q);
      
      let oportunidadesData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Oportunidad[];

      oportunidadesData = applyClientFilters(oportunidadesData, filtros);
      setOportunidades(oportunidadesData);
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

// Función auxiliar para aplicar filtros del lado del cliente
function applyClientFilters(oportunidades: Oportunidad[], filtros: any): Oportunidad[] {
  return oportunidades.filter((opp) => {
    // Filtrar por campus
    if (filtros.campus.length > 0 && !filtros.campus.includes(opp.campus)) {
      return false;
    }

    // Filtrar por categoría
    if (filtros.categoria.length > 0 && !filtros.categoria.includes(opp.categoria)) {
      return false;
    }

    // Filtrar por modalidad
    if (filtros.modalidad && opp.modalidad !== filtros.modalidad) {
      return false;
    }

    // Filtrar por estado
    if (filtros.status.length > 0 && !filtros.status.includes(opp.status)) {
      return false;
    }

    // Filtrar por habilidades
    if (filtros.habilidades.length > 0) {
      const hasAnySkill = filtros.habilidades.some((skill: string) =>
        opp.habilidades.includes(skill)
      );
      if (!hasAnySkill) return false;
    }

    return true;
  });
}
