import { db } from "../knex/database";

export interface Message {
  id: string;
  conversationId: string;
  content: any;
  role: "user" | "system" | "assistant" | "tool";
  createdAt?: Date;
  updatedAt?: Date;
}

export class MessageRepository {
  constructor(private instance = db) {}

  async createMessage({
    id,
    conversationId,
    content,
    role,
  }: Pick<Message, "id" | "conversationId" | "content" | "role">) {
    await this.instance("messages").insert({
      id,
      conversation_id: conversationId,
      content: JSON.stringify(content),
      role,
    });

    const row = await this.instance("messages")
      .where({
        id,
      })
      .first();
    if (!row) return null;

    return this._mapRowToMessage(row);
  }

  async createManyMessages(
    messages: Pick<Message, "id" | "conversationId" | "content" | "role">[],
  ) {
    const formattedMessages = messages.map((message) => ({
      id: message.id,
      conversation_id: message.conversationId,
      content: JSON.stringify(message.content),
      role: message.role,
    }));

    await this.instance("messages").insert(formattedMessages);

    const rows = await this.instance("messages").whereIn(
      "id",
      messages.map((message) => message.id),
    );

    return rows.map((row) => this._mapRowToMessage(row)) as Message[];
  }

  private _mapRowToMessage(row: any): Message {
    return {
      id: row.id,
      conversationId: row.conversation_id,
      content:
        typeof row.content === "string" ? JSON.parse(row.content) : row.content,
      role: row.role,
      createdAt: row.created_at ? new Date(row.created_at) : undefined,
      updatedAt: row.updated_at ? new Date(row.updated_at) : undefined,
    };
  }

  async getMessagesByConversationId(conversationId: string) {
    const rows = await this.instance("messages").where({
      conversation_id: conversationId,
    });
    if (!rows) return null;

    return rows.map((row) => this._mapRowToMessage(row)) as Message[];
  }

  async getMessageById(id: string) {
    const row = await this.instance("messages").where({ id }).first();
    if (!row) return null;

    return this._mapRowToMessage(row);
  }

  async deleteMessage(id: string) {
    await this.instance("messages").where({ id }).del();
  }

  async updateMessage(
    id: string,
    data: Partial<Pick<Message, "content" | "role">>,
  ) {
    const updateData = {
      ...data,
      content: data.content ? JSON.stringify(data.content) : undefined,
    };
    delete updateData.content;

    await this.instance("messages")
      .where({ id })
      .update(
        data.content
          ? { ...updateData, content: JSON.stringify(data.content) }
          : updateData,
      );

    const row = await this.instance("messages").where({ id }).first();
    if (!row) return null;

    return this._mapRowToMessage(row);
  }
}
