import { createGroq } from "@ai-sdk/groq";
import { ModelMessage } from "ai";
import { SecurityAgent } from "./agents/security-agent";
import { AuroraAgent } from "./agents/aurora-agent";

export class AIService {
  private securityAgent: SecurityAgent;
  private auroraAgent: AuroraAgent;

  constructor(
    private apiKey = process.env.GROQ_API_KEY || "",
    private provider = createGroq({
      apiKey: this.apiKey,
    }),
  ) {
    this.securityAgent = new SecurityAgent(this.apiKey, this.provider);
    this.auroraAgent = new AuroraAgent(this.apiKey, this.provider);
  }

  async generateResponse(messages: ModelMessage[]) {
    try {
      const lastUserMessage = [...messages]
        .reverse()
        .find((m) => m.role === "user");

      if (lastUserMessage) {
        const userInput = extractTextContent(lastUserMessage);
        const securityResult = await this.securityAgent.analyze(userInput);

        if (securityResult.status === "error") {
          return [
            {
              role: "assistant" as const,
              content: [
                {
                  type: "text",
                  text: securityResult.message,
                },
              ],
            },
          ];
        }
      }

      return this.auroraAgent.generateResponse(messages);
    } catch (error: any) {
      console.error("Error generating response:", error);

      const errorMessage = error?.message || String(error);

      return [
        {
          role: "assistant" as const,
          content: [
            {
              type: "text",
              text: `Desculpe, ocorreu um erro ao processar sua solicitação. Detalhes: ${errorMessage}`,
            },
          ],
        },
      ];
    }
  }
}

function extractTextContent(message: ModelMessage): string {
  if (typeof message.content === "string") return message.content;
  return message.content
    .filter((p) => p.type === "text")
    .map((p) => p.text)
    .join(" ");
}
