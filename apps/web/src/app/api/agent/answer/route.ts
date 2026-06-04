import { answerCourseQuestion, RagProviderConfigurationError } from "@coursemind/api";
import { answerRequestSchema, answerResponseSchema } from "@coursemind/contracts";
import { NextResponse } from "next/server";
import { ZodError } from "zod";

export async function POST(request: Request) {
  let payload: unknown;

  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Request body must be valid JSON" }, { status: 400 });
  }

  const parseResult = answerRequestSchema.safeParse(payload);

  if (!parseResult.success) {
    return NextResponse.json(
      {
        error: "Invalid answer request",
        details: parseResult.error.issues.map((issue) => ({
          path: issue.path.join("."),
          message: issue.message,
        })),
      },
      { status: 400 },
    );
  }

  try {
    const response = answerResponseSchema.parse(await answerCourseQuestion(parseResult.data));

    return NextResponse.json(response);
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: "Invalid answer response" }, { status: 500 });
    }

    const message = error instanceof Error ? error.message : "Unable to answer question";
    const status = error instanceof RagProviderConfigurationError ? 503 : 404;
    return NextResponse.json({ error: message }, { status });
  }
}
