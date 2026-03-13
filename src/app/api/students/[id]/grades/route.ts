import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// PUT /api/students/[id]/grades — save grades for non-scored subjects
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { urduSanskrit, moralTeaching, supw, arabic } = body;

    const grades = await prisma.grades.upsert({
      where: { studentId: id },
      update: { urduSanskrit, moralTeaching, supw, arabic },
      create: { studentId: id, urduSanskrit, moralTeaching, supw, arabic },
    });

    return NextResponse.json(grades);
  } catch (error) {
    console.error("PUT /api/students/[id]/grades error:", error);
    return NextResponse.json({ error: "Failed to save grades" }, { status: 500 });
  }
}
