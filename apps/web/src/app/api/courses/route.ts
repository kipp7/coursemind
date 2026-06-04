import { getCourseSnapshots } from "@coursemind/api";
import { NextResponse } from "next/server";

export function GET() {
  return NextResponse.json({ courses: getCourseSnapshots() });
}
