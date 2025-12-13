import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';

export interface Task {
  id: string;
  title: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  dueDate?: Date;
  createdDate: Date;
  reminder?: Date;
  recurring?: 'none' | 'daily' | 'weekly' | 'monthly';
  recurringTime?: Date;
}

export interface List {
  id: string;
  title: string;
  color: string;
  tasks: Task[];
  isHome?: boolean;
}

interface ListsContextType {
  lists: List[];
  setLists: (lists: List[]) => void;
  activeListIndex: number;
  setActiveListIndex: (index: number) => void;
}

export const ListsContext = createContext<ListsContextType | undefined>(undefined);

/** Provider component that manages user lists and tasks state */
export function ListsProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [lists, setLists] = useState<List[]>([]);
  const [activeListIndex, setActiveListIndex] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (user?.uid) {
      loadLists(user.uid);
    } else {
      setLists([]);
      setIsLoaded(true);
    }
  }, [user?.uid]);

  useEffect(() => {
    if (isLoaded && user?.uid) {
      saveLists(lists, user.uid);
    }
  }, [lists, isLoaded, user?.uid]);

  /** Loads user's lists from local storage and converts dates */
  const loadLists = async (userId: string) => {
    try {
      const storageKey = `user_lists_${userId}`;
      const stored = await AsyncStorage.getItem(storageKey);
      if (stored) {
        const parsedLists = JSON.parse(stored);
        const listsWithDates = parsedLists.map((list: any) => ({
          ...list,
          tasks: list.tasks.map((task: any) => ({
            ...task,
            dueDate: task.dueDate ? new Date(task.dueDate) : undefined,
            createdDate: new Date(task.createdDate),
            reminder: task.reminder ? new Date(task.reminder) : undefined,
            recurringTime: task.recurringTime ? new Date(task.recurringTime) : undefined,
          })),
        }));
        setLists(listsWithDates);
      } else {
        setLists([]);
      }
    } catch (error) {
      console.error('Error loading lists:', error);
      setLists([]);
    } finally {
      setIsLoaded(true);
    }
  };

  /** Saves user's lists to local storage */
  const saveLists = async (listsToSave: List[], userId: string) => {
    try {
      const storageKey = `user_lists_${userId}`;
      await AsyncStorage.setItem(storageKey, JSON.stringify(listsToSave));
    } catch (error) {
      console.error('Error saving lists:', error);
    }
  };

  return (
    <ListsContext.Provider value={{ lists, setLists, activeListIndex, setActiveListIndex }}>
      {children}
    </ListsContext.Provider>
  );
}

/** Hook to access lists context */
export function useLists() {
  const context = React.useContext(ListsContext);
  if (!context) {
    throw new Error('useLists must be used within a ListsProvider');
  }
  return context;
}
