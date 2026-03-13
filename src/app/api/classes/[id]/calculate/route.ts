import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { calculateStudentResults } from "@/lib/calculations";
import { calcRanks } from "@/lib/calculations";

// POST /api/classes/[id]/calculate — recalculate all students' totals and ranks
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    void request;

    const students = await prisma.student.findMany({
      where: { classId: id },
      include: { marks: true },
    });

    // Step 1: Calculate totals for each student
    const studentTotals: { id: string; grandTotal: number }[] = [];

    for (const student of students) {
      if (!student.marks) continue;

      const marksData = student.marks;
      const { grandTotal, percentage, division, result } = calculateStudentResults(marksData);

      await prisma.marks.update({
        where: { studentId: student.id },
        data: { grandTotal, percentage, division, result },
      });

      studentTotals.push({ id: student.id, grandTotal });
    }

    // Step 2: Calculate ranks
    const rankMap = calcRanks(studentTotals);

    for (const [studentId, rank] of rankMap.entries()) {
      await prisma.marks.update({
        where: { studentId },
        data: { rank },
      });
    }

    return NextResponse.json({ success: true, studentsCalculated: studentTotals.length });
  } catch (error) {
    console.error("POST /api/classes/[id]/calculate error:", error);
    return NextResponse.json({ error: "Failed to calculate" }, { status: 500 });
  }
}
