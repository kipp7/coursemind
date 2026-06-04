import { updateTeacherReview } from "@coursemind/api";
import { teacherReviewActionResponseSchema, teacherReviewActionSchema } from "@coursemind/contracts";
import { NextResponse } from "next/server";

type RouteContext = {
  params: Promise<{
    reviewId: string;
  }>;
};

export async function POST(request: Request, context: RouteContext) {
  const { reviewId } = await context.params;
  let payload: unknown;

  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Request body must be valid JSON" }, { status: 400 });
  }

  const parseResult = teacherReviewActionSchema.safeParse(payload);

  if (!parseResult.success) {
    return NextResponse.json(
      {
        error: "Invalid teacher review action",
        details: parseResult.error.issues.map((issue) => ({
          path: issue.path.join("."),
          message: issue.message,
        })),
      },
      { status: 400 },
    );
  }

  try {
    const response = teacherReviewActionResponseSchema.parse({
      item: await updateTeacherReview(reviewId, parseResult.data),
    });

    return NextResponse.json(response);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to update teacher review";
    return NextResponse.json({ error: message }, { status: 404 });
  }
}
