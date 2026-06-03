"use client";

import {
  ArrowRight,
  BarChart3,
  ExternalLink,
  Library,
  MessagesSquare,
  Play,
  Send,
  SlidersHorizontal,
  Upload,
  WandSparkles,
} from "lucide-react";
import { FormEvent, useMemo, useState } from "react";

type CourseId = "ai" | "data" | "design";
type RoleId = "student" | "teacher" | "admin";
type Message = {
  id: number;
  kind: "user" | "assistant";
  text: string;
  sources?: string[];
};

const courseProfiles: Record<
  CourseId,
  {
    title: string;
    documents: number;
    chunks: string;
    pending: number;
    coverage: string;
    prompt: string;
    reply: string;
  }
> = {
  ai: {
    title: "人工智能导论",
    documents: 128,
    chunks: "4,812",
    pending: 6,
    coverage: "82%",
    prompt: "帮我把这节课整理成考前复习提纲",
    reply:
      "我会按考试复习来整理：先列核心概念，再标出易混点，最后给你 5 道自测题。当前课程资料显示，本周重点是 RAG、向量检索、提示词约束和微调边界。",
  },
  data: {
    title: "数据结构",
    documents: 96,
    chunks: "3,407",
    pending: 3,
    coverage: "76%",
    prompt: "用例子解释一下二叉树遍历为什么会考",
    reply:
      "二叉树遍历经常考，是因为它同时检查递归、栈、队列和结构化思维。建议把前序、中序、后序、层序分别和一道手算题绑定记忆。",
  },
  design: {
    title: "数字媒体设计",
    documents: 74,
    chunks: "2,105",
    pending: 9,
    coverage: "68%",
    prompt: "帮我从老师课件里提炼这次设计作业的评分点",
    reply:
      "这次作业的评分点主要是目标用户是否明确、信息层级是否稳定、视觉系统是否一致，以及作品说明能否解释设计决策。",
  },
};

const rolePrompts: Record<RoleId, string> = {
  student: "帮我把这节课整理成考前复习提纲",
  teacher: "根据本周课程资料，生成一份课堂讨论题和参考答案",
  admin: "汇总本课程知识库的待审核资料和风险项",
};

const navItems = [
  { id: "assistant", label: "智能答疑", icon: MessagesSquare },
  { id: "courses", label: "课程空间", icon: Library },
  { id: "teacher", label: "教师配置", icon: SlidersHorizontal },
  { id: "analytics", label: "学习洞察", icon: BarChart3 },
];

const initialMessages: Message[] = [
  {
    id: 1,
    kind: "user",
    text: "老师这周讲的 RAG 和微调到底有什么区别？我应该什么时候用微调？",
  },
  {
    id: 2,
    kind: "assistant",
    text: "对课程智能体来说，RAG 用来读取实时课程资料，微调用来学习稳定的回答风格或评分规范。第一版建议先做 RAG，因为课程内容会频繁变化。",
    sources: ["课程讲义 Ch.04 · p12", "教学大纲 · 第 3 周"],
  },
];

