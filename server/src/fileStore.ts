import fs from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";
import type { Repo, Key } from "./keyv.ts";

const DATA_DIR = "./dev-data";

/**
 * A simple file-backed Repo<T> implementation.
 * Persists data to dev-data/<name>.json without going through Keyv,
 * so there is no serialization wrapping to work around.
 */
export function createFileRepo<T>(name: string): Repo<T> {
  const filePath = path.join(DATA_DIR, `${name}.json`);
  let cache: Map<string, T> = new Map();

  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  if (fs.existsSync(filePath)) {
    try {
      const raw = fs.readFileSync(filePath, "utf-8");
      const entries = JSON.parse(raw) as Array<[string, T]>;
      cache = new Map(entries);
    } catch {
      // Corrupted file — start fresh
    }
  }

  function flush(): void {
    fs.writeFileSync(
      filePath,
      JSON.stringify(Array.from(cache.entries()), null, 2),
      "utf-8",
    );
  }

  return {
    add: async (value: T): Promise<Key> => {
      const key = randomUUID();
      cache.set(key, value);
      flush();
      return key;
    },

    set: async (key: Key, value: T): Promise<void> => {
      cache.set(key, value);
      flush();
    },

    get: async (key: Key): Promise<T> => {
      const v = cache.get(key);
      if (v === undefined) throw new Error(`Key ${key} not found in ${name}`);
      return v;
    },

    getMany: async (keys: Key[]): Promise<T[]> => {
      return keys.map((k) => cache.get(k)).filter((v): v is T => v !== undefined);
    },

    getAllKeys: async (): Promise<Key[]> => {
      return Array.from(cache.keys());
    },

    find: async (key: Key): Promise<T | null> => {
      return cache.get(key) ?? null;
    },

    clear: async (): Promise<void> => {
      cache.clear();
      flush();
    },

    delete: async (key: Key): Promise<void> => {
      cache.delete(key);
      flush();
    },
  };
}
