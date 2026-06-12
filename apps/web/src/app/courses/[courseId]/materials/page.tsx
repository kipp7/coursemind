import CourseChatClient from "../../../course-chat-client";

type CourseMaterialsPageProps = {
  params: Promise<{
    courseId: string;
  }>;
};

export default async function CourseMaterialsPage({ params }: CourseMaterialsPageProps) {
  const { courseId } = await params;

  return <CourseChatClient initialCourseId={courseId} initialPanel="materials" />;
}
