"use client";

import type { AppLocale, CourseRole } from "@coursemind/contracts";
import { ArrowUp } from "lucide-react";
import type { Dispatch, FormEvent, SetStateAction } from "react";
import type { ChatMessage } from "./course-chat-types";

type ConversationText = {
  quickPrompts: string;
  providerPath: string;
  roles: Record<CourseRole, string>;
  prompts: Record<CourseRole, string>;
  headers: {
    assistant: {
      body: string;
    };
  };
  assistant: {
    askLabel: string;
    placeholder: string;
    send: string;
    thinking: string;
  };
};

type CourseChatConversationProps = {
  error: string | null;
  handleSubmit: (event: FormEvent<HTMLFormElement>) => void;
  isLoading: boolean;
  locale: AppLocale;
  messages: ChatMessage[];
  prompt: string;
  role: CourseRole;
  setPrompt: Dispatch<SetStateAction<string>>;
  text: ConversationText;
};

export function CourseChatConversation({
  error,
  handleSubmit,
  isLoading,
  locale,
  messages,
  prompt,
  role,
  setPrompt,
  text,
}: CourseChatConversationProps) {
  return (
    <section className="conversation-shell">
      <div className="conversation-scroll" aria-live="polite">
        {messages.length === 0 && !isLoading ? (
          <div className="chat-empty-state">
            <div className="empty-mark">CM</div>
            <h2>{locale === "zh-CN" ? "今天想了解哪门课？" : "What course question can I help with?"}</h2>
            <p>{text.headers.assistant.body}</p>
            <div className="suggestion-grid" aria-label={text.quickPrompts}>
              {(["student", "teacher", "admin"] as CourseRole[]).map((item) => (
                <button key={item} onClick={() => setPrompt(text.prompts[item])} type="button">
                  <span>{text.roles[item]}</span>
                  <strong>{text.prompts[item]}</strong>
                </button>
              ))}
            </div>
          </div>
        ) : null}

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
              <p className="thinking">{text.assistant.thinking}</p>
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
            <ArrowUp aria-hidden="true" />
          </button>
        </div>
      </form>
    </section>
  );
}
