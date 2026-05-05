import { type FastifyPluginAsync } from "fastify";
import { MessagesController } from "../../../controllers/messages-controller";

const messages: FastifyPluginAsync = async (fastify, opts): Promise<void> => {
  const controller = new MessagesController();

  fastify.get("/", controller.getMessagesByConversationId.bind(controller));

  fastify.get("/:id", controller.getMessageById.bind(controller));

  fastify.post(
    "/",
    controller.createMessageAndGenerateResponse.bind(controller),
  );
};

export default messages;
