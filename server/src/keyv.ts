import { Keyv } from "keyv";
import { randomUUID } from "node:crypto";

export type Key = string;

export interface Repo<Value> {
  add: (value: Value) => Promise<Key>;
  set: (key: Key, value: Value) => Promise<void>;
  find: (key: Key) => Promise<Value | null>;
  get: (key: Key) => Promise<Value>;
  getMany: (keys: Key[]) => Promise<Value[]>;
  getAllKeys: () => Promise<Key[]>;
  clear: () => Promise<void>;
  delete: (key: Key) => Promise<void>;
}

let globalDbInitializer: null | (<T>(name: string) => Keyv<T>) = null;
let globalDirectRepoInitializer: null | (<T>(name: string) => Repo<T>) = null;

export function setDbInitializer(initializer: <T>(name: string) => Keyv<T>): void {
  if (globalDbInitializer !== null) throw new Error("Database initializer already set");
  globalDbInitializer = initializer;
}

export function setDirectRepoInitializer(initializer: <T>(name: string) => Repo<T>): void {
  if (globalDirectRepoInitializer !== null) throw new Error("Direct repo initializer already set");
  globalDirectRepoInitializer = initializer;
}

export function createRepo<T = unknown>(repoName: string): Repo<T> {
  let _directRepo: Repo<T> | null = null;
  let _store: Keyv<T> | null = null;

  function getDirectRepo(): Repo<T> | null {
    if (globalDirectRepoInitializer !== null && _directRepo === null) {
      _directRepo = globalDirectRepoInitializer<T>(repoName);
    }
    return _directRepo;
  }

  function getStore(): Keyv<T> {
    if (globalDbInitializer === null) {
      globalDbInitializer = <T>(_: string) => new Keyv<T>();
    }
    if (_store === null) _store = globalDbInitializer(repoName);
    return _store;
  }

  return {
    add: async (value) => {
      const direct = getDirectRepo();
      if (direct) return direct.add(value);
      const key = randomUUID();
      await getStore().set(key, value);
      return key;
    },

    set: async (key, value) => {
      const direct = getDirectRepo();
      if (direct) return direct.set(key, value);
      await getStore().set(key, value);
    },

    get: async (key) => {
      const direct = getDirectRepo();
      if (direct) return direct.get(key);
      const v = await getStore().get(key);
      if (!v) throw new Error(`Key ${key} not found in ${repoName}`);
      return v;
    },

    getMany: async (keys) => {
      const direct = getDirectRepo();
      if (direct) return direct.getMany(keys);
      const vals = await getStore().getMany(keys);
      return vals.filter((v): v is T => v !== undefined);
    },

    getAllKeys: async () => {
      const direct = getDirectRepo();
      if (direct) return direct.getAllKeys();
      const result: string[] = [];
      for await (const [key] of getStore().iterator!(undefined)) {
        result.push(key as string);
      }
      return result;
    },

    find: async (key) => {
      const direct = getDirectRepo();
      if (direct) return direct.find(key);
      const v = await getStore().get(key);
      return v === undefined ? null : v;
    },

    clear: async () => {
      const direct = getDirectRepo();
      if (direct) return direct.clear();
      if (_store) await _store.clear();
    },

    delete: async (key) => {
      const direct = getDirectRepo();
      if (direct) return direct.delete(key);
      await getStore().delete(key);
    },
  };
}
