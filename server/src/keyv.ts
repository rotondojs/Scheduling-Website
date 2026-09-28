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

export function setDbInitializer(initializer: <T>(name: string) => Keyv<T>): void {
  if (globalDbInitializer !== null) throw new Error("Database initializer already set");
  globalDbInitializer = initializer;
}

export function createRepo<T = unknown>(repoName: string): Repo<T> {
  let _store: Keyv<T> | null = null;

  function getStore(): Keyv<T> {
    if (globalDbInitializer === null) {
      globalDbInitializer = <T>(_: string) => new Keyv<T>();
    }
    if (_store === null) _store = globalDbInitializer(repoName);
    return _store;
  }

  return {
    add: async (value) => {
      const key = randomUUID();
      await getStore().set(key, value);
      return key;
    },

    set: async (key, value) => {
      await getStore().set(key, value);
    },

    get: async (key) => {
      const v = await getStore().get(key);
      if (!v) throw new Error(`Key ${key} not found in ${repoName}`);
      return v;
    },

    getMany: async (keys) => {
      const vals = await getStore().getMany(keys);
      return vals.filter((v): v is T => v !== undefined);
    },

    getAllKeys: async () => {
      const result: string[] = [];
      for await (const [key] of getStore().iterator!(undefined)) {
        result.push(key as string);
      }
      return result;
    },

    find: async (key) => {
      const v = await getStore().get(key);
      return v === undefined ? null : v;
    },

    clear: async () => {
      if (_store) await _store.clear();
    },

    delete: async (key) => {
      await getStore().delete(key);
    },
  };
}
