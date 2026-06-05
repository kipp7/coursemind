"use client";

import type {
  AppLocale,
  AuditEvent,
  AuditEventListResponse,
  AnswerResponse,
  ConversationDetailResponse,
  ConversationListResponse,
  ConversationLogEntry,
  ConversationMessage,
  ConversationSummary,
  CourseDocument,
  CourseDocumentCreateRequest,
  CourseDocumentCreateResponse,
  CourseRole,
  CourseSnapshot,
  TeacherReviewAction,
  TeacherReviewQueueItem,
  TeacherReviewQueueResponse,
} from "@coursemind/contracts";
import {
  BarChart3,
  Check,
  FilePlus2,
  Library,
  PanelRightOpen,
  ShieldCheck,
  SlidersHorizontal,
  Upload,
  X,
} from "lucide-react";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { CourseChatConversation } from "./course-chat-conversation";
import { CourseChatSidebar } from "./course-chat-sidebar";
import type { ChatMessage, WorkspacePanel } from "./course-chat-types";

const locales: AppLocale[] = ["zh-CN", "en-US"];
const sourceTypes: CourseDocumentCreateRequest["sourceType"][] = ["pdf", "ppt", "word", "markdown", "web", "transcript"];
const visibilityTypes: CourseDocumentCreateRequest["visibility"][] = ["student", "teacher", "admin"];

const panelIcons = {
  materials: Library,
  teacher: SlidersHorizontal,
  audit: BarChart3,
};

