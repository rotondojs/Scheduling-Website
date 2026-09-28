import fs from "node:fs";
import path from "node:path";

const DATA_DIR = "./dev-data";

/**
 * A simple file-backed key-value store that persists data to a JSON file.
 * Used in development so data survives server restarts without needing MongoDB.
 * Each repo gets its own file: dev-data/<name>.json
 */
export class FileStore<T> {
  private filePath: string;
  private cache: Map<string, T>;
  namespace?: string;

  constructor(name: string) {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    this.filePath = path.join(DATA_DIR, `${name}.json`);
    this.cache = new Map();

    if (fs.existsSync(this.filePath)) {
      try {
        const raw = fs.readFileSync(this.filePath, "utf-8");
        const entries = JSON.parse(raw) as Array<[string, T]>;
        this.cache = new Map(entries);
      } catch {
        // Corrupted file — start fresh
      }
    }
  }

  private flush(): void {
    fs.writeFileSync(
      this.filePath,
      JSON.stringify(Array.from(this.cache.entries()), null, 2),
      "utf-8",
    );
  }

  async get(key: string): Promise<T | undefined> {
    return this.cache.get(key);
  }

  async set(key: string, value: T, _ttl?: number): Promise<boolean> {
    this.cache.set(key, value);
    this.flush();
    return true;
  }

  async delete(key: string): Promise<boolean> {
    const had = this.cache.has(key);
    this.cache.delete(key);
    if (had) this.flush();
    return had;
  }

  async clear(): Promise<void> {
    this.cache.clear();
    this.flush();
  }

  // Used by keyv.ts getAllKeys()
  async *iterator(_namespace: string | undefined): AsyncGenerator<[string, T]> {
    for (const [key, value] of this.cache.entries()) {
      yield [key, value];
    }
  }
}
