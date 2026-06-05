import { MockModelGateway } from "./mock-model-gateway";
import { OpenAiCompatibleModelGateway, type OpenAiCompatibleModelGatewayConfig } from "./openai-compatible-model-gateway";
import type { ModelGateway, ModelProviderId } from "./model-gateway";

export class ModelProviderConfigurationError extends Error {
  constructor(provider: ModelProviderId) {
    super(`Model provider "${provider}" is not configured yet. Use "mock" for the MVP demo.`);
    this.name = "ModelProviderConfigurationError";
  }
}

export function createModelGateway(provider: ModelProviderId = getConfiguredModelProvider()): ModelGateway {
  if (provider === "mock") {
    return new MockModelGateway();
  }

  if (provider === "openai-compatible") {
    return new OpenAiCompatibleModelGateway(getOpenAiCompatibleConfig());
  }

  throw new ModelProviderConfigurationError(provider);
}

function getConfiguredModelProvider(): ModelProviderId {
  const configuredProvider = process.env.COURSEMIND_MODEL_PROVIDER;

  if (!configuredProvider) {
    return "mock";
  }

  if (configuredProvider === "mock" || configuredProvider === "openai-compatible") {
    return configuredProvider;
  }

  return "custom";
}

function getOpenAiCompatibleConfig(): OpenAiCompatibleModelGatewayConfig {
  const apiBaseUrl = process.env.COURSEMIND_MODEL_API_BASE_URL;
  const appAuth = process.env.COURSEMIND_MODEL_APP_AUTH;
  const model = process.env.COURSEMIND_MODEL_NAME;

  if (!apiBaseUrl || !appAuth || !model) {
    throw new ModelProviderConfigurationError("openai-compatible");
  }

  return {
    apiBaseUrl,
    appAuth,
    model,
  };
}
