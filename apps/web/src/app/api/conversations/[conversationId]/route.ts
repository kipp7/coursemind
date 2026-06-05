import { getConversation } from "@coursemind/api";
import { conversationDetailResponseSchema } from "@coursemind/contracts";
import { NextResponse } from "next/server";

type RouteContext = {
  params: Promise<{
    conversationId: string;
  }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const { conversationId } = await context.params;

  try {
    const response = conversationDetailResponseSchema.parse({
      item: await getConversation(conversationId),
    });

    return NextResponse.json(response);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to load conversation";
    return NextResponse.json({ error: message }, { status: 404 });
  }
}