export default function Home() {
  const [activeNav, setActiveNav] = useState("assistant");
  const [courseId, setCourseId] = useState<CourseId>("ai");
  const [role, setRole] = useState<RoleId>("student");
  const [prompt, setPrompt] = useState(courseProfiles.ai.prompt);
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const course = courseProfiles[courseId];

  const nextId = useMemo(() => messages.length + 1, [messages.length]);

  function updateCourse(value: CourseId) {
    setCourseId(value);
    setPrompt(courseProfiles[value].prompt);
  }

  function updateRole(value: RoleId) {
    setRole(value);
    setPrompt(rolePrompts[value]);
  }

  function runDemo(event?: FormEvent) {
    event?.preventDefault();
    const trimmedPrompt = prompt.trim();
    if (!trimmedPrompt) return;

    setMessages((current) => [
      ...current,
      { id: nextId, kind: "user", text: trimmedPrompt },
      {
        id: nextId + 1,
        kind: "assistant",
        text: course.reply,
        sources: ["课程讲义 · 最新版本", "教师 FAQ · 已审核"],
      },
    ]);
  }

  return (
    <div className="app-shell">
      <aside className="sidebar" aria-label="课程导航">
        <div className="brand">
          <span className="brand-mark">CM</span>
          <div>
            <strong>CourseMind</strong>
            <span>校园课程智能体</span>
          </div>
        </div>

        <nav className="nav-stack" aria-label="主导航">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                className={`nav-item ${activeNav === item.id ? "active" : ""}`}
                key={item.id}
                onClick={() => setActiveNav(item.id)}
                type="button"
              >
                <Icon aria-hidden="true" />
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="course-switcher">
          <label htmlFor="courseSelect">当前课程</label>
          <select
            id="courseSelect"
            onChange={(event) => updateCourse(event.target.value as CourseId)}
            value={courseId}
          >
            {Object.entries(courseProfiles).map(([id, profile]) => (
              <option key={id} value={id}>
                {profile.title}
              </option>
            ))}
          </select>
        </div>

        <div className="role-switcher" aria-label="角色切换">
          {(["student", "teacher", "admin"] as RoleId[]).map((roleId) => (
            <button
              className={`role-tab ${role === roleId ? "active" : ""}`}
              key={roleId}
              onClick={() => updateRole(roleId)}
              type="button"
            >
              {roleId === "student" ? "学生" : roleId === "teacher" ? "教师" : "管理员"}
            </button>
          ))}
        </div>

        <div className="status-panel">
          <span className="status-dot" />
          <div>
            <strong>RAG MVP</strong>
            <span>Dify / RAGFlow / OpenAI-compatible API 可接入</span>
          </div>
        </div>
      </aside>

      <main className="workspace">
        <header className="topbar">
          <div>
            <p className="eyebrow">学校级 Web 交付原型</p>
            <h1>课程智能体工作台</h1>
          </div>
          <div className="top-actions">
            <button className="icon-button" title="上传资料" type="button" aria-label="上传资料">
              <Upload aria-hidden="true" />
            </button>
            <button className="primary-action" onClick={() => runDemo()} type="button">
              <Play aria-hidden="true" />
              演示流程
            </button>
          </div>
        </header>

        <section className="hero-strip" aria-label="课程概览">
          <div className="hero-overlay">
            <p>面向学生答疑、教师课程维护、学校统一管理的一体化课程智能体。</p>
            <div className="hero-metrics" aria-label="MVP 指标">
              <span>
                <strong>3</strong>角色
              </span>
              <span>
                <strong>5</strong>资料类型
              </span>
              <span>
                <strong>100%</strong>引用可追溯
              </span>
            </div>
          </div>
        </section>

        <section className="content-grid">
          <div className="assistant-panel" data-panel="assistant">
            <div className="panel-heading">
              <div>
                <p className="eyebrow">Student Agent</p>
                <h2>智能答疑</h2>
              </div>
              <span className="model-badge">Qwen / GPT / DeepSeek</span>
            </div>

            <div className="chat-feed" aria-live="polite">
              {messages.map((message) => (
                <article
                  className={`message ${message.kind === "user" ? "user-message" : "assistant-message"}`}
                  key={message.id}
                >
                  <span>{message.kind === "user" ? "学生" : "CourseMind"}</span>
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

            <form className="prompt-bar" onSubmit={runDemo}>
              <button className="icon-button" title="选择工具" type="button" aria-label="选择工具">
                <WandSparkles aria-hidden="true" />
              </button>
              <input
                aria-label="向课程智能体提问"
                autoComplete="off"
                onChange={(event) => setPrompt(event.target.value)}
                type="text"
                value={prompt}
              />
              <button className="send-button" type="submit" aria-label="发送">
                <Send aria-hidden="true" />
              </button>
            </form>
          </div>

          <aside className="inspector" aria-label="右侧信息">
            <section className="inspector-block">
              <div className="panel-heading compact">
                <h2>答案依据</h2>
                <button className="icon-button small" title="查看引用" type="button" aria-label="查看引用">
                  <ExternalLink aria-hidden="true" />
                </button>
              </div>
              <ol className="citation-list">
                <li>
                  <strong>课程讲义 Ch.04</strong>
                  <span>RAG、向量检索、生成式问答</span>
                </li>
                <li>
                  <strong>实验手册 Lab 02</strong>
                  <span>知识库导入与引用检查</span>
                </li>
                <li>
                  <strong>教师 FAQ</strong>
                  <span>考试范围、作业提交规范</span>
                </li>
              </ol>
            </section>

            <section className="inspector-block">
              <div className="panel-heading compact">
                <h2>知识库状态</h2>
                <span className="sync-badge">已同步</span>
              </div>
              <div className="knowledge-meter">
                <span style={{ width: course.coverage }} />
              </div>
              <dl className="mini-stats">
                <div>
                  <dt>文档</dt>
                  <dd>{course.documents}</dd>
                </div>
                <div>
                  <dt>分块</dt>
                  <dd>{course.chunks}</dd>
                </div>
                <div>
                  <dt>待审核</dt>
                  <dd>{course.pending}</dd>
                </div>
              </dl>
            </section>

            <section className="inspector-block">
              <h2>架构路线</h2>
              <ul className="roadmap-list">
                <li className="done">Web MVP 与课程空间</li>
                <li className="active">RAG 平台接入</li>
                <li>统一身份与权限</li>
                <li>教师审核与学习分析</li>
                <li>基于样本的 LoRA 微调</li>
              </ul>
            </section>
          </aside>
        </section>

        <section className="architecture-band" aria-label="平台架构">
          <div>
            <p className="eyebrow">Architecture</p>
            <h2>先用开源平台跑起来，再把学校能力沉淀成平台</h2>
          </div>
          <div className="architecture-flow">
            <span>Web 前端</span>
            <ArrowRight aria-hidden="true" />
            <span>智能体服务层</span>
            <ArrowRight aria-hidden="true" />
            <span>Dify / RAGFlow</span>
            <ArrowRight aria-hidden="true" />
            <span>模型与知识库</span>
          </div>
        </section>
      </main>
    </div>
  );
}
