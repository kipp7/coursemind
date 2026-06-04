"use client";

import type {
  AppLocale,
  AuditEvent,
  AuditEventListResponse,
  AnswerResponse,
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
  ArrowRight,
  BarChart3,
  Check,
  FilePlus2,
  Languages,
  Library,
  MessagesSquare,
  Send,
  ShieldCheck,
  SlidersHorizontal,
  Upload,
  X,
} from "lucide-react";
import { FormEvent, useEffect, useMemo, useState } from "react";

type WorkspaceView = "assistant" | "courses" | "teacher" | "audit";

type ChatMessage = {
  id: string;
  kind: "user" | "assistant";
  text: string;
  sources?: string[];
};

const locales: AppLocale[] = ["zh-CN", "en-US"];
const sourceTypes: CourseDocumentCreateRequest["sourceType"][] = ["pdf", "ppt", "word", "markdown", "web", "transcript"];
const visibilityTypes: CourseDocumentCreateRequest["visibility"][] = ["student", "teacher", "admin"];

const viewIcons = {
  assistant: MessagesSquare,
  courses: Library,
  teacher: SlidersHorizontal,
  audit: BarChart3,
};

const copy = {
  "zh-CN": {
    appSubtitle: "学校课程智能体 MVP",
    newChat: "新的课程问题",
    quickPrompts: "示例问题",
    currentCourse: "当前课程",
    providerPath: "Next.js API -> RAG Gateway -> Model Gateway",
    views: {
      assistant: "课程问答",
      courses: "课程资料",
      teacher: "教师审核",
      audit: "审计记录",
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
        title: "带引用的课程问答工作台",
        body: "学生提问、RAG 检索、模型回答、教师审核和审计链路集中在一个可演示的课程空间里。",
      },
      courses: {
        eyebrow: "Knowledge Base",
        title: "课程资料入库任务",
        body: "这里先做元数据级入库，后续替换为真实文件上传、解析、切片和索引。",
      },
      teacher: {
        eyebrow: "Teacher Review",
        title: "教师审核队列",
        body: "教师修正会成为后续固化学校规范、评分标准和老师风格的数据来源。",
      },
      audit: {
        eyebrow: "Audit Trail",
        title: "治理审计记录",
        body: "审计记录帮助学校知道每条回答从哪里来、谁审核过、哪些资料进入过知识库。",
      },
    },
    seed: {
      user: "我们应该先用 RAG 做课程智能体，还是马上微调一个模型？",
      assistant: "先做 RAG。课程资料变化快，MVP 应该先检索当前课程上下文，带引用回答，并把结果送入教师审核；微调等有真实审核数据后再做。",
      sources: ["课程大纲", "第 4 讲：RAG 与课程问答"],
    },
    nav: {
      course: "课程空间",
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
      guardrails: "回答护栏",
      review: "教师审核",
      provider: "Provider",
      pending: "下一次回答会创建一条待教师审核记录。",
      couldNotLoad: "无法加载演示课程。",
      requestFailed: "回答请求失败",
      reviewFailed: "教师审核更新失败",
      contextReady: "课程上下文已就绪",
      traceTitle: "检索链路",
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
        "Dify provider 骨架",
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
    newChat: "New course question",
    quickPrompts: "Suggested prompts",
    currentCourse: "Current course",
    providerPath: "Next.js API -> RAG Gateway -> Model Gateway",
    views: {
      assistant: "Assistant",
      courses: "Materials",
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
        title: "Cited course Q&A workspace",
        body: "Student questions, RAG retrieval, model answers, teacher review, and audit records are kept in one demo course space.",
      },
      courses: {
        eyebrow: "Knowledge Base",
        title: "Course material ingestion",
        body: "This is metadata-level ingestion first. Real file upload, parsing, chunking, and indexing come next.",
      },
      teacher: {
        eyebrow: "Teacher Review",
        title: "Teacher review queue",
        body: "Teacher corrections later become the source for school norms, rubrics, and teacher style.",
      },
      audit: {
        eyebrow: "Audit Trail",
        title: "Governance audit records",
        body: "Audit records help the school inspect where answers came from and who reviewed them.",
      },
    },
    seed: {
      user: "Should we build this course agent with RAG first, or fine-tune a model immediately?",
      assistant: "Start with RAG. Course material changes often, so the MVP should retrieve current course context, answer with citations, and send the response into teacher review before fine-tuning.",
      sources: ["Course syllabus", "Lecture 4: RAG and course Q&A"],
    },
    nav: {
      course: "Course space",
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
      guardrails: "Guardrails",
      review: "Teacher review",
      provider: "Provider",
      pending: "Next answer will create a pending teacher review record.",
      couldNotLoad: "Could not load demo courses.",
      requestFailed: "Answer request failed",
      reviewFailed: "Teacher review update failed",
      contextReady: "Course context ready",
      traceTitle: "Retrieval path",
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
        "Dify provider skeleton",
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
  views: Record<WorkspaceView, string>;
  roles: Record<CourseRole, string>;
  prompts: Record<CourseRole, string>;
  headers: Record<WorkspaceView, { eyebrow: string; title: string; body: string }>;
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

function createSeedMessages(locale: AppLocale): ChatMessage[] {
  const text = copy[locale];

  return [
    { id: `seed-user-${locale}`, kind: "user", text: text.seed.user },
    { id: `seed-assistant-${locale}`, kind: "assistant", text: text.seed.assistant, sources: text.seed.sources },
  ];
}

function getCourseTitle(course: CourseSnapshot["course"] | undefined, locale: AppLocale) {
  if (!course) {
    return courseTitles[locale]["ai-101"] ?? copy[locale].assistant.loading;
  }

  return courseTitles[locale][course.id] ?? course.title;
}

function getDocumentTitle(documentId: string, fallback: string, locale: AppLocale) {
  return documentTitles[locale][documentId] ?? fallback;
}

export default function Home() {
  const [locale, setLocale] = useState<AppLocale>("zh-CN");
  const text = copy[locale];
  const [activeView, setActiveView] = useState<WorkspaceView>("assistant");
  const [courses, setCourses] = useState<CourseSnapshot[]>([]);
  const [courseId, setCourseId] = useState("ai-101");
  const [role, setRole] = useState<CourseRole>("student");
  const [prompt, setPrompt] = useState(text.prompts.student);
  const [messages, setMessages] = useState<ChatMessage[]>(() => createSeedMessages(locale));
  const [lastResponse, setLastResponse] = useState<AnswerResponse | null>(null);
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
  const header = text.headers[activeView];
  const visibleCitations = lastResponse?.citations ?? [];

  useEffect(() => {
    let mounted = true;

    async function loadInitialData() {
      const [courseResponse, reviewResponse, auditResponse] = await Promise.all([
        fetch("/api/courses"),
        fetch("/api/teacher/reviews"),
        fetch("/api/audit/events"),
      ]);
      const courseData = (await courseResponse.json()) as { courses: CourseSnapshot[] };
      const reviewData = (await reviewResponse.json()) as TeacherReviewQueueResponse;
      const auditData = (await auditResponse.json()) as AuditEventListResponse;

      if (mounted) {
        setCourses(courseData.courses);
        setCourseId(courseData.courses[0]?.course.id ?? "ai-101");
        setReviewItems(reviewData.items);
        setAuditEvents(auditData.items);
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

  function updateRole(nextRole: CourseRole) {
    setRole(nextRole);
    setPrompt(text.prompts[nextRole]);
  }

  function updateLocale(nextLocale: AppLocale) {
    setLocale(nextLocale);
    setPrompt(copy[nextLocale].prompts[role]);
    setMessages(createSeedMessages(nextLocale));
    setLastResponse(null);
    setDocumentNotice(null);
    setError(null);
  }

  function startNewQuestion() {
    setActiveView("assistant");
    setPrompt(text.prompts[role]);
    setMessages(createSeedMessages(locale));
    setLastResponse(null);
    setError(null);
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
      await refreshReviewQueue();
      await refreshAuditEvents();
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
      <aside className="chat-sidebar">
        <div className="brand">
          <div className="brand-mark">CM</div>
          <div>
            <strong>CourseMind</strong>
            <span>{text.appSubtitle}</span>
          </div>
        </div>

        <button className="new-chat-button" onClick={startNewQuestion} type="button">
          <MessagesSquare aria-hidden="true" />
          <span>{text.newChat}</span>
        </button>

        <section className="sidebar-section">
          <p>{text.currentCourse}</p>
          <div className="course-list">
            {courses.length > 0
              ? courses.map((item) => (
                  <button
                    className={courseId === item.course.id ? "course-item active" : "course-item"}
                    key={item.course.id}
                    onClick={() => setCourseId(item.course.id)}
                    type="button"
                  >
                    <span>{getCourseTitle(item.course, locale)}</span>
                    <small>{item.documents.length} docs</small>
                  </button>
                ))
              : fallbackCourseSummaries.map((item) => (
                  <button
                    className={courseId === item.id ? "course-item active" : "course-item"}
                    key={item.id}
                    onClick={() => setCourseId(item.id)}
                    type="button"
                  >
                    <span>{courseTitles[locale][item.id]}</span>
                    <small>{item.documentCount} docs</small>
                  </button>
                ))}
          </div>
        </section>

        <section className="sidebar-section">
          <p>Workspace</p>
          <nav className="nav-stack" aria-label="Workspace">
            {(Object.keys(text.views) as WorkspaceView[]).map((view) => {
              const Icon = viewIcons[view];
              const count = view === "teacher" ? reviewItems.length : view === "audit" ? auditEvents.length : undefined;

              return (
                <button
                  className={activeView === view ? "nav-item active" : "nav-item"}
                  key={view}
                  onClick={() => setActiveView(view)}
                  type="button"
                >
                  <Icon aria-hidden="true" />
                  <span>{text.views[view]}</span>
                  {count !== undefined ? <small>{count}</small> : null}
                </button>
              );
            })}
          </nav>
        </section>

        <div className="sidebar-controls">
          <div className="role-switcher" aria-label={text.nav.role}>
            {(["student", "teacher", "admin"] as CourseRole[]).map((item) => (
              <button className={role === item ? "role-tab active" : "role-tab"} key={item} onClick={() => updateRole(item)} type="button">
                {text.roles[item]}
              </button>
            ))}
          </div>

          <div className="locale-switcher" aria-label={text.nav.language}>
            <Languages aria-hidden="true" />
            {locales.map((item) => (
              <button className={locale === item ? "locale-tab active" : "locale-tab"} key={item} onClick={() => updateLocale(item)} type="button">
                {item === "zh-CN" ? "中文" : "English"}
              </button>
            ))}
          </div>
        </div>
      </aside>

      <main className="chat-main">
        <header className="chat-topbar">
          <div>
            <p className="eyebrow">{header.eyebrow}</p>
            <h1>{header.title}</h1>
            <span>{getCourseTitle(selectedCourse?.course, locale)} · {text.roles[role]}</span>
          </div>
          <button className="primary-action" onClick={() => setActiveView("courses")} type="button">
            <Upload aria-hidden="true" />
            {text.views.courses}
          </button>
        </header>

        <nav className="mobile-view-tabs" aria-label="Mobile workspace">
          {(Object.keys(text.views) as WorkspaceView[]).map((view) => {
            const Icon = viewIcons[view];

            return (
              <button
                className={activeView === view ? "mobile-view-tab active" : "mobile-view-tab"}
                key={view}
                onClick={() => setActiveView(view)}
                type="button"
              >
                <Icon aria-hidden="true" />
                <span>{text.views[view]}</span>
              </button>
            );
          })}
        </nav>

        {activeView === "assistant" ? (
          <section className="conversation-shell">
            <div className="conversation-scroll" aria-live="polite">
              <div className="welcome-panel">
                <span>{text.assistant.contextReady}</span>
                <h2>{header.body}</h2>
                <div className="quick-prompts" aria-label={text.quickPrompts}>
                  {(["student", "teacher", "admin"] as CourseRole[]).map((item) => (
                    <button key={item} onClick={() => setPrompt(text.prompts[item])} type="button">
                      {text.roles[item]}
                    </button>
                  ))}
                </div>
              </div>

              {messages.map((message) => (
                <article className={message.kind === "user" ? "message user-message" : "message assistant-message"} key={message.id}>
                  <div className="message-avatar">{message.kind === "user" ? text.roles[role].slice(0, 1) : "CM"}</div>
                  <div className="message-body">
                    <span>{message.kind === "user" ? text.roles[role] : "CourseMind"}</span>
                    <p>{message.text}</p>
                    {message.sources ? (
                      <div className="source-list">
                        {message.sources.map((source) => (
                          <button key={source} type="button">
                            {source}
                          </button>
                        ))}
                      </div>
                    ) : null}
                  </div>
                </article>
              ))}

              {isLoading ? (
                <article className="message assistant-message">
                  <div className="message-avatar">CM</div>
                  <div className="message-body">
                    <span>CourseMind</span>
                    <p className="thinking">Retrieving course context</p>
                  </div>
                </article>
              ) : null}
            </div>

            {error ? <p className="error-line">{error}</p> : null}

            <form className="composer" onSubmit={handleSubmit}>
              <textarea
                aria-label={text.assistant.askLabel}
                onChange={(event) => setPrompt(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && !event.shiftKey) {
                    event.preventDefault();
                    event.currentTarget.form?.requestSubmit();
                  }
                }}
                placeholder={text.assistant.placeholder}
                rows={3}
                value={prompt}
              />
              <div className="composer-footer">
                <span>{text.providerPath}</span>
                <button className="send-button" disabled={isLoading || !prompt.trim()} type="submit" aria-label={text.assistant.send}>
                  <Send aria-hidden="true" />
                </button>
              </div>
            </form>
          </section>
        ) : null}

        {activeView === "courses" ? (
          <section className="workspace-board">
            <div className="section-heading">
              <div>
                <p className="eyebrow">{header.eyebrow}</p>
                <h2>{header.body}</h2>
              </div>
              <span className="sync-badge">{selectedCourse?.documents.length ?? 0}</span>
            </div>
            <div className="document-table">
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
        ) : null}

        {activeView === "teacher" ? (
          <section className="workspace-board">
            <div className="section-heading">
              <div>
                <p className="eyebrow">{header.eyebrow}</p>
                <h2>{header.body}</h2>
              </div>
              <span className="sync-badge">{reviewItems.length}</span>
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
        ) : null}

        {activeView === "audit" ? (
          <section className="workspace-board">
            <div className="section-heading">
              <div>
                <p className="eyebrow">{header.eyebrow}</p>
                <h2>{header.body}</h2>
              </div>
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
        ) : null}
      </main>

      <aside className="inspector-rail">
        {activeView === "courses" ? (
          <section className="inspector-block">
            <form className="document-form" onSubmit={handleCreateDocument}>
              <h2>{text.courses.addMaterial}</h2>
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
        ) : (
          <>
            <section className="inspector-block">
              <div className="panel-heading">
                <h2>{text.assistant.evidence}</h2>
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

            <section className="inspector-block trace-block">
              <h2>{text.assistant.review}</h2>
              <p>{lastResponse?.review.rubricNotes ?? text.assistant.pending}</p>
              <span>{lastResponse ? `${text.assistant.provider}: ${lastResponse.ragTrace.provider}` : `${text.assistant.provider}: mock`}</span>
            </section>
          </>
        )}

        <section className="inspector-block">
          <h2>{activeView === "courses" ? text.courses.overview : text.audit.governanceTitle}</h2>
          {activeView === "courses" ? (
            <>
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
            </>
          ) : (
            <ul className="roadmap-list">
              {text.audit.governanceItems.map((item, index) => (
                <li className={index < 5 ? "done" : "active"} key={item}>
                  {item}
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="architecture-band" aria-label="Architecture">
          {["Next.js Web", "API", "RAG Gateway", "Model Gateway"].map((item, index) => (
            <span className="architecture-flow-item" key={item}>
              {index > 0 ? <ArrowRight aria-hidden="true" /> : null}
              <span>{item}</span>
            </span>
          ))}
        </section>
      </aside>
    </div>
  );
}
