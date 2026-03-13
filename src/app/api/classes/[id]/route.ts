import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET /api/classes/[id] — get a class with students
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const classData = await prisma.class.findUnique({
      where: { id },
      include: {
        students: {
          orderBy: { rollNumber: "asc" },
          include: { marks: true, grades: true, attendance: true, evaluation: true },
        },
      },
    });

    if (!classData) {
      return NextResponse.json({ error: "Class not found" }, { status: 404 });
    }

    return NextResponse.json(classData);
  } catch (error) {
    console.error("GET /api/classes/[id] error:", error);
    return NextResponse.json({ error: "Failed to fetch class" }, { status: 500 });
  }
}

// DELETE /api/classes/[id] — delete a class
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.class.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/classes/[id] error:", error);
    return NextResponse.json({ error: "Failed to delete class" }, { status: 500 });
  }
}