const copy = {
  "zh-CN": {
    appSubtitle: "学校课程智能体 MVP",
    newChat: "新问题",
    quickPrompts: "示例问题",
    currentCourse: "课程空间",
    providerPath: "Next.js API -> RAG Gateway -> Model Gateway",
    sideTitle: "会话",
    noChats: "暂无会话，先问一个课程问题。",
    governance: "治理链路",
    closePanel: "关闭面板",
    openPanel: "打开课程面板",
    panels: {
      materials: "资料",
      teacher: "审核",
      audit: "审计",
    },
    roles: {
      student: "学生",
      teacher: "教师",
      admin: "管理员",
    },
    prompts: {
      student: "这门课里，RAG 和微调有什么区别？为什么我们现在先做 RAG？",
      teacher: "请生成一条带引用的回答，并进入教师审核队列。",
      admin: "请总结这次回答的 provider 边界、引用和审计数据。",
    },
    headers: {
      assistant: {
        eyebrow: "CourseMind Assistant",
        title: "人工智能导论",
        body: "向课程智能体提问。回答会走 RAG 检索、模型网关、引用展示和教师审核记录。",
      },
      materials: {
        eyebrow: "Knowledge Base",
        title: "课程资料",
        body: "先演示资料入库边界，后续替换为真实上传、解析、切片和索引。",
      },
      teacher: {
        eyebrow: "Teacher Review",
        title: "教师审核",
        body: "教师修正会成为后续固化学校规范、评分标准和老师风格的数据来源。",
      },
      audit: {
        eyebrow: "Audit Trail",
        title: "审计记录",
        body: "学校可以追踪每条回答的来源、审核动作和资料入库记录。",
      },
    },
    seed: {
      user: "我们应该先用 RAG 做课程智能体，还是马上微调一个模型？",
      assistant: "先做 RAG。课程资料变化快，MVP 应该先检索当前课程上下文，带引用回答，并把结果送入教师审核；微调等有真实审核数据后再做。",
      sources: ["课程大纲", "第 4 讲：RAG 与课程问答"],
    },
    nav: {
      role: "角色",
      language: "语言",
      statusTitle: "Mock provider 已连接",
      statusBody: "Dify/RAGFlow 适配器边界已保留",
    },
    assistant: {
      loading: "课程加载中",
      askLabel: "输入课程问题",
      placeholder: "向当前课程提问",
      send: "发送问题",
      evidence: "引用依据",
      noEvidence: "提问后会显示引用资料。",
      review: "教师审核",
      provider: "Provider",
      pending: "下一次回答会创建一条待教师审核记录。",
      couldNotLoad: "无法加载演示课程。",
      requestFailed: "回答请求失败",
      reviewFailed: "教师审核更新失败",
      contextReady: "课程上下文已就绪",
      traceTitle: "检索链路",
      thinking: "正在检索课程上下文",
    },
    courses: {
      overview: "知识库概览",
      docs: "资料",
      chunks: "切片",
      queue: "待审",
      coverage: "覆盖率",
      materialList: "课程资料列表",
      addMaterial: "新增课程资料",
      titleLabel: "资料标题",
      titlePlaceholder: "例如：第 5 讲：向量数据库与检索评估",
      sourceType: "资料类型",
      visibility: "可见范围",
      submit: "创建入库任务",
      submitting: "创建中",
      created: "已创建资料入库任务。",
      createFailed: "资料入库任务创建失败",
    },
    teacher: {
      queueTitle: "待审核回答",
      empty: "暂无待审核回答。先在课程问答里发送一个问题。",
      approve: "通过",
      correct: "修正",
      reject: "驳回",
      correction: "发布前再补充一个课堂例子。",
      correctionNotes: "教师要求解释更具体。",
      rejectedNotes: "演示审核流程：教师驳回了这条回答。",
    },
    audit: {
      empty: "暂无审计记录。",
      target: "对象",
      eventTypes: {
        "agent.answer.created": "智能体回答已创建",
        "course_document.ingestion_requested": "课程资料入库已请求",
        "teacher_review.updated": "教师审核已更新",
      },
      governanceTitle: "当前治理链路",
      governanceItems: [
        "课程资料入库请求",
        "RAG gateway 适配器",
        "带引用的课程回答",
        "教师审核动作",
        "审计事件记录",
        "Dify/RAGFlow 可替换",
      ],
    },
    sourceTypes: {
      pdf: "PDF",
      ppt: "课件",
      word: "Word",
      markdown: "Markdown",
      web: "网页",
      transcript: "课堂转写",
    },
    visibility: {
      student: "学生可见",
      teacher: "教师审核",
      admin: "管理员",
    },
    statuses: {
      pending: "待处理",
      indexed: "已索引",
      needs_review: "待审核",
      blocked: "已阻止",
    },
  },
  "en-US": {
    appSubtitle: "School course agent MVP",
    newChat: "New question",
    quickPrompts: "Suggested prompts",
    currentCourse: "Course space",
    providerPath: "Next.js API -> RAG Gateway -> Model Gateway",
    sideTitle: "Chats",
    noChats: "No conversations yet. Ask a course question first.",
    governance: "Governance path",
    closePanel: "Close panel",
    openPanel: "Open course panel",
    panels: {
      materials: "Materials",
      teacher: "Review",
      audit: "Audit",
    },
    roles: {
      student: "Student",
      teacher: "Teacher",
      admin: "Admin",
    },
    prompts: {
      student: "What is the difference between RAG and fine-tuning in this course?",
      teacher: "Draft a cited answer and mark it for teacher review.",
      admin: "Summarize the provider boundary and audit data for this answer.",
    },
    headers: {
      assistant: {
        eyebrow: "CourseMind Assistant",
        title: "Introduction to AI",
        body: "Ask the course agent. Answers pass through RAG retrieval, model gateway, citations, and teacher review logging.",
      },
      materials: {
        eyebrow: "Knowledge Base",
        title: "Course materials",
        body: "This proves the ingestion boundary first. Real upload, parsing, chunking, and indexing come next.",
      },
      teacher: {
        eyebrow: "Teacher Review",
        title: "Teacher review",
        body: "Teacher corrections later become the source for school norms, rubrics, and teacher style.",
      },
      audit: {
        eyebrow: "Audit Trail",
        title: "Audit records",
        body: "The school can inspect answer sources, review actions, and material ingestion records.",
      },
    },
    seed: {
      user: "Should we build this course agent with RAG first, or fine-tune a model immediately?",
      assistant: "Start with RAG. Course material changes often, so the MVP should retrieve current course context, answer with citations, and send the response into teacher review before fine-tuning.",
      sources: ["Course syllabus", "Lecture 4: RAG and course Q&A"],
    },
    nav: {
      role: "Role",
      language: "Language",
      statusTitle: "Mock provider online",
      statusBody: "Dify/RAGFlow adapter boundary preserved",
    },
    assistant: {
      loading: "Loading course",
      askLabel: "Ask a course question",
      placeholder: "Ask about the selected course",
      send: "Send question",
      evidence: "Evidence",
      noEvidence: "Ask a question to show cited sources.",
      review: "Teacher review",
      provider: "Provider",
      pending: "Next answer will create a pending teacher review record.",
      couldNotLoad: "Could not load demo courses.",
      requestFailed: "Answer request failed",
      reviewFailed: "Teacher review update failed",
      contextReady: "Course context ready",
      traceTitle: "Retrieval path",
      thinking: "Retrieving course context",
    },
    courses: {
      overview: "Knowledge base overview",
      docs: "Docs",
      chunks: "Chunks",
      queue: "Queue",
      coverage: "Coverage",
      materialList: "Course material list",
      addMaterial: "Add course material",
      titleLabel: "Material title",
      titlePlaceholder: "Example: Lecture 5: Vector DB and retrieval evaluation",
      sourceType: "Source type",
      visibility: "Visibility",
      submit: "Create ingestion task",
      submitting: "Creating",
      created: "Course material ingestion task created.",
      createFailed: "Course material ingestion task failed",
    },
    teacher: {
      queueTitle: "Pending answers",
      empty: "No pending answers. Ask a question in the assistant workspace first.",
      approve: "Approve",
      correct: "Correct",
      reject: "Reject",
      correction: "Add one more classroom example before publishing.",
      correctionNotes: "Teacher requested a more concrete explanation.",
      rejectedNotes: "Rejected for the demo review workflow.",
    },
    audit: {
      empty: "No audit records yet.",
      target: "Target",
      eventTypes: {
        "agent.answer.created": "Agent answer created",
        "course_document.ingestion_requested": "Course material ingestion requested",
        "teacher_review.updated": "Teacher review updated",
      },
      governanceTitle: "Current governance path",
      governanceItems: [
        "Course material ingestion",
        "RAG gateway adapter",
        "Cited course answer",
        "Teacher review action",
        "Audit event record",
        "Dify/RAGFlow swappable",
      ],
    },
    sourceTypes: {
      pdf: "PDF",
      ppt: "Slides",
      word: "Word",
      markdown: "Markdown",
      web: "Web",
      transcript: "Transcript",
    },
    visibility: {
      student: "Student visible",
      teacher: "Teacher review",
      admin: "Admin",
    },
    statuses: {
      pending: "pending",
      indexed: "indexed",
      needs_review: "needs review",
      blocked: "blocked",
    },
  },
} satisfies Record<AppLocale, {
  appSubtitle: string;
  newChat: string;
  quickPrompts: string;
  currentCourse: string;
  providerPath: string;
  sideTitle: string;
  noChats: string;
  governance: string;
  closePanel: string;
  openPanel: string;
  panels: Record<WorkspacePanel, string>;
  roles: Record<CourseRole, string>;
  prompts: Record<CourseRole, string>;
  headers: Record<"assistant" | WorkspacePanel, { eyebrow: string; title: string; body: string }>;
  seed: { user: string; assistant: string; sources: string[] };
  nav: Record<string, string>;
  assistant: Record<string, string>;
  courses: Record<string, string>;
  teacher: Record<string, string>;
  audit: {
    empty: string;
    target: string;
    eventTypes: Record<AuditEvent["type"], string>;
    governanceTitle: string;
    governanceItems: string[];
  };
  sourceTypes: Record<CourseDocumentCreateRequest["sourceType"], string>;
  visibility: Record<CourseDocumentCreateRequest["visibility"], string>;
  statuses: Record<CourseDocument["ingestionStatus"], string>;
}>;

