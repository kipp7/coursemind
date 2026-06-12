import { createCourseDocument } from "@coursemind/api";
import { courseDocumentCreateRequestSchema, courseDocumentCreateResponseSchema } from "@coursemind/contracts";
import { mkdir, writeFile } from "node:fs/promises";
import { basename, dirname, extname, resolve } from "node:path";
import { randomUUID } from "node:crypto";
import { fileURLToPath } from "node:url";
import { NextResponse } from "next/server";
import { ZodError } from "zod";

type RouteContext = {
  params: Promise<{
    courseId: string;
  }>;
};

export async function POST(request: Request, context: RouteContext) {
  const { courseId } = await context.params;
  const contentType = request.headers.get("content-type") ?? "";
  let payload: unknown;

  if (contentType.includes("multipart/form-data")) {
    try {
      payload = await readMultipartDocumentRequest(request, courseId);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Invalid multipart document upload";

      return NextResponse.json({ error: message }, { status: 400 });
    }
  } else {
    try {
      payload = await request.json();
    } catch {
      return NextResponse.json({ error: "Request body must be valid JSON" }, { status: 400 });
    }
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

async function readMultipartDocumentRequest(request: Request, courseId: string) {
  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File) || file.size === 0) {
    throw new Error("A non-empty course material file is required.");
  }

  const originalFileName = sanitizeFileName(file.name || "course-material");
  const storedFileName = `${Date.now()}-${randomUUID()}-${originalFileName}`;
  const uploadRoot = process.env.COURSEMIND_UPLOAD_ROOT ?? defaultUploadRoot();
  const coursePathSegment = sanitizePathSegment(courseId);
  const courseUploadDirectory = resolve(uploadRoot, coursePathSegment);
  const storageRelativePath = `${coursePathSegment}/${storedFileName}`;
  const storagePath = resolve(uploadRoot, storageRelativePath);

  await mkdir(courseUploadDirectory, { recursive: true });
  await writeFile(storagePath, Buffer.from(await file.arrayBuffer()));

  return {
    title: getFormString(formData, "title") || titleFromFileName(originalFileName),
    sourceType: getFormString(formData, "sourceType") || inferSourceType(originalFileName, file.type),
    visibility: getFormString(formData, "visibility") || "student",
    actorUserId: getFormString(formData, "actorUserId") || "teacher-demo",
    locale: getFormString(formData, "locale") || "zh-CN",
    originalFileName,
    mimeType: file.type || "application/octet-stream",
    sizeBytes: file.size,
    storagePath: storageRelativePath,
  };
}

function getFormString(formData: FormData, key: string) {
  const value = formData.get(key);

  return typeof value === "string" ? value.trim() : undefined;
}

function defaultUploadRoot() {
  return resolve(dirname(fileURLToPath(import.meta.url)), "../../../../../../../../uploads/course-documents");
}

function sanitizePathSegment(value: string) {
  return value.replace(/[^a-zA-Z0-9._-]/g, "_");
}

function sanitizeFileName(value: string) {
  return basename(value).replace(/[^a-zA-Z0-9._\-\u4e00-\u9fa5]/g, "_");
}

function titleFromFileName(fileName: string) {
  const extension = extname(fileName);
  const title = extension ? fileName.slice(0, -extension.length) : fileName;

  return title || "Course material";
}

function inferSourceType(fileName: string, mimeType: string) {
  const extension = extname(fileName).toLowerCase();

  if (extension === ".pdf" || mimeType.includes("pdf")) {
    return "pdf";
  }

  if ([".ppt", ".pptx"].includes(extension) || mimeType.includes("presentation")) {
    return "ppt";
  }

  if ([".doc", ".docx"].includes(extension) || mimeType.includes("word")) {
    return "word";
  }

  if ([".md", ".markdown", ".txt"].includes(extension)) {
    return "markdown";
  }

  if ([".html", ".htm"].includes(extension)) {
    return "web";
  }

  return "markdown";
}
