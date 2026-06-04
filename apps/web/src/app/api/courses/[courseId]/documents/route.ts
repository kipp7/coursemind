import { createCourseDocument } from "@coursemind/api";
import { courseDocumentCreateRequestSchema, courseDocumentCreateResponseSchema } from "@coursemind/contracts";
import { NextResponse } from "next/server";
import { ZodError } from "zod";

type RouteContext = {
  params: Promise<{
    courseId: string;
  }>;
};

export async function POST(request: Request, context: RouteContext) {
  const { courseId } = await context.params;
  let payload: unknown;

  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Request body must be valid JSON" }, { status: 400 });
  }

  const parseResult = courseDocumentCreateRequestSchema.safeParse(payload);

  if (!parseResult.success) {
    return NextResponse.json(
      {
        error: "Invalid course document request",
        details: parseResult.error.issues.map((issue) => ({
          path: issue.path.join("."),
          message: issue.message,
        })),
      },
      { status: 400 },
    );
  }

  try {
    const response = courseDocumentCreateResponseSchema.parse(await createCourseDocument(courseId, parseResult.data));

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: "Invalid course document response" }, { status: 500 });
    }

    const message = error instanceof Error ? error.message : "Unable to create course document";
    return NextResponse.json({ error: message }, { status: 404 });
  }
}
