import type { CourseDocument } from "@coursemind/contracts";
import { getSqliteDatabase } from "./sqlite-database";

type CourseDocumentRow = {
  id: string;
  course_id: string;
  title: string;
  source_type: CourseDocument["sourceType"];
  visibility: CourseDocument["visibility"];
  ingestion_status: CourseDocument["ingestionStatus"];
  original_file_name: string | null;
  mime_type: string | null;
  size_bytes: number | null;
  storage_path: string | null;
  uploaded_at: string;
};

export class SqliteCourseDocumentRepository {
  saveDocument(document: CourseDocument) {
    getSqliteDatabase()
      .prepare(`
        INSERT INTO course_documents (
          id, course_id, title, source_type, visibility, ingestion_status, original_file_name,
          mime_type, size_bytes, storage_path, uploaded_at, created_at
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(id) DO UPDATE SET
          title = excluded.title,
          source_type = excluded.source_type,
          visibility = excluded.visibility,
          ingestion_status = excluded.ingestion_status,
          original_file_name = excluded.original_file_name,
          mime_type = excluded.mime_type,
          size_bytes = excluded.size_bytes,
          storage_path = excluded.storage_path,
          uploaded_at = excluded.uploaded_at
      `)
      .run(
        document.id,
        document.courseId,
        document.title,
        document.sourceType,
        document.visibility,
        document.ingestionStatus,
        document.originalFileName ?? null,
        document.mimeType ?? null,
        document.sizeBytes ?? null,
        document.storagePath ?? null,
        document.uploadedAt ?? new Date().toISOString(),
        document.uploadedAt ?? new Date().toISOString(),
      );

    return document;
  }

  listDocumentsByCourse(courseId: string) {
    const rows = getSqliteDatabase()
      .prepare("SELECT * FROM course_documents WHERE course_id = ? ORDER BY uploaded_at DESC")
      .all(courseId) as CourseDocumentRow[];

    return rows.map(toCourseDocument);
  }
}

function toCourseDocument(row: CourseDocumentRow): CourseDocument {
  return {
    id: row.id,
    courseId: row.course_id,
    title: row.title,
    sourceType: row.source_type,
    visibility: row.visibility,
    ingestionStatus: row.ingestion_status,
    originalFileName: row.original_file_name ?? undefined,
    mimeType: row.mime_type ?? undefined,
    sizeBytes: row.size_bytes ?? undefined,
    storagePath: row.storage_path ?? undefined,
    uploadedAt: row.uploaded_at,
  };
}

export const sqliteCourseDocumentRepository = new SqliteCourseDocumentRepository();
