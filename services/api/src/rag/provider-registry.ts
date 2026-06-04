import { MockRagGateway } from "./mock-rag-gateway";
import type { RagGateway, RagProviderId } from "./rag-gateway";

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
