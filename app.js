const courseProfiles = {
  ai: {
    documents: 128,
    chunks: "4,812",
    pending: 6,
    coverage: "82%",
    prompt: "帮我把这节课整理成考前复习提纲",
    reply:
      "我会按考试复习来整理：先列核心概念，再标出易混点，最后给你 5 道自测题。当前课程资料显示，本周重点是 RAG、向量检索、提示词约束和微调边界。",
  },
  data: {
    documents: 96,
    chunks: "3,407",
    pending: 3,
    coverage: "76%",
    prompt: "用例子解释一下二叉树遍历为什么会考",
    reply:
      "二叉树遍历经常考，是因为它同时检查递归、栈、队列和结构化思维。建议把前序、中序、后序、层序分别和一道手算题绑定记忆。",
  },
  design: {
    documents: 74,
    chunks: "2,105",
    pending: 9,
    coverage: "68%",
    prompt: "帮我从老师课件里提炼这次设计作业的评分点",
    reply:
      "这次作业的评分点主要是目标用户是否明确、信息层级是否稳定、视觉系统是否一致，以及作品说明能否解释设计决策。",
  },
};

const rolePrompts = {
  student: "帮我把这节课整理成考前复习提纲",
  teacher: "根据本周课程资料，生成一份课堂讨论题和参考答案",
  admin: "汇总本课程知识库的待审核资料和风险项",
};

const chatFeed = document.querySelector("#chatFeed");
const promptInput = document.querySelector("#promptInput");
const promptForm = document.querySelector("#promptForm");
const courseSelect = document.querySelector("#courseSelect");
const primaryAction = document.querySelector(".primary-action");
const meter = document.querySelector(".knowledge-meter span");
const statValues = document.querySelectorAll(".mini-stats dd");

function appendMessage(kind, text, sources = []) {
  const article = document.createElement("article");
  article.className = `message ${kind === "user" ? "user-message" : "assistant-message"}`;
  article.innerHTML = `
    <span>${kind === "user" ? "学生" : "CourseMind"}</span>
    <p>${text}</p>
    ${
      sources.length
        ? `<div class="source-list">${sources.map((source) => `<button type="button">${source}</button>`).join("")}</div>`
        : ""
    }
  `;
  chatFeed.appendChild(article);
  chatFeed.scrollTop = chatFeed.scrollHeight;
}

function updateCourse(courseId) {
  const profile = courseProfiles[courseId];
  statValues[0].textContent = profile.documents;
  statValues[1].textContent = profile.chunks;
  statValues[2].textContent = profile.pending;
  meter.style.setProperty("--value", profile.coverage);
  promptInput.value = profile.prompt;
}

function runDemo() {
  const profile = courseProfiles[courseSelect.value];
  appendMessage("user", promptInput.value);
  window.setTimeout(() => {
    appendMessage("assistant", profile.reply, ["课程讲义 · 最新版本", "教师 FAQ · 已审核"]);
  }, 520);
}

document.querySelectorAll(".nav-item").forEach((button) => {
  button.addEventListener("click", () => {
    document.querySelectorAll(".nav-item").forEach((item) => item.classList.remove("active"));
    button.classList.add("active");
  });
});

document.querySelectorAll(".role-tab").forEach((button) => {
  button.addEventListener("click", () => {
    document.querySelectorAll(".role-tab").forEach((item) => item.classList.remove("active"));
    button.classList.add("active");
    promptInput.value = rolePrompts[button.dataset.role];
  });
});

courseSelect.addEventListener("change", (event) => updateCourse(event.target.value));

promptForm.addEventListener("submit", (event) => {
  event.preventDefault();
  if (!promptInput.value.trim()) return;
  runDemo();
});

primaryAction.addEventListener("click", runDemo);

updateCourse(courseSelect.value);
lucide.createIcons();
