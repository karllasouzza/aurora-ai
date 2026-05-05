import { type FastifyPluginAsync } from "fastify";
import { ConversationsController } from "../../controllers/conversations-controller";
import messages from "./messages/index";

const conversations: FastifyPluginAsync = async (
  fastify,
  opts,
): Promise<void> => {
  const controller = new ConversationsController();

  // conversations routes
  fastify.get("/", controller.getAllConversations.bind(controller));
  fastify.get("/:id", controller.getConversationById.bind(controller));

  fastify.post("/", controller.createConversation.bind(controller));

  fastify.delete("/:id", controller.deleteConversation.bind(controller));

  fastify.register(messages, { prefix: "/:id/messages" });
};

export default conversations;
