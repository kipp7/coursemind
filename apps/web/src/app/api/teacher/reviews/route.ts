import { listTeacherReviewQueue } from "@coursemind/api";
import { teacherReviewQueueResponseSchema } from "@coursemind/contracts";
import { NextResponse } from "next/server";

export async function GET() {
  const response = teacherReviewQueueResponseSchema.parse({
    items: await listTeacherReviewQueue(),
  });

  return NextResponse.json(response);
}
