/**
 * 诗词服务层 - Pure Functions 风格的 API
 * 可以在任何地方使用，包括非 React 组件
 */

import * as SQLite from 'expo-sqlite';
import * as Queries from '../database/queries';

/**
 * 诗词服务类 - 包装所有查询操作
 */
export class PoemService {
  constructor(private db: SQLite.SQLiteDatabase) {}

  /**
   * 获取单首诗词
   */
  async getPoem(id: number) {
    return Queries.getPoemById(this.db, id);
  }

  /**
   * 获取所有诗词（带分页）
   */
  async getAllPoems(limit: number = 20, offset: number = 0) {
    return Queries.getAllPoems(this.db, limit, offset);
  }

  /**
   * 搜索诗词
   */
  async search(keyword: string, limit: number = 20, offset: number = 0) {
    return Queries.searchPoems(this.db, keyword, limit, offset);
  }

  /**
   * 按作者获取诗词
   */
  async getPoemsByAuthor(author: string, limit: number = 20, offset: number = 0) {
    return Queries.getPoemsByAuthor(this.db, author, limit, offset);
  }

  /**
   * 按朝代获取诗词
   */
  async getPoemsByDynasty(dynasty: string, limit: number = 20, offset: number = 0) {
    return Queries.getPoemsByDynasty(this.db, dynasty, limit, offset);
  }

  /**
   * 获取所有作者列表
   */
  async getAllAuthors() {
    return Queries.getAllAuthors(this.db);
  }

  /**
   * 获取所有朝代列表
   */
  async getAllDynasties() {
    return Queries.getAllDynasties(this.db);
  }

  /**
   * 获取诗词总数
   */
  async getTotalCount() {
    return Queries.getTotalPoemCount(this.db);
  }

  /**
   * 按作者获取诗词总数
   */
  async getCountByAuthor(author: string) {
    return Queries.getPoemCountByAuthor(this.db, author);
  }

  /**
   * 按朝代获取诗词总数
   */
  async getCountByDynasty(dynasty: string) {
    return Queries.getPoemCountByDynasty(this.db, dynasty);
  }

  /**
   * 获取搜索结果总数
   */
  async getSearchCount(keyword: string) {
    return Queries.getSearchResultCount(this.db, keyword);
  }

  /**
   * 获取随机诗词
   */
  async getRandomPoem() {
    return Queries.getRandomPoem(this.db);
  }

  /**
   * 获取多首随机诗词
   */
  async getRandomPoems(count: number = 5) {
    return Queries.getRandomPoems(this.db, count);
  }

  /**
   * 获取数据库统计信息
   */
  async getStatistics() {
    return Queries.getDatabaseStatistics(this.db);
  }
}

/**
 * Pure Function 风格的 API - 如果你更喜欢函数式编程
 * 每个函数都是独立的，可以直接调用
 */

export const PoemAPI = {
  /**
   * 获取随机诗词 - 最常用的功能
   */
  async getRandomPoem(db: SQLite.SQLiteDatabase) {
    return Queries.getRandomPoem(db);
  },

  /**
   * 获取多首随机诗词
   */
  async getRandomPoems(db: SQLite.SQLiteDatabase, count: number = 5) {
    return Queries.getRandomPoems(db, count);
  },

  /**
   * 搜索诗词
   */
  async search(db: SQLite.SQLiteDatabase, keyword: string, limit: number = 20) {
    return Queries.searchPoems(db, keyword, limit, 0);
  },

  /**
   * 按作者搜索
   */
  async searchByAuthor(db: SQLite.SQLiteDatabase, author: string, limit: number = 20) {
    return Queries.getPoemsByAuthor(db, author, limit, 0);
  },

  /**
   * 按朝代搜索
   */
  async searchByDynasty(db: SQLite.SQLiteDatabase, dynasty: string, limit: number = 20) {
    return Queries.getPoemsByDynasty(db, dynasty, limit, 0);
  },

  /**
   * 获取诗词总数
   */
  async getTotalCount(db: SQLite.SQLiteDatabase) {
    return Queries.getTotalPoemCount(db);
  },

  /**
   * 获取所有朝代
   */
  async getAllDynasties(db: SQLite.SQLiteDatabase) {
    return Queries.getAllDynasties(db);
  },

  /**
   * 获取所有作者
   */
  async getAllAuthors(db: SQLite.SQLiteDatabase) {
    return Queries.getAllAuthors(db);
  },

  /**
   * 获取数据库统计信息
   */
  async getStatistics(db: SQLite.SQLiteDatabase) {
    return Queries.getDatabaseStatistics(db);
  },

  /**
   * 获取单首诗词
   */
  async getPoemById(db: SQLite.SQLiteDatabase, id: number) {
    return Queries.getPoemById(db, id);
  },
};
