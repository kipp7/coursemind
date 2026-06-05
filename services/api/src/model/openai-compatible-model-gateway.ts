import { getPromptPolicy, type ModelGateway, type ModelGenerationRequest } from "./model-gateway";

export type OpenAiCompatibleModelGatewayConfig = {
  apiBaseUrl: string;
  appAuth: string;
  model: string;
};

type OpenAiCompatibleChatCompletionResponse = {
  choices?: Array<{
    message?: {
      content?: string;
    };
  }>;
  usage?: {
    prompt_tokens?: number;
    completion_tokens?: number;
    total_tokens?: number;
  };
};

export class OpenAiCompatibleModelGateway implements ModelGateway {
  readonly provider = "openai-compatible" as const;

  constructor(private readonly config: OpenAiCompatibleModelGatewayConfig) {}

  async generateAnswer(input: ModelGenerationRequest) {
    const response = await fetch(`${this.config.apiBaseUrl.replace(/\/$/, "")}/chat/completions`, {
      method: "POST",
      headers: {
        Authorization: ["Bearer", this.config.appAuth].join(" "),
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: this.config.model,
        messages: [
          {
            role: "system",
            content: buildSystemPrompt(input),
          },
          {
            role: "user",
            content: buildUserPrompt(input),
          },
        ],
        temperature: 0.2,
      }),
    });

    if (!response.ok) {
      throw new Error(`Model gateway request failed with status ${response.status}.`);
    }

    const payload = (await response.json()) as OpenAiCompatibleChatCompletionResponse;
    const content = payload.choices?.[0]?.message?.content?.trim();

    if (!content) {
      throw new Error("Model gateway returned an empty answer.");
    }

    return {
      content,
      trace: {
        provider: this.provider,
        model: this.config.model,
        promptPolicy: getPromptPolicy(input.request.role),
        tokenUsage: {
          promptTokens: payload.usage?.prompt_tokens,
          completionTokens: payload.usage?.completion_tokens,
          totalTokens: payload.usage?.total_tokens,
        },
      },
    };
  }
}

function buildSystemPrompt(input: ModelGenerationRequest) {
  const localeLine =
    input.request.locale === "zh-CN"
      ? "Use Chinese as the primary language for the answer."
      : "Use English as the primary language for the answer.";

  return [
    "You are CourseMind, a school-facing course assistant.",
    localeLine,
    "Answer only from the supplied course context and citations.",
    "Do not directly complete graded submissions for students.",
    "Keep the teacher review and audit trail in mind.",
    ...input.guardrails,
  ].join("\n");
}

function buildUserPrompt(input: ModelGenerationRequest) {
  const citationContext = input.citations
    .map((citation, index) =>
      [
        `Citation ${index + 1}: ${citation.title}`,
        citation.locator ? `Locator: ${citation.locator}` : undefined,
        citation.excerpt ? `Excerpt: ${citation.excerpt}` : undefined,
      ]
        .filter(Boolean)
        .join("\n"),
    )
    .join("\n\n");

  return [
    `Course: ${input.courseSnapshot.course.title}`,
    `Role: ${input.request.role}`,
    `Question: ${input.request.question}`,
    citationContext ? `Course context:\n${citationContext}` : "Course context: none retrieved.",
  ].join("\n\n");
}
