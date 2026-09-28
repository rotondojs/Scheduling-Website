/* eslint no-console: "off" */

import "dotenv/config";
import { app, httpServer } from "./app.ts";
import { setDbInitializer } from "./keyv.ts";
import { FileStore } from "./fileStore.ts";
import KeyvMongo from "@keyv/mongo";
import { Keyv } from "keyv";

const PORT = process.env.PORT ?? 3000;
const MONGO_URI = process.env.MONGO_URI;

if (MONGO_URI) {
  // Production: use MongoDB
  setDbInitializer(<T>(name: string) =>
    new Keyv<T>({ store: new KeyvMongo(MONGO_URI, { collection: name }) })
  );
} else {
  // Development: persist to local JSON files so data survives server restarts
  setDbInitializer(<T>(name: string) =>
    new Keyv<T>({ store: new FileStore<T>(name) })
  );
  console.log("Using local file storage (dev-data/)");
}

httpServer.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
