import React, { createContext, useState } from 'react';

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

export function ListsProvider({ children }: { children: React.ReactNode }) {
  const [lists, setLists] = useState<List[]>([
    { id: '1', title: 'Work', color: '#4A90E2', isHome: true, tasks: [
      { id: '1-1', title: 'Finish project report', completed: false, priority: 'high', createdDate: new Date(), recurring: 'none' },
      { id: '1-2', title: 'Team meeting', completed: true, priority: 'medium', createdDate: new Date(), recurring: 'none' },
    ] },
    { id: '2', title: 'Shopping', color: '#50C878', isHome: false, tasks: [
      { id: '2-1', title: 'Milk', completed: false, priority: 'low', createdDate: new Date(), recurring: 'weekly' },
    ] },
  ]);
  
  const [activeListIndex, setActiveListIndex] = useState(0);

  return (
    <ListsContext.Provider value={{ lists, setLists, activeListIndex, setActiveListIndex }}>
      {children}
    </ListsContext.Provider>
  );
}

export function useLists() {
  const context = React.useContext(ListsContext);
  if (!context) {
    throw new Error('useLists must be used within a ListsProvider');
  }
  return context;
}
