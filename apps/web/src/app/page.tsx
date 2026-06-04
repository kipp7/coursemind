"use client";

import type {
  AppLocale,
  AuditEvent,
  AuditEventListResponse,
  AnswerResponse,
  CourseDocument,
  CourseRole,
  CourseSnapshot,
  TeacherReviewAction,
  TeacherReviewQueueResponse,
} from "@coursemind/contracts";
import {
  ArrowRight,
  BarChart3,
  ExternalLink,
  Languages,
  Library,
  MessagesSquare,
  Play,
  Send,
  ShieldCheck,
  SlidersHorizontal,
  Upload,
  WandSparkles,
} from "lucide-react";
import { FormEvent, useEffect, useMemo, useState } from "react";

type ChatMessage = {
  id: string;
  kind: "user" | "assistant";
  text: string;
  sources?: string[];
};

type NavItem = {
  id: string;
  label: string;
  icon: typeof MessagesSquare;
};

const locales: AppLocale[] = ["zh-CN", "en-US"];

const copy = {
  "zh-CN": {
    appSubtitle: "学校课程智能体 MVP",
    nav: {
      assistant: "课程问答",
      courses: "课程空间",
      teacher: "教师审核",
      analytics: "审计记录",
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
    seed: {
      user: "我们应该先用 RAG 做课程智能体，还是马上微调一个模型？",
      assistant:
        "先做 RAG。课程资料变化快，MVP 应该先检索当前课程上下文，带引用回答，并把结果送入教师审核；微调等有真实审核数据后再做。",
      sources: ["课程大纲", "第 4 讲：RAG 与课程问答"],
    },
    status: {
      title: "Mock provider 已连接",
      body: "Dify/RAGFlow 适配器边界已保留",
    },
    top: {
      eyebrow: "纵向闭环",
      title: "基于课程资料提问、带引用回答，并进入教师审核。",
      upload: "上传课程资料",
      run: "运行演示",
      language: "语言",
    },
    hero: {
      eyebrow: "面向学校交付",
      title: "Web 前端先调用我们自己的 API，再由 API 对接 RAG 和模型 provider。",
      body: "第一个 MVP 就把学生、教师、引用、审核、审计和 provider 替换能力摆在明面上，而不是塞进一段提示词里。",
    },
    assistant: {
      eyebrow: "课程问答",
      loading: "课程加载中",
      role: "角色",
      placeholder: "向当前课程提问",
      askLabel: "输入课程问题",
      send: "发送问题",
      guardrails: "应用护栏",
      couldNotLoad: "无法加载演示课程。",
      requestFailed: "回答请求失败",
      reviewFailed: "教师审核更新失败",
    },
    evidence: {
      title: "回答依据",
      view: "查看引用",
      fallback: "已检索课程证据",
    },
    knowledge: {
      title: "知识库",
      indexed: "已索引",
      docs: "资料",
      chunks: "切片",
      queue: "队列",
    },
    governance: {
      title: "治理链路",
      items: [
        "Web 调用 CourseMind API",
        "共享 DTO 合约",
        "RAG gateway 适配器",
        "教师审核持久化边界",
        "审计事件边界",
        "Dify provider 骨架",
      ],
    },
    audit: {
      title: "审计事件",
      emptyTitle: "暂无事件",
      emptyBody: "提一个问题后会生成第一条审计记录。",
      eventTypes: {
        "agent.answer.created": "智能体回答已创建",
        "teacher_review.updated": "教师审核已更新",
      },
    },
    review: {
      title: "审核状态",
      pending: "下一次回答会创建一条待教师审核记录。",
      provider: "Provider",
      actions: "教师审核动作",
      approve: "通过",
      correct: "修正",
      reject: "驳回",
      correction: "发布前再补充一个课堂例子。",
      correctionNotes: "教师要求解释更具体。",
      rejectedNotes: "演示审核流程：教师驳回了这条回答。",
    },
    architecture: {
      eyebrow: "技术架构",
      title: "底层开源工具可以替换，学校业务边界必须握在我们自己手里。",
      flow: ["Next.js Web", "应用 API", "RAG Gateway", "模型 Gateway"],
    },
  },
  "en-US": {
    appSubtitle: "School course agent MVP",
    nav: {
      assistant: "Assistant",
      courses: "Courses",
      teacher: "Teacher review",
      analytics: "Audit trail",
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
    seed: {
      user: "Should we build this course agent with RAG first, or fine-tune a model immediately?",
      assistant:
        "Start with RAG. Course material changes often, so the MVP should retrieve current course context, answer with citations, and send the response into teacher review before any fine-tuning work.",
      sources: ["Course syllabus", "Lecture 4: RAG and course Q&A"],
    },
    status: {
      title: "Mock provider online",
      body: "Dify/RAGFlow adapter boundary preserved",
    },
    top: {
      eyebrow: "Vertical slice",
      title: "Ask with course context, cite the answer, queue teacher review.",
      upload: "Upload course material",
      run: "Run demo",
      language: "Language",
    },
    hero: {
      eyebrow: "School-ready from day one",
      title: "Our Web app calls our API first, then the API talks to RAG and model providers.",
      body: "The first MVP keeps student, teacher, citation, review, audit, and provider-swap concerns visible instead of hiding them in prompt text.",
    },
    assistant: {
      eyebrow: "Course Q&A",
      loading: "Loading course",
      role: "Role",
      placeholder: "Ask a question about the selected course",
      askLabel: "Ask a course question",
      send: "Send question",
      guardrails: "Apply guardrails",
      couldNotLoad: "Could not load demo courses.",
      requestFailed: "Answer request failed",
      reviewFailed: "Teacher review update failed",
    },
    evidence: {
      title: "Answer evidence",
      view: "View citations",
      fallback: "Retrieved course evidence",
    },
    knowledge: {
      title: "Knowledge base",
      indexed: "Indexed",
      docs: "Docs",
      chunks: "Chunks",
      queue: "Queue",
    },
    governance: {
      title: "Governance trace",
      items: [
        "Web calls CourseMind API",
        "Shared DTO contracts",
        "RAG gateway adapter",
        "Teacher review persistence",
        "Audit event boundary",
        "Dify provider skeleton",
      ],
    },
    audit: {
      title: "Audit events",
      emptyTitle: "No events yet",
      emptyBody: "Ask a question to create the first audit record.",
      eventTypes: {
        "agent.answer.created": "Agent answer created",
        "teacher_review.updated": "Teacher review updated",
      },
    },
    review: {
      title: "Review status",
      pending: "Next answer will create a pending teacher review record.",
      provider: "Provider",
      actions: "Teacher review actions",
      approve: "Approve",
      correct: "Correct",
      reject: "Reject",
      correction: "Add one more classroom example before publishing.",
      correctionNotes: "Teacher requested a more concrete explanation.",
      rejectedNotes: "Rejected for the demo review workflow.",
    },
    architecture: {
      eyebrow: "Architecture",
      title: "Provider tools can change. The school business boundary stays ours.",
      flow: ["Next.js Web", "Application API", "RAG Gateway", "Model Gateway"],
    },
  },
} satisfies Record<AppLocale, Record<string, unknown>>;

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

const documentStatuses: Record<AppLocale, Record<CourseDocument["ingestionStatus"], string>> = {
  "zh-CN": {
    pending: "待处理",
    indexed: "已索引",
    needs_review: "待审核",
    blocked: "已阻止",
  },
  "en-US": {
    pending: "pending",
    indexed: "indexed",
    needs_review: "needs review",
    blocked: "blocked",
  },
};

function createSeedMessages(locale: AppLocale): ChatMessage[] {
  const text = copy[locale];

  return [
    {
      id: `seed-user-${locale}`,
      kind: "user",
      text: text.seed.user,
    },
    {
      id: `seed-assistant-${locale}`,
      kind: "assistant",
      text: text.seed.assistant,
      sources: text.seed.sources,
    },
  ];
}

function getCourseTitle(course: CourseSnapshot["course"] | undefined, locale: AppLocale) {
  if (!course) {
    return copy[locale].assistant.loading;
  }

  return courseTitles[locale][course.id] ?? course.title;
}

function getDocumentTitle(documentId: string, fallback: string, locale: AppLocale) {
  return documentTitles[locale][documentId] ?? fallback;
}

export default function Home() {
  const [locale, setLocale] = useState<AppLocale>("zh-CN");
  const text = copy[locale];
  const [activeNav, setActiveNav] = useState("assistant");
  const [courses, setCourses] = useState<CourseSnapshot[]>([]);
  const [courseId, setCourseId] = useState("ai-101");
  const [role, setRole] = useState<CourseRole>("student");
  const [prompt, setPrompt] = useState(text.prompts.student);
  const [messages, setMessages] = useState<ChatMessage[]>(() => createSeedMessages(locale));
  const [lastResponse, setLastResponse] = useState<AnswerResponse | null>(null);
  const [auditEvents, setAuditEvents] = useState<AuditEvent[]>([]);
  const [reviewQueueCount, setReviewQueueCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const navItems: NavItem[] = useMemo(
    () => [
      { id: "assistant", label: text.nav.assistant, icon: MessagesSquare },
      { id: "courses", label: text.nav.courses, icon: Library },
      { id: "teacher", label: text.nav.teacher, icon: SlidersHorizontal },
      { id: "analytics", label: text.nav.analytics, icon: BarChart3 },
    ],
    [text],
  );

  useEffect(() => {
    let mounted = true;

    async function loadCourses() {
      const response = await fetch("/api/courses");
      const data = (await response.json()) as { courses: CourseSnapshot[] };

      if (mounted) {
        setCourses(data.courses);
        setCourseId(data.courses[0]?.course.id ?? "ai-101");
      }
    }

    loadCourses().catch(() => {
      if (mounted) {
        setError(text.assistant.couldNotLoad);
      }
    });
    refreshAuditEvents().catch(() => {
      if (mounted) {
        setAuditEvents([]);
      }
    });

    return () => {
      mounted = false;
    };
  }, [text.assistant.couldNotLoad]);

  async function refreshReviewQueue() {
    const response = await fetch("/api/teacher/reviews");
    const data = (await response.json()) as TeacherReviewQueueResponse;
    setReviewQueueCount(data.items.length);
  }

  async function refreshAuditEvents() {
    const response = await fetch("/api/audit/events");
    const data = (await response.json()) as AuditEventListResponse;
    setAuditEvents(data.items);
  }

  async function handleReviewAction(action: TeacherReviewAction) {
    if (!lastResponse) {
      return;
    }

    const response = await fetch(`/api/teacher/reviews/${lastResponse.review.id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(action),
    });
    const data = (await response.json()) as { item?: { review: AnswerResponse["review"] }; error?: string };

    if (!response.ok || data.error || !data.item) {
      setError(data.error ?? text.assistant.reviewFailed);
      return;
    }

    const updatedReview = data.item.review;

    setLastResponse((current) => current ? { ...current, review: updatedReview } : current);
    await refreshReviewQueue();
    await refreshAuditEvents();
  }

  const selectedCourse = useMemo(
    () => courses.find((item) => item.course.id === courseId) ?? courses[0],
    [courseId, courses],
  );
  const evidenceItems = useMemo(() => {
    if (lastResponse) {
      return lastResponse.citations.map((citation) => ({
        id: citation.documentId,
        title: getDocumentTitle(citation.documentId, citation.title, locale),
        detail: citation.excerpt ?? citation.locator ?? text.evidence.fallback,
      }));
    }

    return (selectedCourse?.documents.slice(0, 3) ?? []).map((document) => ({
      id: document.id,
      title: getDocumentTitle(document.id, document.title, locale),
      detail: documentStatuses[locale][document.ingestionStatus],
    }));
  }, [lastResponse, locale, selectedCourse, text.evidence.fallback]);

  function updateRole(nextRole: CourseRole) {
    setRole(nextRole);
    setPrompt(text.prompts[nextRole]);
  }

  function updateLocale(nextLocale: AppLocale) {
    setLocale(nextLocale);
    setPrompt(copy[nextLocale].prompts[role]);
    setMessages(createSeedMessages(nextLocale));
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
    setMessages((current) => [
      ...current,
      { id: `user-${Date.now()}`, kind: "user", text: question },
    ]);

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
      await refreshReviewQueue();
      await refreshAuditEvents();
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
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : text.assistant.requestFailed);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark">CM</div>
          <div>
            <strong>CourseMind</strong>
            <span>{text.appSubtitle}</span>
          </div>
        </div>

        <nav className="nav-stack" aria-label={text.top.language}>
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                className={activeNav === item.id ? "nav-item active" : "nav-item"}
                key={item.id}
                onClick={() => setActiveNav(item.id)}
                type="button"
              >
                <Icon aria-hidden="true" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="course-switcher">
          <label htmlFor="course-select">{text.nav.courses}</label>
          <select id="course-select" value={courseId} onChange={(event) => setCourseId(event.target.value)}>
            {courses.map((item) => (
              <option key={item.course.id} value={item.course.id}>
                {getCourseTitle(item.course, locale)}
              </option>
            ))}
          </select>
        </div>

        <div className="role-switcher" aria-label={text.assistant.role}>
          {(["student", "teacher", "admin"] as CourseRole[]).map((item) => (
            <button
              className={role === item ? "role-tab active" : "role-tab"}
              key={item}
              onClick={() => updateRole(item)}
              type="button"
            >
              {text.roles[item]}
            </button>
          ))}
        </div>

        <div className="locale-switcher" aria-label={text.top.language}>
          <Languages aria-hidden="true" />
          {locales.map((item) => (
            <button
              className={locale === item ? "locale-tab active" : "locale-tab"}
              key={item}
              onClick={() => updateLocale(item)}
              type="button"
            >
              {item === "zh-CN" ? "中文" : "English"}
            </button>
          ))}
        </div>

        <div className="status-panel">
          <span className="status-dot" />
          <div>
            <strong>{text.status.title}</strong>
            <span>{text.status.body}</span>
          </div>
        </div>
      </aside>

      <main className="workspace">
        <header className="topbar">
          <div>
            <p className="eyebrow">{text.top.eyebrow}</p>
            <h1>{text.top.title}</h1>
          </div>
          <div className="top-actions">
            <button className="icon-button" title={text.top.upload} type="button" aria-label={text.top.upload}>
              <Upload aria-hidden="true" />
            </button>
            <button className="primary-action" type="button">
              <Play aria-hidden="true" />
              {text.top.run}
            </button>
          </div>
        </header>

        <section className="hero-strip" aria-label="CourseMind overview">
          <div className="hero-overlay">
            <div>
              <p className="eyebrow light">{text.hero.eyebrow}</p>
              <h2>{text.hero.title}</h2>
            </div>
            <p>{text.hero.body}</p>
          </div>
        </section>

        <section className="content-grid">
          <div className="assistant-panel">
            <div className="panel-heading">
              <div>
                <p className="eyebrow">{text.assistant.eyebrow}</p>
                <h2>{getCourseTitle(selectedCourse?.course, locale)}</h2>
              </div>
              <span className="model-badge">
                {text.assistant.role}: {text.roles[role]}
              </span>
            </div>

            <div className="chat-feed" aria-live="polite">
              {messages.map((message) => (
                <article
                  className={message.kind === "user" ? "message user-message" : "message assistant-message"}
                  key={message.id}
                >
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
                </article>
              ))}
            </div>

            {error ? <p className="error-line">{error}</p> : null}

            <form className="prompt-bar" onSubmit={handleSubmit}>
              <button className="icon-button" title={text.assistant.guardrails} type="button" aria-label={text.assistant.guardrails}>
                <WandSparkles aria-hidden="true" />
              </button>
              <input
                aria-label={text.assistant.askLabel}
                onChange={(event) => setPrompt(event.target.value)}
                placeholder={text.assistant.placeholder}
                value={prompt}
              />
              <button className="send-button" disabled={isLoading} type="submit" aria-label={text.assistant.send}>
                <Send aria-hidden="true" />
              </button>
            </form>
          </div>

          <aside className="inspector" aria-label={text.evidence.title}>
            <section className="inspector-block">
              <div className="panel-heading compact">
                <h2>{text.evidence.title}</h2>
                <button className="icon-button small" title={text.evidence.view} type="button" aria-label={text.evidence.view}>
                  <ExternalLink aria-hidden="true" />
                </button>
              </div>
              <ol className="citation-list">
                {evidenceItems.map((item) => (
                  <li key={item.id}>
                    <strong>{item.title}</strong>
                    <span>{item.detail}</span>
                  </li>
                ))}
              </ol>
            </section>

            <section className="inspector-block">
              <div className="panel-heading compact">
                <h2>{text.knowledge.title}</h2>
                <span className="sync-badge">{text.knowledge.indexed}</span>
              </div>
              <div className="knowledge-meter">
                <span style={{ width: `${selectedCourse?.coveragePercent ?? 0}%` }} />
              </div>
              <dl className="mini-stats">
                <div>
                  <dt>{text.knowledge.docs}</dt>
                  <dd>{selectedCourse?.documents.length ?? 0}</dd>
                </div>
                <div>
                  <dt>{text.knowledge.chunks}</dt>
                  <dd>{selectedCourse?.indexedChunks.toLocaleString(locale) ?? 0}</dd>
                </div>
                <div>
                  <dt>{text.knowledge.queue}</dt>
                  <dd>{reviewQueueCount}</dd>
                </div>
              </dl>
            </section>

            <section className="inspector-block">
              <h2>{text.governance.title}</h2>
              <ul className="roadmap-list">
                {text.governance.items.map((item, index) => (
                  <li className={index < 4 ? "done" : index === 4 ? "active" : undefined} key={item}>
                    {item}
                  </li>
                ))}
              </ul>
            </section>

            <section className="inspector-block">
              <div className="panel-heading compact">
                <h2>{text.audit.title}</h2>
                <span className="sync-badge">{auditEvents.length}</span>
              </div>
              <ul className="audit-list">
                {auditEvents.length > 0 ? (
                  auditEvents.slice(0, 4).map((event) => (
                    <li key={event.id}>
                      <strong>{text.audit.eventTypes[event.type]}</strong>
                      <span>{event.summary}</span>
                    </li>
                  ))
                ) : (
                  <li>
                    <strong>{text.audit.emptyTitle}</strong>
                    <span>{text.audit.emptyBody}</span>
                  </li>
                )}
              </ul>
            </section>

            <section className="inspector-block trace-block">
              <div className="panel-heading compact">
                <h2>{text.review.title}</h2>
                <ShieldCheck aria-hidden="true" />
              </div>
              <p>{lastResponse?.review.rubricNotes ?? text.review.pending}</p>
              <span>{lastResponse ? `${text.review.provider}: ${lastResponse.ragTrace.provider}` : `${text.review.provider}: mock`}</span>
              {lastResponse ? (
                <div className="review-actions" aria-label={text.review.actions}>
                  <button
                    onClick={() => handleReviewAction({ status: "approved", reviewerUserId: "teacher-demo" })}
                    type="button"
                  >
                    {text.review.approve}
                  </button>
                  <button
                    onClick={() =>
                      handleReviewAction({
                        status: "corrected",
                        reviewerUserId: "teacher-demo",
                        correction: text.review.correction,
                        rubricNotes: text.review.correctionNotes,
                      })
                    }
                    type="button"
                  >
                    {text.review.correct}
                  </button>
                  <button
                    onClick={() =>
                      handleReviewAction({
                        status: "rejected",
                        reviewerUserId: "teacher-demo",
                        rubricNotes: text.review.rejectedNotes,
                      })
                    }
                    type="button"
                  >
                    {text.review.reject}
                  </button>
                </div>
              ) : null}
            </section>
          </aside>
        </section>

        <section className="architecture-band" aria-label={text.architecture.eyebrow}>
          <div>
            <p className="eyebrow">{text.architecture.eyebrow}</p>
            <h2>{text.architecture.title}</h2>
          </div>
          <div className="architecture-flow">
            {text.architecture.flow.map((item, index) => (
              <span className="architecture-flow-item" key={item}>
                {index > 0 ? <ArrowRight aria-hidden="true" /> : null}
                <span>{item}</span>
              </span>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
