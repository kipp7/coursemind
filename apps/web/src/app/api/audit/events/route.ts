import { listAuditEvents } from "@coursemind/api";
import { auditEventListResponseSchema } from "@coursemind/contracts";
import { NextResponse } from "next/server";

export async function GET() {
  const response = auditEventListResponseSchema.parse({
    items: await listAuditEvents(),
  });

  return NextResponse.json(response);
}