const courseTitles: Record<AppLocale, Record<string, string>> = {
  "zh-CN": {
    "ai-101": "人工智能导论",
    "data-201": "数据结构",
  },
  "en-US": {
    "ai-101": "Introduction to AI",
    "data-201": "Data Structures",
  },
};

const documentTitles: Record<AppLocale, Record<string, string>> = {
  "zh-CN": {
    "ai-syllabus": "课程大纲",
    "ai-rag-lecture": "第 4 讲：RAG 与课程问答",
    "ai-review-rubric": "教师审核标准草案",
    "data-tree-notes": "树与二叉树讲义",
    "data-lab-queue": "实验 2：栈和队列",
  },
  "en-US": {},
};

const fallbackCourseSummaries = [
  { id: "ai-101", documentCount: 3 },
  { id: "data-201", documentCount: 2 },
];

function getCourseTitle(course: CourseSnapshot["course"] | undefined, locale: AppLocale) {
  if (!course) {
    return courseTitles[locale]["ai-101"] ?? copy[locale].assistant.loading;
  }

  return courseTitles[locale][course.id] ?? course.title;
}

function getDocumentTitle(documentId: string, fallback: string, locale: AppLocale) {
  return documentTitles[locale][documentId] ?? fallback;
}

function toChatMessages(messages: ConversationMessage[], locale: AppLocale): ChatMessage[] {
  return messages
    .filter((message) => message.role !== "system")
    .map((message) => ({
      id: message.id,
      kind: message.role === "assistant" ? "assistant" : "user",
      text: message.content,
      sources: message.citations?.map((citation) => getDocumentTitle(citation.documentId, citation.title, locale)),
    }));
}

