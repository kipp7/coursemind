"use client";

import type { AppLocale, ConversationSummary, CourseRole, CourseSnapshot } from "@coursemind/contracts";
import { BarChart3, Languages, Library, MessagesSquare, SlidersHorizontal, SquarePen } from "lucide-react";
import Link from "next/link";
import type { WorkspacePanel } from "./course-chat-types";

type SidebarText = {
  appSubtitle: string;
  newChat: string;
  currentCourse: string;
  sideTitle: string;
  noChats: string;
  governance: string;
  seed: {
    user: string;
  };
  headers: {
    assistant: {
      body: string;
    };
  };
  panels: Record<WorkspacePanel, string>;
  roles: Record<CourseRole, string>;
  nav: {
    role: string;
    language: string;
  };
};

type FallbackCourseSummary = {
  id: string;
  documentCount: number;
};

type CourseChatSidebarProps = {
  activePanel: WorkspacePanel | null;
  activeConversationId: string | null;
  auditEventCount: number;
  conversationSummaries: ConversationSummary[];
  courseId: string;
  courseTitles: Record<AppLocale, Record<string, string>>;
  courses: CourseSnapshot[];
  fallbackCourseSummaries: FallbackCourseSummary[];
  getCourseTitle: (course: CourseSnapshot["course"] | undefined, locale: AppLocale) => string;
  locale: AppLocale;
  locales: AppLocale[];
  pendingReviewCount: number;
  role: CourseRole;
  selectedDocumentCount: number;
  setCourseId: (courseId: string) => void;
  loadConversation: (conversationId: string) => void;
  startNewQuestion: () => void;
  text: SidebarText;
  togglePanel: (panel: WorkspacePanel) => void;
  updateLocale: (locale: AppLocale) => void;
  updateRole: (role: CourseRole) => void;
};

const panelIcons = {
  materials: Library,
  teacher: SlidersHorizontal,
  audit: BarChart3,
};

function panelHref(panel: WorkspacePanel, courseId: string) {
  if (panel === "materials") {
    return `/courses/${courseId}/materials`;
  }

  if (panel === "teacher") {
    return "/teacher/reviews";
  }

  return "/audit";
}

export function CourseChatSidebar({
  activePanel,
  activeConversationId,
  auditEventCount,
  conversationSummaries,
  courseId,
  courseTitles,
  courses,
  fallbackCourseSummaries,
  getCourseTitle,
  locale,
  locales,
  pendingReviewCount,
  role,
  selectedDocumentCount,
  setCourseId,
  loadConversation,
  startNewQuestion,
  text,
  togglePanel,
  updateLocale,
  updateRole,
}: CourseChatSidebarProps) {
  return (
    <aside className="chat-sidebar">
      <div className="brand">
        <div className="brand-mark">CM</div>
        <div>
          <strong>CourseMind</strong>
          <span>{text.appSubtitle}</span>
        </div>
      </div>

      <Link className="new-chat-button" href="/chat" onClick={startNewQuestion}>
        <SquarePen aria-hidden="true" />
        <span>{text.newChat}</span>
      </Link>

      <section className="sidebar-section">
        <p>{text.currentCourse}</p>
        <div className="course-list">
          {courses.length > 0
            ? courses.map((item) => (
                <Link
                  className={courseId === item.course.id ? "course-item active" : "course-item"}
                  href={`/courses/${item.course.id}`}
                  key={item.course.id}
                  onClick={() => setCourseId(item.course.id)}
                >
                  <span>{getCourseTitle(item.course, locale)}</span>
                  <small>{item.documents.length} docs</small>
                </Link>
              ))
            : fallbackCourseSummaries.map((item) => (
                <Link
                  className={courseId === item.id ? "course-item active" : "course-item"}
                  href={`/courses/${item.id}`}
                  key={item.id}
                  onClick={() => setCourseId(item.id)}
                >
                  <span>{courseTitles[locale][item.id]}</span>
                  <small>{item.documentCount} docs</small>
                </Link>
              ))}
        </div>
      </section>

      <section className="sidebar-section chat-history-section">
        <p>{text.sideTitle}</p>
        {conversationSummaries.length > 0 ? (
          conversationSummaries.map((conversation) => (
            <Link
              className={activeConversationId === conversation.conversationId ? "history-item active" : "history-item"}
              href={`/chat/${conversation.conversationId}`}
              key={conversation.conversationId}
              onClick={() => loadConversation(conversation.conversationId)}
            >
              <MessagesSquare aria-hidden="true" />
              <span>{conversation.title}</span>
              <small>{conversation.messageCount}</small>
            </Link>
          ))
        ) : (
          <div className="history-empty">{text.noChats}</div>
        )}
      </section>

      <section className="sidebar-section">
        <p>{text.governance}</p>
        <div className="panel-shortcuts">
          {(Object.keys(text.panels) as WorkspacePanel[]).map((panel) => {
            const Icon = panelIcons[panel];
            const count = panel === "teacher" ? pendingReviewCount : panel === "audit" ? auditEventCount : selectedDocumentCount;

            return (
              <Link
                className={activePanel === panel ? "panel-shortcut active" : "panel-shortcut"}
                href={panelHref(panel, courseId)}
                key={panel}
                onClick={() => togglePanel(panel)}
              >
                <Icon aria-hidden="true" />
                <span>{text.panels[panel]}</span>
                <small>{count}</small>
              </Link>
            );
          })}
        </div>
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
  );
}
