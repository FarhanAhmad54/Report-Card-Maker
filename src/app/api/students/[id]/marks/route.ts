import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { SUBJECTS } from "@/lib/subjects";
import { calculateStudentResults } from "@/lib/calculations";

// PUT /api/students/[id]/marks — save marks for a student
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    // Build update data from subject keys
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updateData: Record<string, any> = {};
    for (const subject of SUBJECTS) {
      if (body[subject.key] !== undefined) {
        updateData[subject.key] = body[subject.key];
      }
    }

    // Calculate results
    const existingMarks = await prisma.marks.findUnique({ where: { studentId: id } });
    const mergedMarks = { ...existingMarks, ...updateData };
    const { grandTotal, percentage, division, result } = calculateStudentResults(mergedMarks);

    updateData.grandTotal = grandTotal;
    updateData.percentage = percentage;
    updateData.division = division;
    updateData.result = result;

    const marks = await prisma.marks.upsert({
      where: { studentId: id },
      update: updateData,
      create: { studentId: id, ...updateData },
    });

    return NextResponse.json(marks);
  } catch (error) {
    console.error("PUT /api/students/[id]/marks error:", error);
    return NextResponse.json({ error: "Failed to save marks" }, { status: 500 });
  }
}
