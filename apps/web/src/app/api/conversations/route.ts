import { listConversations } from "@coursemind/api";
import { conversationListResponseSchema } from "@coursemind/contracts";
import { NextResponse } from "next/server";

export async function GET() {
  const response = conversationListResponseSchema.parse({
    items: await listConversations(),
  });

  return NextResponse.json(response);
}
