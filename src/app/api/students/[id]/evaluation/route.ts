import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// PUT /api/students/[id]/evaluation
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { evalText, remarks } = body;

    const evaluation = await prisma.evaluation.upsert({
      where: { studentId: id },
      update: { evalText, remarks },
      create: { studentId: id, evalText, remarks },
    });

    return NextResponse.json(evaluation);
  } catch (error) {
    console.error("PUT /api/students/[id]/evaluation error:", error);
    return NextResponse.json({ error: "Failed to save evaluation" }, { status: 500 });
  }
}
