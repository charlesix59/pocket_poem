import * as SQLite from 'expo-sqlite';
import { useCallback, useEffect, useState } from 'react';
import {
  Poem,
  getAllAuthors,
  getAllDynasties,
  getAllPoems,
  getDatabaseStatistics,
  getPoemById,
  getPoemCountByAuthor,
  getPoemCountByDynasty,
  getPoemsByAuthor,
  getPoemsByDynasty,
  getRandomPoem,
  getRandomPoems,
  getSearchResultCount,
  searchPoems,
  getHotPoems,
  getHotPoemCount,
} from '../database/queries';

/**
 * 获取所有诗词（带分页）的 Hook
 */
export function useAllPoems(db: SQLite.SQLiteDatabase | null, limit: number = 20) {
  const [poems, setPoems] = useState<Poem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchPoems = useCallback(
    async (offset: number = 0) => {
      if (!db) return;
      setLoading(true);
      setError(null);
      try {
        const data = await getAllPoems(db, limit, offset);
        setPoems(data);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('加载诗词失败'));
      } finally {
        setLoading(false);
      }
    },
    [db, limit],
  );

  return { poems, loading, error, fetchPoems };
}

/**
 * 获取单首诗词的 Hook
 */
export function usePoem(db: SQLite.SQLiteDatabase | null, id: number | null) {
  const [poem, setPoem] = useState<Poem | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!db || id === null) return;

    async function fetch() {
      setLoading(true);
      setError(null);
      try {
        const data = await getPoemById(db!, id!);
        setPoem(data);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('加载诗词失败'));
      } finally {
        setLoading(false);
      }
    }

    fetch();
  }, [db, id]);

  return { poem, loading, error };
}

/**
 * 搜索诗词的 Hook
 */
export function useSearchPoems(db: SQLite.SQLiteDatabase | null, limit: number = 20) {
  const [poems, setPoems] = useState<Poem[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const search = useCallback(
    async (keyword: string, offset: number = 0) => {
      if (!db || !keyword.trim()) {
        setPoems([]);
        setTotalCount(0);
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const [data, count] = await Promise.all([
          searchPoems(db, keyword, limit, offset),
          getSearchResultCount(db, keyword),
        ]);
        setPoems(data);
        setTotalCount(count);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('搜索失败'));
      } finally {
        setLoading(false);
      }
    },
    [db, limit],
  );

  return { poems, totalCount, loading, error, search };
}

/**
 * 按作者获取诗词的 Hook
 */
export function usePoemsByAuthor(
  db: SQLite.SQLiteDatabase | null,
  author: string | null,
  limit: number = 20,
) {
  const [poems, setPoems] = useState<Poem[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchByAuthor = useCallback(
    async (offset: number = 0) => {
      if (!db || !author) return;

      setLoading(true);
      setError(null);
      try {
        const [data, count] = await Promise.all([
          getPoemsByAuthor(db, author, limit, offset),
          getPoemCountByAuthor(db, author),
        ]);
        setPoems(data);
        setTotalCount(count);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('加载诗词失败'));
      } finally {
        setLoading(false);
      }
    },
    [db, author, limit],
  );

  useEffect(() => {
    if (author) {
      fetchByAuthor(0);
    }
  }, [author, db]);

  return { poems, totalCount, loading, error, fetchByAuthor };
}

/**
 * 按朝代获取诗词的 Hook
 */
export function usePoemsByDynasty(
  db: SQLite.SQLiteDatabase | null,
  dynasty: string | null,
  limit: number = 20,
) {
  const [poems, setPoems] = useState<Poem[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchByDynasty = useCallback(
    async (offset: number = 0) => {
      if (!db || !dynasty) return;

      setLoading(true);
      setError(null);
      try {
        const [data, count] = await Promise.all([
          getPoemsByDynasty(db, dynasty, limit, offset),
          getPoemCountByDynasty(db, dynasty),
        ]);
        setPoems(data);
        setTotalCount(count);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('加载诗词失败'));
      } finally {
        setLoading(false);
      }
    },
    [db, dynasty, limit],
  );

  useEffect(() => {
    if (dynasty) {
      fetchByDynasty(0);
    }
  }, [dynasty, db]);

  return { poems, totalCount, loading, error, fetchByDynasty };
}

