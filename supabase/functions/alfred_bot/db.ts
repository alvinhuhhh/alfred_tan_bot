import { Client } from "https://deno.land/x/postgres@v0.17.0/mod.ts";

const client = new Client({
  hostname: Deno.env.get("DB_HOSTNAME"),
  port: 6543,
  database: "postgres",
  user: "postgres",
  password: Deno.env.get("DB_PASSWORD"),
});
await client.connect();

export default client;
