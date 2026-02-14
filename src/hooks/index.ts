/**
 * 导出所有 hooks
 * 方便从 @hooks 或 @/hooks 导入
 */

export {
  useAllPoems,
  usePoem,
  useSearchPoems,
  usePoemsByAuthor,
  usePoemsByDynasty,
  useAllAuthors,
  useAllDynasties,
  useRandomPoem,
  useRandomPoems,
  useDatabaseStatistics,
} from './usePoems';
