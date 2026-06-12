import CourseChatClient from "../../course-chat-client";

type ChatConversationPageProps = {
  params: Promise<{
    conversationId: string;
  }>;
};

export default async function ChatConversationPage({ params }: ChatConversationPageProps) {
  const { conversationId } = await params;

  return <CourseChatClient initialConversationId={conversationId} />;
}
