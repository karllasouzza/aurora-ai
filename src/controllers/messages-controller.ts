import { FastifyReply, FastifyRequest } from "fastify";
import crypto from "node:crypto";
import z from "zod";
import { MessageRepository } from "../infra/repositories/messages-repository";
import { AIService } from "../infra/services/ai-service";
import { ConversationsRepository } from "../infra/repositories/conversations-repository";

const getMessageByIdSchema = z.object({
  id: z.string().uuid(),
});
type GetMessageByIdParams = z.infer<typeof getMessageByIdSchema>;

const createMessageSchema = z.object({
  text: z.string().min(1),
});
type CreateMessageBody = z.infer<typeof createMessageSchema>;

const getMessagesByConversationSchema = z.object({
  id: z.string().uuid(),
});
type GetMessagesByConversationParams = z.infer<
  typeof getMessagesByConversationSchema
>;

export class MessagesController {
  constructor(
    private messagesRepository = new MessageRepository(),
    private conversationsRepository = new ConversationsRepository(),
    private aiService = new AIService(),
  ) {}

  async getMessageById(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = request.params as GetMessageByIdParams;

      if (!id) {
        reply.status(400).send({ error: "Message ID is required" });
        return;
      }

      const message = await this.messagesRepository.getMessageById(id);

      if (!message) {
        reply.status(404).send({ error: "Message not found" });
        return;
      }

      return reply.status(200).send(message);
    } catch (error: any) {
      console.error("Error fetching message:", error);
      reply.status(500).send({
        error: "Failed to fetch message",
        details: error?.message || String(error),
      });
      return;
    }
  }

  async getMessagesByConversationId(
    request: FastifyRequest,
    reply: FastifyReply,
  ) {
    try {
      const { id: conversationId } =
        request.params as GetMessagesByConversationParams;

      if (!conversationId) {
        reply.status(400).send({ error: "Conversation ID is required" });
        return;
      }

      const conversation =
        await this.conversationsRepository.getConversationById(conversationId);

      if (!conversation) {
        reply.status(404).send({ error: "Conversation not found" });
        return;
      }

      const messages =
        await this.messagesRepository.getMessagesByConversationId(
          conversationId,
        );
      return reply.status(200).send(messages);
    } catch (error: any) {
      console.error("Error fetching messages:", error);
      reply.status(500).send({
        error: "Failed to fetch messages",
        details: error?.message || String(error),
      });
      return;
    }
  }

  async createMessageAndGenerateResponse(
    request: FastifyRequest,
    reply: FastifyReply,
  ) {
    try {
      createMessageSchema.parse(request.body);
      getMessagesByConversationSchema.parse(request.params);

      const { id: conversationId } =
        request.params as GetMessagesByConversationParams;
      const { text } = request.body as CreateMessageBody;

      const conversation =
        await this.conversationsRepository.getConversationById(conversationId);
      if (!conversation) {
        reply.status(404).send({ error: "Conversation not found" });
        return;
      }

      const userMessageId = crypto.randomUUID();
      const newUserMessageObject = {
        id: userMessageId,
        conversationId,
        content: [{ type: "text", text }],
        role: "user" as const,
      };

      await this.messagesRepository.createMessage(newUserMessageObject);

      const messages =
        (await this.messagesRepository.getMessagesByConversationId(
          conversationId,
        )) || [];

      const aiResponse = await this.aiService.generateResponse(messages);

      if (!aiResponse || aiResponse.length === 0) {
        console.error("No response from AI service");
        return reply.status(500).send({ error: "No response from AI service" });
      }

      const aiMessages = aiResponse
        .map((message) => ({
          id: crypto.randomUUID(),
          conversationId,
          content: message.content,
          role: message.role,
        }));

      if (aiMessages.length > 0) {
        await this.messagesRepository.createManyMessages(aiMessages);
      }

      const lastMessage = aiResponse[aiResponse.length - 1];
      return reply.status(201).send({
        role: lastMessage.role,
        content: lastMessage.content,
      });
    } catch (error: any) {
      console.error("Error creating message:", error);
      reply.status(500).send({
        error: "Failed to process message",
        details: error?.message || String(error),
      });
      return;
    }
  }
}
