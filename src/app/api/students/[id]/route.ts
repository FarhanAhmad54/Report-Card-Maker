import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// PUT /api/students/[id] — update student info
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { rollNumber, name } = body;

    const student = await prisma.student.update({
      where: { id },
      data: {
        ...(rollNumber !== undefined && { rollNumber: parseInt(rollNumber) }),
        ...(name !== undefined && { name }),
      },
    });

    return NextResponse.json(student);
  } catch (error) {
    console.error("PUT /api/students/[id] error:", error);
    return NextResponse.json({ error: "Failed to update student" }, { status: 500 });
  }
}

// DELETE /api/students/[id] — delete a student
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.student.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/students/[id] error:", error);
    return NextResponse.json({ error: "Failed to delete student" }, { status: 500 });
  }
}
