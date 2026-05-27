import React, {
  createContext,
  useContext,
  useMemo,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from 'react';
import { Activity } from '@/types';
import { activitiesService } from '@/lib/supabase';
import { useAuth } from '../AuthContext';

interface ActivitiesContextType {
  activities: Activity[];
  loading: boolean;
  error: string | null;
  addActivity: (activity: Omit<Activity, 'id' | 'createdAt'>) => Promise<Activity | null>;
  updateActivity: (id: string, updates: Partial<Activity>) => Promise<void>;
  deleteActivity: (id: string) => Promise<void>;
  toggleActivityCompletion: (id: string) => Promise<void>;
  refresh: () => Promise<void>;
}

const ActivitiesContext = createContext<ActivitiesContextType | undefined>(undefined);

export const ActivitiesProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { profile } = useAuth();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch activities
  const fetchActivities = useCallback(async () => {
    if (!profile) {
      setActivities([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const { data, error: fetchError } = await activitiesService.getAll();

    if (fetchError) {
      setError(fetchError.message);
      setActivities([]);
    } else {
      setActivities(data || []);
    }

    setLoading(false);
  }, [profile]);

  useEffect(() => {
    fetchActivities();
  }, [fetchActivities]);

  // CRUD Operations
  const addActivity = useCallback(
    async (activity: Omit<Activity, 'id' | 'createdAt'>): Promise<Activity | null> => {
      if (!profile?.company_id) {
        setError('Usuário não tem empresa associada');
        return null;
      }

      const { data, error: addError } = await activitiesService.create(activity);

      if (addError) {
        setError(addError.message);
        return null;
      }

      if (data) {
        setActivities(prev => [...prev, data]);
      }

      return data;
    },
    [profile?.company_id]
  );

  const updateActivity = useCallback(async (id: string, updates: Partial<Activity>) => {
    const { error: updateError } = await activitiesService.update(id, updates);

    if (updateError) {
      setError(updateError.message);
      return;
    }

    setActivities(prev => prev.map(a => (a.id === id ? { ...a, ...updates } : a)));
  }, []);

  const deleteActivity = useCallback(async (id: string) => {
    const { error: deleteError } = await activitiesService.delete(id);

    if (deleteError) {
      setError(deleteError.message);
      return;
    }

    setActivities(prev => prev.filter(a => a.id !== id));
  }, []);

  const toggleActivityCompletion = useCallback(async (id: string) => {
    const activity = activities.find(a => a.id === id);
    if (!activity) return;

    const { error: toggleError } = await activitiesService.toggleCompletion(id);

    if (toggleError) {
      setError(toggleError.message);
      return;
    }

    setActivities(prev =>
      prev.map(a =>
        a.id === id
          ? {
              ...a,
              completed: !a.completed,
              completedAt: !a.completed ? new Date().toISOString() : undefined,
            }
          : a
      )
    );
  }, [activities]);

  const value = useMemo(
    () => ({
      activities,
      loading,
      error,
      addActivity,
      updateActivity,
      deleteActivity,
      toggleActivityCompletion,
      refresh: fetchActivities,
    }),
    [
      activities,
      loading,
      error,
      addActivity,
      updateActivity,
      deleteActivity,
      toggleActivityCompletion,
      fetchActivities,
    ]
  );

  return <ActivitiesContext.Provider value={value}>{children}</ActivitiesContext.Provider>;
};

export const useActivities = () => {
  const context = useContext(ActivitiesContext);
  if (context === undefined) {
    throw new Error('useActivities must be used within a ActivitiesProvider');
  }
  return context;
};
