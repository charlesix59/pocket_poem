/**
 * 共享类型定义
 */

export type { Poem } from '../database/queries';

export interface QueryResult<T> {
  data: T;
  loading: boolean;
  error: Error | null;
}

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  loading: boolean;
  error: Error | null;
}

export interface DatabaseStatistics {
  total: number;
  authors: number;
  dynasties: number;
}
