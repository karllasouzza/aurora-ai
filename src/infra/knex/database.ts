import knex from "knex";
import path from "path";

// Use a deterministic database file path relative to the project root so
// both the TS (tsx) scripts and the built JS (dist) use the same DB file.
const dbFile = path.resolve(process.cwd(), "src", "infra", "knex", "db.sqlite");

const db = knex({
  client: "sqlite3",
  connection: {
    filename: dbFile,
  },
  useNullAsDefault: true,
  debug: true,
});

// Function to test the database connection
async function testConnection() {
  try {
    const result = await db.raw("SELECT 1+1 AS result");
    console.log("Database connection established successfully");
    return result;
  } catch (error) {
    console.error("Database connection failed:", error);
    throw error;
  }
}

export { db, testConnection };
