import type { Citation } from "@coursemind/contracts";
import { getRetrievalPolicy, getVisibleDocuments, type RagGateway, type RagRetrievalRequest } from "./rag-gateway";

export class MockRagGateway implements RagGateway {
  readonly provider = "mock" as const;

  async retrieveCourseContext(request: RagRetrievalRequest) {
    const citations = getVisibleDocuments(request)
      .slice(0, 3)
      .map((document, index): Citation => ({
        documentId: document.id,
        title: document.title,
        locator: index === 0 ? "core section" : `chunk ${index + 1}`,
        excerpt: buildExcerpt(request.question, document.title),
        confidence: Number((0.86 - index * 0.08).toFixed(2)),
      }));

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

function buildExcerpt(question: string, title: string) {
  const lower = question.toLowerCase();

  if (lower.includes("fine") || lower.includes("tuning") || lower.includes("rag")) {
    return `${title} says frequently changing course content should be handled through retrieval before fine-tuning.`;
  }

  if (lower.includes("homework") || lower.includes("rubric") || lower.includes("grade")) {
    return `${title} asks the assistant to explain grading criteria without replacing the student's own work.`;
  }

  return `${title} contains course definitions, classroom rules, and teacher notes relevant to the question.`;
}
