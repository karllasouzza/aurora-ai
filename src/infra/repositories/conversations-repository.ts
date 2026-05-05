import { db } from "../knex/database";

export interface Conversation {
  id: string;
  title: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export class ConversationsRepository {
  constructor(private instance = db) {}

  async createConversation({
    id,
    title,
  }: Pick<Conversation, "id" | "title">) {
    await this.instance("conversations").insert({
      id,
      title,
    });

    const row = await this.instance("conversations").where({ id }).first();
    if (!row) return null;

    return {
      id: row.id,
      title: row.title,
      createdAt: row.created_at ? new Date(row.created_at) : undefined,
      updatedAt: row.updated_at ? new Date(row.updated_at) : undefined,
    } as Conversation;
  }

  async getConversationById(id: string) {
    const row = await this.instance("conversations").where({ id }).first();
    if (!row) return null;

    return {
      id: row.id,
      title: row.title,
      createdAt: row.created_at ? new Date(row.created_at) : undefined,
      updatedAt: row.updated_at ? new Date(row.updated_at) : undefined,
    } as Conversation;
  }

  async getAllConversations() {
    const rows = await this.instance("conversations");
    
    return rows.map((row) => ({
      id: row.id,
      title: row.title,
      createdAt: row.created_at ? new Date(row.created_at) : undefined,
      updatedAt: row.updated_at ? new Date(row.updated_at) : undefined,
    })) as Conversation[];
  }

  async updateConversation(
    id: string,
    updates: Partial<Pick<Conversation, "title">>
  ) {
    await this.instance("conversations").where({ id }).update(updates);

    const row = await this.instance("conversations").where({ id }).first();
    if (!row) return null;

    return {
      id: row.id,
      title: row.title,
      createdAt: row.created_at ? new Date(row.created_at) : undefined,
      updatedAt: row.updated_at ? new Date(row.updated_at) : undefined,
    } as Conversation;
  }

  async deleteConversation(id: string) {
    await this.instance("conversations").where({ id }).delete();
  }
}
