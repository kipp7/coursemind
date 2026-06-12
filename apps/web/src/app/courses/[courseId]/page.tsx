import CourseChatClient from "../../course-chat-client";

type CoursePageProps = {
  params: Promise<{
    courseId: string;
  }>;
};

export default async function CoursePage({ params }: CoursePageProps) {
  const { courseId } = await params;

  return <CourseChatClient initialCourseId={courseId} />;
}
