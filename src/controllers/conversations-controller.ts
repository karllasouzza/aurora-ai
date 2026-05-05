import { FastifyReply, FastifyRequest } from "fastify";
import crypto from "node:crypto";
import z from "zod";
import { ConversationsRepository } from "../infra/repositories/conversations-repository";
import { MessageRepository } from "../infra/repositories/messages-repository";

const getConversationByIdSchema = z.object({
  id: z.string().uuid(),
});
type GetConversationByIdParams = z.infer<typeof getConversationByIdSchema>;

const createConversationSchema = z.object({
  title: z.string().min(1).max(200),
});
type CreateConversationBody = z.infer<typeof createConversationSchema>;

const updateConversationSchema = z.object({
  title: z.string().min(1).max(200),
});

const updateConversationParamsSchema = z.object({
  id: z.string().uuid(),
});
type UpdateConversationParams = z.infer<typeof updateConversationParamsSchema>;
type UpdateConversationBody = z.infer<typeof updateConversationSchema>;

export class ConversationsController {
  constructor(
    private repository = new ConversationsRepository(),
    private messagesRepository = new MessageRepository(),
  ) {}

  async getConversationById(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = request.params as GetConversationByIdParams;

      if (!id) {
        reply.status(400).send({ error: "Conversation ID is required" });
        return;
      }

      const conversation = await this.repository.getConversationById(id);
      const conversationMessages =
        await this.messagesRepository.getMessagesByConversationId(id);

      if (!conversation) {
        reply.status(404).send({ error: "Conversation not found" });
        return;
      }

      return reply
        .status(200)
        .send({ ...conversation, messages: conversationMessages });
    } catch (error: any) {
      console.error("Error fetching conversation:", error);
      reply.status(500).send({
        error: "Failed to fetch conversation",
        details: error?.message || String(error),
      });
      return;
    }
  }

  async getAllConversations(request: FastifyRequest, reply: FastifyReply) {
    try {
      const conversations = await this.repository.getAllConversations();
      return reply.status(200).send(conversations);
    } catch (error: any) {
      console.error("Error fetching conversations:", error);
      reply.status(500).send({
        error: "Failed to fetch conversations",
        details: error?.message || String(error),
      });
      return;
    }
  }

  async createConversation(request: FastifyRequest, reply: FastifyReply) {
    try {
      createConversationSchema.parse(request.body);

      const { title } = request.body as CreateConversationBody;

      const newConversationObject = {
        id: crypto.randomUUID(),
        title,
      };

      const newConversation = await this.repository.createConversation(
        newConversationObject,
      );
      if (!newConversation) {
        reply.status(500).send({ error: "Failed to create conversation" });
        return;
      }

      reply.status(201).send(newConversation);
      return;
    } catch (error: any) {
      console.error("Error creating conversation:", error);
      reply.status(400).send({
        error: "Invalid request body",
        details: error?.message || String(error),
      });
      return;
    }
  }

  async updateConversation(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = request.params as GetConversationByIdParams;
      const { title } = request.body as CreateConversationBody;

      updateConversationSchema.parse({ id, title });

      const updatedConversation = await this.repository.updateConversation(id, {
        title,
      });

      if (!updatedConversation) {
        reply.status(404).send({ error: "Conversation not found" });
        return;
      }

      reply.status(200).send(updatedConversation);
      return;
    } catch (error: any) {
      console.error("Error updating conversation:", error);
      reply.status(400).send({
        error: "Invalid request body",
        details: error?.message || String(error),
      });
      return;
    }
  }

  async updateConversationTitle(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = request.params as UpdateConversationParams;
      const { title } = request.body as UpdateConversationBody;

      updateConversationSchema.parse({ id, title });

      const updatedConversation = await this.repository.updateConversation(id, {
        title,
      });

      if (!updatedConversation) {
        reply.status(404).send({ error: "Conversation not found" });
        return;
      }

      reply.status(200).send(updatedConversation);
      return;
    } catch (error: any) {
      console.error("Error updating conversation title:", error);
      reply.status(400).send({
        error: "Invalid request body",
        details: error?.message || String(error),
      });
      return;
    }
  }

  async deleteConversation(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = request.params as GetConversationByIdParams;

      if (!id) {
        reply.status(400).send({ error: "Conversation ID is required" });
        return;
      }

      await this.repository.deleteConversation(id);
      reply.status(204).send();
      return;
    } catch (error: any) {
      console.error("Error deleting conversation:", error);
      reply.status(500).send({
        error: "Failed to delete conversation",
        details: error?.message || String(error),
      });
      return;
    }
  }
}
