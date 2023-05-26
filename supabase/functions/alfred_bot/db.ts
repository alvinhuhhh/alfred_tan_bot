import postgres from "npm:postgres";

const sql = postgres({
  host: Deno.env.get("DB_HOSTNAME"),
  port: 6543,
  database: "postgres",
  user: "postgres",
  password: Deno.env.get("DB_PASSWORD"),
});

export default sql;
