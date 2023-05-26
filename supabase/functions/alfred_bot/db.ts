import { ClientOptions } from "https://deno.land/x/postgres@v0.17.0/connection/connection_params.ts";
import * as postgres from "https://deno.land/x/postgres@v0.17.0/mod.ts";

const clientOptions: ClientOptions = {
  hostname: Deno.env.get("SUPABASE_DB_URL"),
  port: 6543,
  database: "postgres",
  user: "postgres",
  password: Deno.env.get("DB_PASSWORD"),
};
const pool = new postgres.Pool(clientOptions, 3, true);
const db = await pool.connect();

export default db;
