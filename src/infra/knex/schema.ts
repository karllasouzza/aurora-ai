import { testConnection, db } from "./database";

async function createSchema() {
  try {
    await testConnection();

    await db.schema.createTableIfNotExists("conversations", (table) => {
      table.uuid("id").primary().notNullable();
      table.string("title", 200).notNullable();
      table.timestamps(true, true);
    });

    await db.schema.createTableIfNotExists("messages", (table) => {
      table.uuid("id").primary().notNullable();
      table
        .uuid("conversation_id")
        .notNullable()
        .references("id")
        .inTable("conversations");
      table.enum("role", ["user", "assistant", "tool", "system"]).notNullable();
      table.json("content").notNullable();
      table.timestamps(true, true);
    });
  } catch (error) {
    console.error("Error creating schema:", error);
  } finally {
    await db.destroy();
  }
}

createSchema();