export default function CourseChatClient() {
  const [locale, setLocale] = useState<AppLocale>("zh-CN");
  const text = copy[locale];
  const [activePanel, setActivePanel] = useState<WorkspacePanel | null>(null);
  const [courses, setCourses] = useState<CourseSnapshot[]>([]);
  const [courseId, setCourseId] = useState("ai-101");
  const [role, setRole] = useState<CourseRole>("student");
  const [prompt, setPrompt] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [lastResponse, setLastResponse] = useState<AnswerResponse | null>(null);
  const [activeConversation, setActiveConversation] = useState<ConversationLogEntry | null>(null);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [conversationSummaries, setConversationSummaries] = useState<ConversationSummary[]>([]);
  const [reviewItems, setReviewItems] = useState<TeacherReviewQueueItem[]>([]);
  const [auditEvents, setAuditEvents] = useState<AuditEvent[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isCreatingDocument, setIsCreatingDocument] = useState(false);
  const [documentTitle, setDocumentTitle] = useState("");
  const [documentSourceType, setDocumentSourceType] = useState<CourseDocumentCreateRequest["sourceType"]>("pdf");
  const [documentVisibility, setDocumentVisibility] = useState<CourseDocumentCreateRequest["visibility"]>("student");
  const [documentNotice, setDocumentNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const selectedCourse = useMemo(
    () => courses.find((item) => item.course.id === courseId) ?? courses[0],
    [courseId, courses],
  );
  const visibleCitations = lastResponse?.citations ?? activeConversation?.citations ?? [];
  const pendingReviewCount = reviewItems.length;
  const selectedCourseTitle = getCourseTitle(selectedCourse?.course, locale);

  useEffect(() => {
    let mounted = true;

    async function loadInitialData() {
      const [courseResponse, reviewResponse, auditResponse, conversationResponse] = await Promise.all([
        fetch("/api/courses"),
        fetch("/api/teacher/reviews"),
        fetch("/api/audit/events"),
        fetch("/api/conversations"),
      ]);
      const courseData = (await courseResponse.json()) as { courses: CourseSnapshot[] };
      const reviewData = (await reviewResponse.json()) as TeacherReviewQueueResponse;
      const auditData = (await auditResponse.json()) as AuditEventListResponse;
      const conversationData = (await conversationResponse.json()) as ConversationListResponse;

      if (mounted) {
        setCourses(courseData.courses);
        setCourseId(courseData.courses[0]?.course.id ?? "ai-101");
        setReviewItems(reviewData.items);
        setAuditEvents(auditData.items);
        setConversationSummaries(conversationData.items);
      }
    }

    loadInitialData().catch(() => {
      if (mounted) {
        setError(text.assistant.couldNotLoad);
      }
    });

    return () => {
      mounted = false;
    };
  }, [text.assistant.couldNotLoad]);

  async function refreshReviewQueue() {
    const response = await fetch("/api/teacher/reviews");
    const data = (await response.json()) as TeacherReviewQueueResponse;
    setReviewItems(data.items);
  }

  async function refreshAuditEvents() {
    const response = await fetch("/api/audit/events");
    const data = (await response.json()) as AuditEventListResponse;
    setAuditEvents(data.items);
  }

  async function refreshConversations() {
    const response = await fetch("/api/conversations");
    const data = (await response.json()) as ConversationListResponse;
    setConversationSummaries(data.items);
  }

  function updateRole(nextRole: CourseRole) {
    setRole(nextRole);
  }

  function updateLocale(nextLocale: AppLocale) {
    setLocale(nextLocale);
    setPrompt("");
    setMessages([]);
    setLastResponse(null);
    setActiveConversation(null);
    setActiveConversationId(null);
    setDocumentNotice(null);
    setError(null);
  }

  function startNewQuestion() {
    setPrompt("");
    setMessages([]);
    setLastResponse(null);
    setActiveConversation(null);
    setActiveConversationId(null);
    setError(null);
    setActivePanel(null);
  }

  function togglePanel(panel: WorkspacePanel) {
    setActivePanel((current) => (current === panel ? null : panel));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!prompt.trim() || !selectedCourse) {
      return;
    }

    const question = prompt.trim();
    setIsLoading(true);
    setError(null);
    setMessages((current) => [...current, { id: `user-${Date.now()}`, kind: "user", text: question }]);

    try {
      const response = await fetch("/api/agent/answer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId: selectedCourse.course.id, role, question, locale }),
      });
      const data = (await response.json()) as AnswerResponse | { error: string };

      if (!response.ok || "error" in data) {
        throw new Error("error" in data ? data.error : text.assistant.requestFailed);
      }

      setLastResponse(data);
      setActiveConversation(null);
      setActiveConversationId(data.conversationId);
      setMessages((current) => [
        ...current,
        {
          id: data.answerMessage.id,
          kind: "assistant",
          text: data.answerMessage.content,
          sources: data.citations.map((citation) => getDocumentTitle(citation.documentId, citation.title, locale)),
        },
      ]);
      setPrompt("");
      await refreshConversations();
      await refreshReviewQueue();
      await refreshAuditEvents();
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : text.assistant.requestFailed);
    } finally {
      setIsLoading(false);
    }
  }

  async function loadConversation(conversationId: string) {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/conversations/${conversationId}`);
      const data = (await response.json()) as ConversationDetailResponse | { error: string };

      if (!response.ok || "error" in data) {
        throw new Error("error" in data ? data.error : text.assistant.requestFailed);
      }

      setActiveConversation(data.item);
      setActiveConversationId(data.item.conversationId);
      setCourseId(data.item.courseId);
      setRole(data.item.role);
      setPrompt("");
      setLastResponse(null);
      setMessages(toChatMessages(data.item.messages, locale));
      setActivePanel(null);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : text.assistant.requestFailed);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleCreateDocument(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!selectedCourse || !documentTitle.trim()) {
      return;
    }

    setIsCreatingDocument(true);
    setDocumentNotice(null);
    setError(null);

    try {
      const response = await fetch(`/api/courses/${selectedCourse.course.id}/documents`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: documentTitle.trim(),
          sourceType: documentSourceType,
          visibility: documentVisibility,
          actorUserId: "teacher-demo",
          locale,
        }),
      });
      const data = (await response.json()) as CourseDocumentCreateResponse | { error: string };

      if (!response.ok || "error" in data) {
        throw new Error("error" in data ? data.error : text.courses.createFailed);
      }

      setCourses((current) => current.map((item) => (item.course.id === data.snapshot.course.id ? data.snapshot : item)));
      setDocumentTitle("");
      setDocumentNotice(text.courses.created);
      await refreshAuditEvents();
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : text.courses.createFailed);
    } finally {
      setIsCreatingDocument(false);
    }
  }

  async function handleReviewAction(reviewId: string, action: TeacherReviewAction) {
    const response = await fetch(`/api/teacher/reviews/${reviewId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(action),
    });
    const data = (await response.json()) as { item?: TeacherReviewQueueItem; error?: string };

    if (!response.ok || data.error || !data.item) {
      setError(data.error ?? text.assistant.reviewFailed);
      return;
    }

    if (lastResponse?.review.id === reviewId) {
      setLastResponse((current) => current ? { ...current, review: data.item!.review } : current);
    }

    await refreshReviewQueue();
    await refreshAuditEvents();
  }

  return (
    <div className="chat-app">
      <CourseChatSidebar
        activePanel={activePanel}
        activeConversationId={activeConversationId}
        auditEventCount={auditEvents.length}
        conversationSummaries={conversationSummaries}
        courseId={courseId}
        courseTitles={courseTitles}
        courses={courses}
        fallbackCourseSummaries={fallbackCourseSummaries}
        getCourseTitle={getCourseTitle}
        locale={locale}
        locales={locales}
        pendingReviewCount={pendingReviewCount}
        role={role}
        selectedDocumentCount={selectedCourse?.documents.length ?? 0}
        setCourseId={setCourseId}
        loadConversation={loadConversation}
        startNewQuestion={startNewQuestion}
        text={text}
        togglePanel={togglePanel}
        updateLocale={updateLocale}
        updateRole={updateRole}
      />

      <main className={activePanel ? "chat-main panel-open" : "chat-main"}>
        <header className="chat-topbar">
          <div className="topbar-title">
            <p className="eyebrow">{text.headers.assistant.eyebrow}</p>
            <h1>{selectedCourseTitle}</h1>
            <span>{text.roles[role]} · {text.headers.assistant.body}</span>
          </div>
          <div className="topbar-actions">
            {(Object.keys(text.panels) as WorkspacePanel[]).map((panel) => {
              const Icon = panelIcons[panel];

              return (
                <button
                  className={activePanel === panel ? "tool-button active" : "tool-button"}
                  key={panel}
                  onClick={() => togglePanel(panel)}
                  type="button"
                  aria-label={`${text.openPanel}: ${text.panels[panel]}`}
                >
                  <Icon aria-hidden="true" />
                  <span>{text.panels[panel]}</span>
                </button>
              );
            })}
          </div>
        </header>

        <CourseChatConversation
          error={error}
          handleSubmit={handleSubmit}
          isLoading={isLoading}
          locale={locale}
          messages={messages}
          prompt={prompt}
          role={role}
          setPrompt={setPrompt}
          text={text}
        />
      </main>

      {activePanel ? (
        <aside className="course-panel" aria-label={text.panels[activePanel]}>
          <div className="panel-header">
            <div>
              <p className="eyebrow">{text.headers[activePanel].eyebrow}</p>
              <h2>{text.headers[activePanel].title}</h2>
              <span>{text.headers[activePanel].body}</span>
            </div>
            <button className="icon-button" onClick={() => setActivePanel(null)} type="button" aria-label={text.closePanel}>
              <X aria-hidden="true" />
            </button>
          </div>

          {activePanel === "materials" ? (
            <div className="panel-scroll">
              <section className="panel-card">
                <div className="panel-heading">
                  <h3>{text.courses.overview}</h3>
                  <span className="sync-badge">{selectedCourse?.coveragePercent ?? 0}%</span>
                </div>
                <div className="knowledge-meter">
                  <span style={{ width: `${selectedCourse?.coveragePercent ?? 0}%` }} />
                </div>
                <dl className="mini-stats">
                  <div>
                    <dt>{text.courses.docs}</dt>
                    <dd>{selectedCourse?.documents.length ?? 0}</dd>
                  </div>
                  <div>
                    <dt>{text.courses.chunks}</dt>
                    <dd>{selectedCourse?.indexedChunks.toLocaleString(locale) ?? 0}</dd>
                  </div>
                  <div>
                    <dt>{text.courses.queue}</dt>
                    <dd>{selectedCourse?.pendingReviewCount ?? 0}</dd>
                  </div>
                </dl>
              </section>

              <section className="panel-card">
                <form className="document-form" onSubmit={handleCreateDocument}>
                  <h3>{text.courses.addMaterial}</h3>
                  <label htmlFor="document-title">{text.courses.titleLabel}</label>
                  <input
                    id="document-title"
                    onChange={(event) => setDocumentTitle(event.target.value)}
                    placeholder={text.courses.titlePlaceholder}
                    value={documentTitle}
                  />
                  <div className="document-form-row">
                    <label>
                      <span>{text.courses.sourceType}</span>
                      <select onChange={(event) => setDocumentSourceType(event.target.value as CourseDocumentCreateRequest["sourceType"])} value={documentSourceType}>
                        {sourceTypes.map((sourceType) => (
                          <option key={sourceType} value={sourceType}>
                            {text.sourceTypes[sourceType]}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label>
                      <span>{text.courses.visibility}</span>
                      <select onChange={(event) => setDocumentVisibility(event.target.value as CourseDocumentCreateRequest["visibility"])} value={documentVisibility}>
                        {visibilityTypes.map((visibility) => (
                          <option key={visibility} value={visibility}>
                            {text.visibility[visibility]}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>
                  {documentNotice ? <p className="success-line">{documentNotice}</p> : null}
                  <button className="secondary-action" disabled={isCreatingDocument || !documentTitle.trim()} type="submit">
                    <FilePlus2 aria-hidden="true" />
                    {isCreatingDocument ? text.courses.submitting : text.courses.submit}
                  </button>
                </form>
              </section>

              <section className="panel-card">
                <div className="panel-heading">
                  <h3>{text.courses.materialList}</h3>
                  <Upload aria-hidden="true" />
                </div>
                <div className="document-list">
                  {(selectedCourse?.documents ?? []).map((document) => (
                    <article key={document.id}>
                      <div>
                        <strong>{getDocumentTitle(document.id, document.title, locale)}</strong>
                        <span>{text.sourceTypes[document.sourceType]} · {text.visibility[document.visibility]}</span>
                      </div>
                      <span className="status-chip">{text.statuses[document.ingestionStatus]}</span>
                    </article>
                  ))}
                </div>
              </section>
            </div>
          ) : null}

          {activePanel === "teacher" ? (
            <div className="panel-scroll">
              <section className="panel-card">
                <div className="panel-heading">
                  <h3>{text.teacher.queueTitle}</h3>
                  <span className="sync-badge">{pendingReviewCount}</span>
                </div>
                {reviewItems.length > 0 ? (
                  <div className="review-list">
                    {reviewItems.map((item) => (
                      <article key={item.review.id}>
                        <div>
                          <strong>{getCourseTitle(item.course, locale)}</strong>
                          <p>{item.answerMessage.content}</p>
                          <div className="source-list">
                            {item.citations.map((citation) => (
                              <button key={citation.documentId} type="button">
                                {getDocumentTitle(citation.documentId, citation.title, locale)}
                              </button>
                            ))}
                          </div>
                        </div>
                        <div className="review-actions">
                          <button onClick={() => handleReviewAction(item.review.id, { status: "approved", reviewerUserId: "teacher-demo" })} type="button">
                            <Check aria-hidden="true" />
                            {text.teacher.approve}
                          </button>
                          <button
                            onClick={() =>
                              handleReviewAction(item.review.id, {
                                status: "corrected",
                                reviewerUserId: "teacher-demo",
                                correction: text.teacher.correction,
                                rubricNotes: text.teacher.correctionNotes,
                              })
                            }
                            type="button"
                          >
                            {text.teacher.correct}
                          </button>
                          <button
                            onClick={() =>
                              handleReviewAction(item.review.id, {
                                status: "rejected",
                                reviewerUserId: "teacher-demo",
                                rubricNotes: text.teacher.rejectedNotes,
                              })
                            }
                            type="button"
                          >
                            <X aria-hidden="true" />
                            {text.teacher.reject}
                          </button>
                        </div>
                      </article>
                    ))}
                  </div>
                ) : (
                  <p className="muted-copy">{text.teacher.empty}</p>
                )}
              </section>

              <section className="panel-card">
                <div className="panel-heading">
                  <h3>{text.assistant.evidence}</h3>
                  <ShieldCheck aria-hidden="true" />
                </div>
                {visibleCitations.length > 0 ? (
                  <ol className="citation-list">
                    {visibleCitations.map((citation) => (
                      <li key={citation.documentId}>
                        <strong>{getDocumentTitle(citation.documentId, citation.title, locale)}</strong>
                        <span>{citation.excerpt ?? citation.locator}</span>
                      </li>
                    ))}
                  </ol>
                ) : (
                  <p className="muted-copy">{text.assistant.noEvidence}</p>
                )}
              </section>
            </div>
          ) : null}

          {activePanel === "audit" ? (
            <div className="panel-scroll">
              <section className="panel-card">
                <div className="panel-heading">
                  <h3>{text.audit.governanceTitle}</h3>
                  <PanelRightOpen aria-hidden="true" />
                </div>
                <ul className="roadmap-list">
                  {text.audit.governanceItems.map((item, index) => (
                    <li className={index < 5 ? "done" : "active"} key={item}>
                      {item}
                    </li>
                  ))}
                </ul>
              </section>

              <section className="panel-card">
                <div className="panel-heading">
                  <h3>{text.headers.audit.title}</h3>
                  <span className="sync-badge">{auditEvents.length}</span>
                </div>
                {auditEvents.length > 0 ? (
                  <ul className="audit-list">
                    {auditEvents.map((event) => (
                      <li key={event.id}>
                        <strong>{text.audit.eventTypes[event.type]}</strong>
                        <span>{event.summary}</span>
                        <small>{text.audit.target}: {event.targetType}</small>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="muted-copy">{text.audit.empty}</p>
                )}
              </section>
            </div>
          ) : null}
        </aside>
      ) : null}
    </div>
  );
}
