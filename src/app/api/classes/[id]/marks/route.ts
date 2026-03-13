import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { SUBJECTS } from "@/lib/subjects";
import { calculateStudentResults, calcRanks } from "@/lib/calculations";

// PUT /api/classes/[id]/marks — bulk save marks for all students in a class
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    // body.students should be an array of { studentId, marks: { subjectKey: { ut, cp, hye }, ... } }
    const { students } = body;

    if (!students || !Array.isArray(students)) {
      return NextResponse.json({ error: "students array is required" }, { status: 400 });
    }

    const studentTotals: { id: string; grandTotal: number }[] = [];

    for (const entry of students) {
      const { studentId, marks: marksData, grades: gradesData, attendance: attendanceData, evaluation: evalData } = entry;

      // Save marks
      if (marksData) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const updateData: Record<string, any> = {};
        for (const subject of SUBJECTS) {
          if (marksData[subject.key] !== undefined) {
            updateData[subject.key] = marksData[subject.key];
          }
        }

        // Get existing marks to merge
        const existing = await prisma.marks.findUnique({ where: { studentId } });
        const merged = { ...existing, ...updateData };
        const { grandTotal, percentage, division, result } = calculateStudentResults(merged);

        updateData.grandTotal = grandTotal;
        updateData.percentage = percentage;
        updateData.division = division;
        updateData.result = result;

        await prisma.marks.upsert({
          where: { studentId },
          update: updateData,
          create: { studentId, ...updateData },
        });

        studentTotals.push({ id: studentId, grandTotal });
      }

      // Save grades
      if (gradesData) {
        await prisma.grades.upsert({
          where: { studentId },
          update: gradesData,
          create: { studentId, ...gradesData },
        });
      }

      // Save attendance
      if (attendanceData) {
        await prisma.attendance.upsert({
          where: { studentId },
          update: {
            workingDays: attendanceData.workingDays != null ? parseInt(attendanceData.workingDays) : undefined,
            daysPresent: attendanceData.daysPresent != null ? parseInt(attendanceData.daysPresent) : undefined,
          },
          create: {
            studentId,
            workingDays: attendanceData.workingDays != null ? parseInt(attendanceData.workingDays) : null,
            daysPresent: attendanceData.daysPresent != null ? parseInt(attendanceData.daysPresent) : null,
          },
        });
      }

      // Save evaluation
      if (evalData) {
        await prisma.evaluation.upsert({
          where: { studentId },
          update: evalData,
          create: { studentId, ...evalData },
        });
      }
    }

    // Recalculate ranks for the entire class
    if (studentTotals.length > 0) {
      // Get all students' totals (not just the ones being updated)
      const allStudentsMarks = await prisma.marks.findMany({
        where: { student: { classId: id } },
        select: { studentId: true, grandTotal: true },
      });

      const allTotals = allStudentsMarks.map(m => ({
        id: m.studentId,
        grandTotal: m.grandTotal || 0,
      }));

      const rankMap = calcRanks(allTotals);

      for (const [studentId, rank] of rankMap.entries()) {
        await prisma.marks.update({
          where: { studentId },
          data: { rank },
        });
      }
    }

    return NextResponse.json({ success: true, count: students.length });
  } catch (error) {
    console.error("PUT /api/classes/[id]/marks error:", error);
    return NextResponse.json({ error: "Failed to save marks" }, { status: 500 });
  }
}
