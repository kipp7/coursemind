import type { Citation } from "@coursemind/contracts";
import { getRetrievalPolicy, getVisibleDocuments, type RagGateway, type RagRetrievalRequest } from "./rag-gateway";

export type DifyRagGatewayConfig = {
  apiBaseUrl: string;
  apiKey: string;
  userPrefix?: string;
};

type DifyChatMessageResponse = {
  answer?: string;
  metadata?: {
    retriever_resources?: Array<{
      document_id?: string;
      document_name?: string;
      segment_id?: string;
      content?: string;
      score?: number;
    }>;
  };
};

export class DifyRagGateway implements RagGateway {
  readonly provider = "dify" as const;

  constructor(private readonly config: DifyRagGatewayConfig) {}

  async retrieveCourseContext(request: RagRetrievalRequest) {
    const visibleDocuments = getVisibleDocuments(request);
    const response = await fetch(`${this.config.apiBaseUrl.replace(/\/$/, "")}/v1/chat-messages`, {
      method: "POST",
      headers: {
        Authorization: ["Bearer", this.config.apiKey].join(" "),
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: request.question,
        response_mode: "blocking",
        user: `${this.config.userPrefix ?? "coursemind"}-${request.role}`,
        inputs: {
          course_id: request.courseId,
          role: request.role,
          visible_document_ids: visibleDocuments.map((document) => document.id),
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`Dify RAG request failed with status ${response.status}.`);
    }

    const payload = (await response.json()) as DifyChatMessageResponse;
    const citations = toCitations(payload, request);

    return {
      citations,
      trace: {
        provider: this.provider,
        query: request.question,
        retrievedDocumentIds: citations.map((citation) => citation.documentId),
        retrievalPolicy: getRetrievalPolicy(request.role),
      },
    };
  }
}

function toCitations(payload: DifyChatMessageResponse, request: RagRetrievalRequest): Citation[] {
  const resources = payload.metadata?.retriever_resources ?? [];

  if (resources.length > 0) {
    return resources.slice(0, 5).map((resource, index) => ({
      documentId: resource.document_id ?? resource.segment_id ?? `dify-resource-${index + 1}`,
      title: resource.document_name ?? `Dify retrieval resource ${index + 1}`,
      locator: resource.segment_id,
      excerpt: resource.content,
      confidence: normalizeConfidence(resource.score),
    }));
  }

  return getVisibleDocuments(request).slice(0, 3).map((document, index) => ({
    documentId: document.id,
    title: document.title,
    locator: `dify fallback ${index + 1}`,
    excerpt: payload.answer,
  }));
}

function normalizeConfidence(score: number | undefined) {
  if (typeof score !== "number" || Number.isNaN(score)) {
    return undefined;
  }

  return Math.max(0, Math.min(1, score));
}
