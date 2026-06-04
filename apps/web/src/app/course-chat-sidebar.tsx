"use client";

import type { AppLocale, CourseRole, CourseSnapshot } from "@coursemind/contracts";
import { BarChart3, Languages, Library, MessagesSquare, ShieldCheck, SlidersHorizontal, SquarePen } from "lucide-react";

type WorkspacePanel = "materials" | "teacher" | "audit";

type SidebarText = {
  appSubtitle: string;
  newChat: string;
  currentCourse: string;
  sideTitle: string;
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
  auditEventCount: number;
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

export function CourseChatSidebar({
  activePanel,
  auditEventCount,
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

      <button className="new-chat-button" onClick={startNewQuestion} type="button">
        <SquarePen aria-hidden="true" />
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

      <section className="sidebar-section chat-history-section">
        <p>{text.sideTitle}</p>
        <button className="history-item active" type="button">
          <MessagesSquare aria-hidden="true" />
          <span>{text.seed.user}</span>
        </button>
        <button className="history-item" type="button">
          <ShieldCheck aria-hidden="true" />
          <span>{text.headers.assistant.body}</span>
        </button>
      </section>

      <section className="sidebar-section">
        <p>{text.governance}</p>
        <div className="panel-shortcuts">
          {(Object.keys(text.panels) as WorkspacePanel[]).map((panel) => {
            const Icon = panelIcons[panel];
            const count = panel === "teacher" ? pendingReviewCount : panel === "audit" ? auditEventCount : selectedDocumentCount;

            return (
              <button
                className={activePanel === panel ? "panel-shortcut active" : "panel-shortcut"}
                key={panel}
                onClick={() => togglePanel(panel)}
                type="button"
              >
                <Icon aria-hidden="true" />
                <span>{text.panels[panel]}</span>
                <small>{count}</small>
              </button>
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
