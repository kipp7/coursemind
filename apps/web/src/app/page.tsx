"use client";

import type {
  AnswerResponse,
  CourseRole,
  CourseSnapshot,
  TeacherReviewAction,
  TeacherReviewQueueResponse,
} from "@coursemind/contracts";
import {
  ArrowRight,
  BarChart3,
  ExternalLink,
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

const navItems = [
  { id: "assistant", label: "Assistant", icon: MessagesSquare },
  { id: "courses", label: "Courses", icon: Library },
  { id: "teacher", label: "Teacher review", icon: SlidersHorizontal },
  { id: "analytics", label: "Audit trail", icon: BarChart3 },
];

const roleLabels: Record<CourseRole, string> = {
  student: "Student",
  teacher: "Teacher",
  admin: "Admin",
};

const rolePrompts: Record<CourseRole, string> = {
  student: "What is the difference between RAG and fine-tuning in this course?",
  teacher: "Draft a cited answer and mark it for teacher review.",
  admin: "Summarize the provider boundary and audit data for this answer.",
};

export default function Home() {
  const [activeNav, setActiveNav] = useState("assistant");
  const [courses, setCourses] = useState<CourseSnapshot[]>([]);
  const [courseId, setCourseId] = useState("ai-101");
  const [role, setRole] = useState<CourseRole>("student");
  const [prompt, setPrompt] = useState(rolePrompts.student);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "seed-user",
      kind: "user",
      text: "Should we build this course agent with RAG first, or fine-tune a model immediately?",
    },
    {
      id: "seed-assistant",
      kind: "assistant",
      text: "Start with RAG. Course material changes often, so the MVP should retrieve current course context, answer with citations, and send the response into teacher review before any fine-tuning work.",
      sources: ["Course syllabus", "Lecture 4: RAG and course Q&A"],
    },
  ]);
  const [lastResponse, setLastResponse] = useState<AnswerResponse | null>(null);
  const [reviewQueueCount, setReviewQueueCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
        setError("Could not load demo courses.");
      }
    });

    return () => {
      mounted = false;
    };
  }, []);

  async function refreshReviewQueue() {
    const response = await fetch("/api/teacher/reviews");
    const data = (await response.json()) as TeacherReviewQueueResponse;
    setReviewQueueCount(data.items.length);
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
      setError(data.error ?? "Teacher review update failed");
      return;
    }

    const updatedReview = data.item.review;

    setLastResponse((current) => current ? { ...current, review: updatedReview } : current);
    await refreshReviewQueue();
  }

  const selectedCourse = useMemo(
    () => courses.find((item) => item.course.id === courseId) ?? courses[0],
    [courseId, courses],
  );
  const evidenceItems = useMemo(() => {
    if (lastResponse) {
      return lastResponse.citations.map((citation) => ({
        id: citation.documentId,
        title: citation.title,
        detail: citation.excerpt ?? citation.locator ?? "Retrieved course evidence",
      }));
    }

    return (selectedCourse?.documents.slice(0, 3) ?? []).map((document) => ({
      id: document.id,
      title: document.title,
      detail: document.ingestionStatus,
    }));
  }, [lastResponse, selectedCourse]);

  function updateRole(nextRole: CourseRole) {
    setRole(nextRole);
    setPrompt(rolePrompts[nextRole]);
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
        body: JSON.stringify({ courseId: selectedCourse.course.id, role, question }),
      });

      const data = (await response.json()) as AnswerResponse | { error: string };

      if (!response.ok || "error" in data) {
        throw new Error("error" in data ? data.error : "Answer request failed");
      }

      setLastResponse(data);
      await refreshReviewQueue();
      setMessages((current) => [
        ...current,
        {
          id: data.answerMessage.id,
          kind: "assistant",
          text: data.answerMessage.content,
          sources: data.citations.map((citation) => citation.title),
        },
      ]);
      setPrompt("");
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Answer request failed");
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
            <span>School course agent MVP</span>
          </div>
        </div>

        <nav className="nav-stack" aria-label="Main navigation">
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
          <label htmlFor="course-select">Course space</label>
          <select id="course-select" value={courseId} onChange={(event) => setCourseId(event.target.value)}>
            {courses.map((item) => (
              <option key={item.course.id} value={item.course.id}>
                {item.course.title}
              </option>
            ))}
          </select>
        </div>

        <div className="role-switcher" aria-label="Role switcher">
          {(["student", "teacher", "admin"] as CourseRole[]).map((item) => (
            <button
              className={role === item ? "role-tab active" : "role-tab"}
              key={item}
              onClick={() => updateRole(item)}
              type="button"
            >
              {roleLabels[item]}
            </button>
          ))}
        </div>

        <div className="status-panel">
          <span className="status-dot" />
          <div>
            <strong>Mock provider online</strong>
            <span>Dify/RAGFlow adapter boundary preserved</span>
          </div>
        </div>
      </aside>

      <main className="workspace">
        <header className="topbar">
          <div>
            <p className="eyebrow">Vertical slice</p>
            <h1>Ask with course context, cite the answer, queue teacher review.</h1>
          </div>
          <div className="top-actions">
            <button className="icon-button" title="Upload course material" type="button" aria-label="Upload course material">
              <Upload aria-hidden="true" />
            </button>
            <button className="primary-action" type="button">
              <Play aria-hidden="true" />
              Run demo
            </button>
          </div>
        </header>

        <section className="hero-strip" aria-label="CourseMind overview">
          <div className="hero-overlay">
            <div>
              <p className="eyebrow light">School-ready from day one</p>
              <h2>Our Web app calls our API first, then the API talks to RAG and model providers.</h2>
            </div>
            <p>
              The first MVP keeps student, teacher, citation, review, and provider-swap concerns visible instead of hiding them in prompt text.
            </p>
          </div>
        </section>

        <section className="content-grid">
          <div className="assistant-panel">
            <div className="panel-heading">
              <div>
                <p className="eyebrow">Course Q&A</p>
                <h2>{selectedCourse?.course.title ?? "Loading course"}</h2>
              </div>
              <span className="model-badge">Role: {roleLabels[role]}</span>
            </div>

            <div className="chat-feed" aria-live="polite">
              {messages.map((message) => (
                <article
                  className={message.kind === "user" ? "message user-message" : "message assistant-message"}
                  key={message.id}
                >
                  <span>{message.kind === "user" ? roleLabels[role] : "CourseMind"}</span>
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
              <button className="icon-button" title="Apply guardrails" type="button" aria-label="Apply guardrails">
                <WandSparkles aria-hidden="true" />
              </button>
              <input
                aria-label="Ask a course question"
                onChange={(event) => setPrompt(event.target.value)}
                placeholder="Ask a question about the selected course"
                value={prompt}
              />
              <button className="send-button" disabled={isLoading} type="submit" aria-label="Send question">
                <Send aria-hidden="true" />
              </button>
            </form>
          </div>

          <aside className="inspector" aria-label="Answer details">
            <section className="inspector-block">
              <div className="panel-heading compact">
                <h2>Answer evidence</h2>
                <button className="icon-button small" title="View citations" type="button" aria-label="View citations">
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
                <h2>Knowledge base</h2>
                <span className="sync-badge">Indexed</span>
              </div>
              <div className="knowledge-meter">
                <span style={{ width: `${selectedCourse?.coveragePercent ?? 0}%` }} />
              </div>
              <dl className="mini-stats">
                <div>
                  <dt>Docs</dt>
                  <dd>{selectedCourse?.documents.length ?? 0}</dd>
                </div>
                <div>
                  <dt>Chunks</dt>
                  <dd>{selectedCourse?.indexedChunks.toLocaleString() ?? 0}</dd>
                </div>
                <div>
                  <dt>Queue</dt>
                  <dd>{reviewQueueCount}</dd>
                </div>
              </dl>
            </section>

            <section className="inspector-block">
              <h2>Governance trace</h2>
              <ul className="roadmap-list">
                <li className="done">Web calls CourseMind API</li>
                <li className="done">Shared DTO contracts</li>
                <li className="done">RAG gateway adapter</li>
                <li className="active">Teacher review persistence</li>
                <li>Dify provider skeleton</li>
              </ul>
            </section>

            <section className="inspector-block trace-block">
              <div className="panel-heading compact">
                <h2>Review status</h2>
                <ShieldCheck aria-hidden="true" />
              </div>
              <p>{lastResponse?.review.rubricNotes ?? "Next answer will create a pending teacher review record."}</p>
              <span>{lastResponse ? `Provider: ${lastResponse.ragTrace.provider}` : "Provider: mock"}</span>
              {lastResponse ? (
                <div className="review-actions" aria-label="Teacher review actions">
                  <button
                    onClick={() => handleReviewAction({ status: "approved", reviewerUserId: "teacher-demo" })}
                    type="button"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() =>
                      handleReviewAction({
                        status: "corrected",
                        reviewerUserId: "teacher-demo",
                        correction: "Add one more classroom example before publishing.",
                        rubricNotes: "Teacher requested a more concrete explanation.",
                      })
                    }
                    type="button"
                  >
                    Correct
                  </button>
                  <button
                    onClick={() =>
                      handleReviewAction({
                        status: "rejected",
                        reviewerUserId: "teacher-demo",
                        rubricNotes: "Rejected for the demo review workflow.",
                      })
                    }
                    type="button"
                  >
                    Reject
                  </button>
                </div>
              ) : null}
            </section>
          </aside>
        </section>

        <section className="architecture-band" aria-label="Platform architecture">
          <div>
            <p className="eyebrow">Architecture</p>
            <h2>Provider tools can change. The school business boundary stays ours.</h2>
          </div>
          <div className="architecture-flow">
            <span>Next.js Web</span>
            <ArrowRight aria-hidden="true" />
            <span>Application API</span>
            <ArrowRight aria-hidden="true" />
            <span>RAG Gateway</span>
            <ArrowRight aria-hidden="true" />
            <span>Model Gateway</span>
          </div>
        </section>
      </main>
    </div>
  );
}
