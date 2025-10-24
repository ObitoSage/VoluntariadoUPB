import { useEffect, useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuthStore } from '../store/useAuthStore';

const MONTHLY_GOAL_KEY = 'USER_MONTHLY_GOAL';

export const useUserGoal = () => {
  const { user } = useAuthStore();
  const [monthlyGoal, setMonthlyGoal] = useState<number>(5);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadGoal = async () => {
      try {
        if (user?.uid) {
          const key = `${MONTHLY_GOAL_KEY}_${user.uid}`;
          const savedGoal = await AsyncStorage.getItem(key);
          
          if (savedGoal !== null) {
            setMonthlyGoal(parseInt(savedGoal, 10));
          }
        }
      } catch (error) {
        console.error('Error loading monthly goal:', error);
      } finally {
        setLoading(false);
      }
    };

    loadGoal();
  }, [user?.uid]);

  const updateMonthlyGoal = useCallback(async (newGoal: number) => {
    try {
      if (user?.uid) {
        const key = `${MONTHLY_GOAL_KEY}_${user.uid}`;
        await AsyncStorage.setItem(key, newGoal.toString());
        setMonthlyGoal(newGoal);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error saving monthly goal:', error);
      return false;
    }
  }, [user?.uid]);

  return {
    monthlyGoal,
    updateMonthlyGoal,
    loading,
  };
};
