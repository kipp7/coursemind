import { answerCourseQuestion, RagProviderConfigurationError } from "@coursemind/api";
import type { AnswerRequest, CourseRole } from "@coursemind/contracts";
import { NextResponse } from "next/server";

const roles: CourseRole[] = ["student", "teacher", "admin"];

export async function POST(request: Request) {
  const body = (await request.json()) as Partial<AnswerRequest>;

  if (!body.courseId || typeof body.courseId !== "string") {
    return NextResponse.json({ error: "courseId is required" }, { status: 400 });
  }

  if (!body.question || typeof body.question !== "string" || !body.question.trim()) {
    return NextResponse.json({ error: "question is required" }, { status: 400 });
  }

  if (!body.role || !roles.includes(body.role)) {
    return NextResponse.json({ error: "valid role is required" }, { status: 400 });
  }

  try {
    const response = await answerCourseQuestion({
      courseId: body.courseId,
      role: body.role,
      question: body.question.trim(),
    });

    return NextResponse.json(response);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to answer question";
    const status = error instanceof RagProviderConfigurationError ? 503 : 404;
    return NextResponse.json({ error: message }, { status });
  }
}
