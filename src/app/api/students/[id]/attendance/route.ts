import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// PUT /api/students/[id]/attendance
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { workingDays, daysPresent } = body;

    const attendance = await prisma.grades.upsert({
      where: { studentId: id },
      update: { },
      create: { studentId: id },
    });

    const attendanceData = await prisma.attendance.upsert({
      where: { studentId: id },
      update: {
        workingDays: workingDays !== undefined ? parseInt(workingDays) : undefined,
        daysPresent: daysPresent !== undefined ? parseInt(daysPresent) : undefined,
      },
      create: {
        studentId: id,
        workingDays: workingDays ? parseInt(workingDays) : null,
        daysPresent: daysPresent ? parseInt(daysPresent) : null,
      },
    });

    // Suppress unused variable warnings
    void attendance;

    return NextResponse.json(attendanceData);
  } catch (error) {
    console.error("PUT /api/students/[id]/attendance error:", error);
    return NextResponse.json({ error: "Failed to save attendance" }, { status: 500 });
  }
}
