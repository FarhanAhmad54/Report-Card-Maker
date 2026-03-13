import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET /api/classes/[id]/students — list students
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const students = await prisma.student.findMany({
      where: { classId: id },
      orderBy: { rollNumber: "asc" },
      include: { marks: true, grades: true, attendance: true, evaluation: true },
    });

    return NextResponse.json(students);
  } catch (error) {
    console.error("GET /api/classes/[id]/students error:", error);
    return NextResponse.json({ error: "Failed to fetch students" }, { status: 500 });
  }
}

// POST /api/classes/[id]/students — add a student
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { rollNumber, name } = body;

    if (!rollNumber || !name) {
      return NextResponse.json({ error: "rollNumber and name are required" }, { status: 400 });
    }

    const student = await prisma.student.create({
      data: {
        rollNumber: parseInt(rollNumber),
        name,
        classId: id,
        marks: { create: {} },
        grades: { create: {} },
        attendance: { create: {} },
        evaluation: { create: {} },
      },
      include: { marks: true, grades: true, attendance: true, evaluation: true },
    });

    return NextResponse.json(student, { status: 201 });
  } catch (error) {
    console.error("POST /api/classes/[id]/students error:", error);
    return NextResponse.json({ error: "Failed to add student" }, { status: 500 });
  }
}
