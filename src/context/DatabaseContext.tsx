import React, { createContext, useContext, useEffect, useState } from 'react';
import * as SQLite from 'expo-sqlite';
import { getDatabase } from '../database/initialization';

interface DatabaseContextType {
  db: SQLite.SQLiteDatabase | null;
  isReady: boolean;
  error: Error | null;
}

const DatabaseContext = createContext<DatabaseContextType>({
  db: null,
  isReady: false,
  error: null,
});

export function DatabaseProvider({ children }: { children: React.ReactNode }) {
  const [db, setDb] = useState<SQLite.SQLiteDatabase | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function initDb() {
      try {
        const database = await getDatabase();
        setDb(database);
        setIsReady(true);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('数据库初始化失败'));
        setIsReady(true);
      }
    }

    initDb();
  }, []);

  return (
    <DatabaseContext.Provider value={{ db, isReady, error }}>
      {children}
    </DatabaseContext.Provider>
  );
}

export function useDatabase() {
  const context = useContext(DatabaseContext);
  if (!context) {
    throw new Error('useDatabase 必须在 DatabaseProvider 内部使用');
  }
  return context;
}