/**
 * 获取所有作者列表的 Hook
 */
export function useAllAuthors(db: SQLite.SQLiteDatabase | null) {
  const [authors, setAuthors] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!db) return;

    async function fetch() {
      setLoading(true);
      setError(null);
      try {
        const data = await getAllAuthors(db!);
        setAuthors(data);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('加载作者列表失败'));
      } finally {
        setLoading(false);
      }
    }

    fetch();
  }, [db]);

  return { authors, loading, error };
}

/**
 * 获取所有朝代列表的 Hook
 */
export function useAllDynasties(db: SQLite.SQLiteDatabase | null) {
  const [dynasties, setDynasties] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!db) return;

    async function fetch() {
      setLoading(true);
      setError(null);
      try {
        const data = await getAllDynasties(db!);
        setDynasties(data);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('加载朝代列表失败'));
      } finally {
        setLoading(false);
      }
    }

    fetch();
  }, [db]);

  return { dynasties, loading, error };
}

/**
 * 获取随机诗词的 Hook
 */
export function useRandomPoem(db: SQLite.SQLiteDatabase | null) {
  const [poem, setPoem] = useState<Poem | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchRandomPoem = useCallback(async () => {
    if (!db) return;

    setLoading(true);
    setError(null);
    try {
      const data = await getRandomPoem(db);
      setPoem(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('加载随机诗词失败'));
    } finally {
      setLoading(false);
    }
  }, [db]);

  useEffect(() => {
    fetchRandomPoem();
  }, [db]);

  return { poem, loading, error, fetchRandomPoem };
}

/**
 * 获取多首随机诗词的 Hook
 */
export function useRandomPoems(db: SQLite.SQLiteDatabase | null, count: number = 5) {
  const [poems, setPoems] = useState<Poem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchRandomPoems = useCallback(async () => {
    if (!db) return;

    setLoading(true);
    setError(null);
    try {
      const data = await getRandomPoems(db, count);
      setPoems(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('加载随机诗词失败'));
    } finally {
      setLoading(false);
    }
  }, [db, count]);

  useEffect(() => {
    fetchRandomPoems();
  }, [db, count]);

  return { poems, loading, error, fetchRandomPoems };
}

/**
 * 获取数据库统计信息的 Hook
 */
export function useDatabaseStatistics(db: SQLite.SQLiteDatabase | null) {
  const [stats, setStats] = useState<{
    total: number;
    authors: number;
    dynasties: number;
  }>({ total: 0, authors: 0, dynasties: 0 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!db) return;

    async function fetch() {
      setLoading(true);
      setError(null);
      try {
        const data = await getDatabaseStatistics(db!);
        setStats(data);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('加载统计信息失败'));
      } finally {
        setLoading(false);
      }
    }

    fetch();
  }, [db]);

  return { stats, loading, error };
}

/**
 * 获取热门诗词（带分页）的 Hook
 */
export function useHotPoems(db: SQLite.SQLiteDatabase | null, limit: number = 20) {
  const [poems, setPoems] = useState<Poem[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchHotPoems = useCallback(
    async (offset: number = 0) => {
      if (!db) return;
      setLoading(true);
      setError(null);
      try {
        if (offset === 0) {
          // 首次加载时，同时获取数据和总数
          const [data, count] = await Promise.all([
            getHotPoems(db, limit, offset),
            getHotPoemCount(db),
          ]);
          setPoems(data);
          setTotalCount(count);
        } else {
          // 分页加载时，只获取数据并追加
          const data = await getHotPoems(db, limit, offset);
          setPoems((prevPoems) => [...prevPoems, ...data]);
        }
      } catch (err) {
        setError(err instanceof Error ? err : new Error('加载热门诗词失败'));
      } finally {
        setLoading(false);
      }
    },
    [db, limit],
  );

  useEffect(() => {
    // 初始加载一次数据
    if (db) {
      fetchHotPoems(0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [db, limit]); // 仅依赖 db 和 limit，不依赖 fetchHotPoems，避免无限循环

  return { poems, totalCount, loading, error, fetchHotPoems };
}
