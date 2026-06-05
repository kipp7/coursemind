import type { AppLocale, Citation, CourseSnapshot } from "@coursemind/contracts";
import { getPromptPolicy, type ModelGateway, type ModelGenerationRequest } from "./model-gateway";

export class MockModelGateway implements ModelGateway {
  readonly provider = "mock" as const;

  async generateAnswer(input: ModelGenerationRequest) {
    return {
      content: composeMockAnswer(input),
      trace: {
        provider: this.provider,
        model: "coursemind-mock-v1",
        promptPolicy: getPromptPolicy(input.request.role),
      },
    };
  }
}

function composeMockAnswer({ request, courseSnapshot, citations }: ModelGenerationRequest) {
  const citationText = citations
    .map((citation, index) => `[${index + 1}] ${getCitationTitle(citation, request.locale)}`)
    .join(request.locale === "zh-CN" ? "、" : ", ");

  if (request.role === "teacher") {
    if (request.locale === "zh-CN") {
      return `这条回答应该进入教师审核队列。根据 ${citationText}，智能体需要先解释课程概念，再把引用自课件的内容和教师补充建议分开呈现。${getCourseTitle(courseSnapshot, request.locale)} 当前还有 ${courseSnapshot.pendingReviewCount} 条待审核记录。`;
    }

    return `This should enter the teacher review queue. Based on ${citationText}, the answer should explain the course concept first, then separate cited lecture material from teacher additions. ${courseSnapshot.course.title} currently has ${courseSnapshot.pendingReviewCount} pending review items.`;
  }

  if (request.role === "admin") {
    if (request.locale === "zh-CN") {
      return `从管理员视角看，这次回答已经记录了课程、角色、引用、护栏和审核状态。RAG 适配器检索到了 ${citations.length} 条证据。后续可以把 RAG provider 切换到 Dify 或 RAGFlow，把模型 provider 切换到千问、DeepSeek、OpenAI-compatible 网关、vLLM 或 Ollama，同时不让 Web 前端接触服务端凭据。`;
    }

    return `From the admin view, this answer records course, role, citations, guardrails, and review status. The RAG adapter retrieved ${citations.length} evidence items. Later we can swap the RAG provider to Dify or RAGFlow, and the model provider to Qwen, DeepSeek, an OpenAI-compatible gateway, vLLM, or Ollama without exposing server credentials to the Web client.`;
  }

  if (request.locale === "zh-CN") {
    return `对 ${getCourseTitle(courseSnapshot, request.locale)} 来说，MVP 阶段应该优先使用 RAG：先从当前课件、实验说明和教师 FAQ 中检索课程上下文，再由模型组织回答。微调应该等到学校积累了教师确认过的问答、评分标准和稳定规范之后再做。这条回答基于 ${citationText}，因此可以被教师审核和追踪，而不是只能盲目信任。`;
  }

  return `RAG is the right first step for ${courseSnapshot.course.title}: it retrieves current lecture notes, labs, and teacher FAQs before the model writes the answer. Fine-tuning should wait until the school has teacher-approved answers, rubrics, and stable policy examples. This response is grounded in ${citationText}, so it can be audited instead of trusted blindly.`;
}

function getCourseTitle(snapshot: CourseSnapshot, locale: AppLocale) {
  if (locale === "zh-CN") {
    return snapshot.course.id === "data-201" ? "数据结构" : "人工智能导论";
  }

  return snapshot.course.title;
}

function getCitationTitle(citation: Citation, locale: AppLocale) {
  if (locale !== "zh-CN") {
    return citation.title;
  }

  const titleMap: Record<string, string> = {
    "ai-syllabus": "课程大纲",
    "ai-rag-lecture": "第 4 讲：RAG 与课程问答",
    "ai-review-rubric": "教师审核标准草案",
    "data-tree-notes": "树与二叉树讲义",
    "data-lab-queue": "实验 2：栈和队列",
  };

  return titleMap[citation.documentId] ?? citation.title;
}
