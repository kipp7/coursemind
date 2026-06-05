import type { Citation } from "@coursemind/contracts";
import { getRetrievalPolicy, getVisibleDocuments, type RagGateway, type RagRetrievalRequest } from "./rag-gateway";

export type RagFlowRagGatewayConfig = {
  apiBaseUrl: string;
  apiKey: string;
  chatId: string;
  model?: string;
};

type RagFlowReferenceChunk = {
  id?: string;
  content?: string;
  content_with_weight?: string;
  document_id?: string;
  doc_id?: string;
  document_name?: string;
  docnm_kwd?: string;
  similarity?: number;
  vector_similarity?: number;
  term_similarity?: number;
};

type RagFlowReference = {
  chunks?: RagFlowReferenceChunk[] | Record<string, RagFlowReferenceChunk>;
};

type RagFlowChatCompletionResponse = {
  choices?: Array<{
    message?: {
      content?: string;
      reference?: RagFlowReference;
    };
  }>;
};

export class RagFlowRagGateway implements RagGateway {
  readonly provider = "ragflow" as const;

  constructor(private readonly config: RagFlowRagGatewayConfig) {}

  async retrieveCourseContext(request: RagRetrievalRequest) {
    const visibleDocuments = getVisibleDocuments(request);
    const response = await fetch(
      `${this.config.apiBaseUrl.replace(/\/$/, "")}/api/v1/chats_openai/${this.config.chatId}/chat/completions`,
      {
        method: "POST",
        headers: {
          Authorization: ["Bearer", this.config.apiKey].join(" "),
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: this.config.model ?? "model",
          messages: [{ role: "user", content: request.question }],
          stream: false,
          extra_body: {
            reference: true,
            reference_metadata: {
              include: true,
              fields: ["course_id", "document_id", "visibility"],
            },
            metadata_condition: {
              logic: "and",
              conditions: [
                {
                  name: "course_id",
                  comparison_operator: "is",
                  value: request.courseId,
                },
              ],
            },
            coursemind: {
              role: request.role,
              visible_document_ids: visibleDocuments.map((document) => document.id),
            },
          },
        }),
      },
    );

    if (!response.ok) {
      throw new Error(`RAGFlow RAG request failed with status ${response.status}.`);
    }

    const payload = (await response.json()) as RagFlowChatCompletionResponse;
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

function toCitations(payload: RagFlowChatCompletionResponse, request: RagRetrievalRequest): Citation[] {
  const message = payload.choices?.[0]?.message;
  const rawChunks = message?.reference?.chunks ?? [];
  const chunks = Array.isArray(rawChunks) ? rawChunks : Object.values(rawChunks);

  if (chunks.length > 0) {
    return chunks.slice(0, 5).map((chunk, index) => ({
      documentId: chunk.document_id ?? chunk.doc_id ?? chunk.id ?? `ragflow-chunk-${index + 1}`,
      title: chunk.document_name ?? chunk.docnm_kwd ?? `RAGFlow chunk ${index + 1}`,
      locator: chunk.id,
      excerpt: chunk.content ?? chunk.content_with_weight,
      confidence: normalizeConfidence(chunk.similarity ?? chunk.vector_similarity ?? chunk.term_similarity),
    }));
  }

  return getVisibleDocuments(request).slice(0, 3).map((document, index) => ({
    documentId: document.id,
    title: document.title,
    locator: `ragflow fallback ${index + 1}`,
    excerpt: message?.content,
  }));
}

function normalizeConfidence(score: number | undefined) {
  if (typeof score !== "number" || Number.isNaN(score)) {
    return undefined;
  }

  return Math.max(0, Math.min(1, score));
}
