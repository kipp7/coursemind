import { DifyRagGateway, type DifyRagGatewayConfig } from "./dify-rag-gateway";
import { MockRagGateway } from "./mock-rag-gateway";
import type { RagGateway, RagProviderId } from "./rag-gateway";
import { RagFlowRagGateway, type RagFlowRagGatewayConfig } from "./ragflow-rag-gateway";

export class RagProviderConfigurationError extends Error {
  constructor(provider: RagProviderId) {
    super(`RAG provider "${provider}" is not configured yet. Use "mock" for the MVP demo.`);
    this.name = "RagProviderConfigurationError";
  }
}

export function createRagGateway(provider: RagProviderId = getConfiguredRagProvider()): RagGateway {
  if (provider === "mock") {
    return new MockRagGateway();
  }

  if (provider === "dify") {
    return new DifyRagGateway(getDifyConfig());
  }

  if (provider === "ragflow") {
    return new RagFlowRagGateway(getRagFlowConfig());
  }

  throw new RagProviderConfigurationError(provider);
}

function getConfiguredRagProvider(): RagProviderId {
  const configuredProvider = process.env.COURSEMIND_RAG_PROVIDER;

  if (!configuredProvider) {
    return "mock";
  }

  if (configuredProvider === "mock" || configuredProvider === "dify" || configuredProvider === "ragflow") {
    return configuredProvider;
  }

  return "custom";
}

function getDifyConfig(): DifyRagGatewayConfig {
  const apiBaseUrl = process.env.COURSEMIND_DIFY_API_BASE_URL;
  const apiKey = process.env.COURSEMIND_DIFY_APP_AUTH;

  if (!apiBaseUrl || !apiKey) {
    throw new RagProviderConfigurationError("dify");
  }

  return {
    apiBaseUrl,
    apiKey,
    userPrefix: process.env.COURSEMIND_DIFY_USER_PREFIX,
  };
}

function getRagFlowConfig(): RagFlowRagGatewayConfig {
  const apiBaseUrl = process.env.COURSEMIND_RAGFLOW_API_BASE_URL;
  const appAuth = process.env.COURSEMIND_RAGFLOW_APP_AUTH;
  const chatId = process.env.COURSEMIND_RAGFLOW_CHAT_ID;

  if (!apiBaseUrl || !appAuth || !chatId) {
    throw new RagProviderConfigurationError("ragflow");
  }

  return {
    apiBaseUrl,
    appAuth,
    chatId,
    model: process.env.COURSEMIND_RAGFLOW_MODEL,
  };
}
