import {
  ArrowRight,
  CheckCircle2,
  ClipboardCheck,
  Database,
  FileSearch,
  GraduationCap,
  LockKeyhole,
  MessageSquareText,
  Network,
  ShieldCheck,
  SlidersHorizontal,
} from "lucide-react";
import Link from "next/link";

const answerSteps = [
  {
    title: "学生提问",
    body: "问题先进入课程空间，系统只使用当前课程允许访问的资料和会话上下文。",
    icon: MessageSquareText,
  },
  {
    title: "课程资料检索",
    body: "RAG 先检索课程大纲、课件、讲义和教师资料，回答必须能回到来源。",
    icon: FileSearch,
  },
  {
    title: "模型生成回答",
    body: "模型通过 CourseMind API 层调用，前端不直接连接模型服务。",
    icon: Network,
  },
  {
    title: "引用展示",
    body: "学生看到的是可理解的引用和依据，不需要理解 provider 或 trace 细节。",
    icon: Database,
  },
  {
    title: "教师审核",
    body: "教师可以通过、修正或驳回答案，修正记录后续可沉淀为标准答案和评分规范。",
    icon: ClipboardCheck,
  },
  {
    title: "审计留痕",
    body: "回答、资料入库和教师动作都会进入审计记录，方便学校追踪和复盘。",
    icon: ShieldCheck,
  },
];

const audienceCards = [
  {
    title: "学生看到什么",
    body: "课程问答、引用来源、教师审核状态和反馈入口。学生界面不暴露技术链路，避免干扰学习。",
  },
  {
    title: "教师处理什么",
    body: "待审核回答、引用依据、修正意见和课堂表达。教师的判断会成为后续风格和规范数据。",
  },
  {
    title: "学校验收什么",
    body: "资料边界、权限边界、Provider 可替换性、回答可追溯性和审计留痕是否完整。",
  },
];

const guardrails = [
  "课程资料先检索，模型后生成",
  "回答需要引用，不把依据藏在提示词里",
  "教师审核动作必须记录",
  "RAGFlow、Dify、模型 API 都在服务端适配层后面",
  "真实学生数据、密钥和学校资料不进入 memory",
  "微调等教师确认数据稳定后再做",
];

export default function GovernancePage() {
  return (
    <main className="governance-page">
      <header className="governance-hero">
        <nav className="governance-nav" aria-label="CourseMind navigation">
          <Link href="/chat">课程问答</Link>
          <Link href="/teacher/reviews">教师审核</Link>
          <Link href="/audit">审计记录</Link>
        </nav>

        <div className="governance-hero-grid">
          <section>
            <span className="governance-kicker">
              <ShieldCheck aria-hidden="true" />
              CourseMind 可信回答中心
            </span>
            <h1>让学校看清每条回答从哪里来、由谁确认、如何追溯。</h1>
            <p>
              这个页面面向学校验收、教师负责人和管理员。学生端保持简洁，只呈现课程回答、引用来源和反馈；治理细节集中在这里查看。
            </p>
            <div className="governance-actions">
              <Link className="governance-primary-link" href="/chat">
                进入课程问答
                <ArrowRight aria-hidden="true" />
              </Link>
              <Link className="governance-secondary-link" href="/audit">
                查看审计记录
              </Link>
            </div>
          </section>

          <aside className="governance-status-card" aria-label="MVP trust status">
            <div>
              <span>当前 MVP 状态</span>
              <strong>可演示</strong>
            </div>
            <ul>
              <li>
                <CheckCircle2 aria-hidden="true" />
                RAG / Model Gateway 边界已保留
              </li>
              <li>
                <CheckCircle2 aria-hidden="true" />
                回答、审核、审计已形成闭环
              </li>
              <li>
                <CheckCircle2 aria-hidden="true" />
                Dify / RAGFlow 可替换接入
              </li>
            </ul>
          </aside>
        </div>
      </header>

      <section className="governance-section">
        <div className="governance-section-heading">
          <span>回答路径</span>
          <h2>一条课程回答的可信流程</h2>
        </div>
        <ol className="governance-flow">
          {answerSteps.map((step, index) => {
            const Icon = step.icon;

            return (
              <li key={step.title}>
                <div className="governance-flow-index">{String(index + 1).padStart(2, "0")}</div>
                <div className="governance-flow-icon">
                  <Icon aria-hidden="true" />
                </div>
                <div>
                  <h3>{step.title}</h3>
                  <p>{step.body}</p>
                </div>
              </li>
            );
          })}
        </ol>
      </section>

      <section className="governance-section governance-two-column">
        <div>
          <div className="governance-section-heading">
            <span>人性化分层</span>
            <h2>不同角色看到不同复杂度</h2>
          </div>
          <div className="governance-audience-grid">
            {audienceCards.map((card) => (
              <article key={card.title}>
                <h3>{card.title}</h3>
                <p>{card.body}</p>
              </article>
            ))}
          </div>
        </div>

        <aside className="governance-principles">
          <div className="governance-section-heading">
            <span>系统边界</span>
            <h2>当前必须守住的规则</h2>
          </div>
          <ul>
            {guardrails.map((item) => (
              <li key={item}>
                <LockKeyhole aria-hidden="true" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </aside>
      </section>

      <section className="governance-section governance-operation-grid">
        <Link href="/courses/ai-101/materials">
          <GraduationCap aria-hidden="true" />
          <span>课程资料</span>
          <strong>查看资料入库与课程空间</strong>
        </Link>
        <Link href="/teacher/reviews">
          <SlidersHorizontal aria-hidden="true" />
          <span>教师审核</span>
          <strong>处理待确认回答</strong>
        </Link>
        <Link href="/audit">
          <ShieldCheck aria-hidden="true" />
          <span>审计记录</span>
          <strong>追踪回答和审核动作</strong>
        </Link>
      </section>
    </main>
  );
}
