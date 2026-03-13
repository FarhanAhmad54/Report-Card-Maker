import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET /api/classes — list all classes (optionally filter by teacherId)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const teacherId = searchParams.get("teacherId");

    const classes = await prisma.class.findMany({
      where: teacherId ? { teacherId } : {},
      include: { _count: { select: { students: true } } },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(classes);
  } catch (error) {
    console.error("GET /api/classes error:", error);
    return NextResponse.json({ error: "Failed to fetch classes" }, { status: 500 });
  }
}

// POST /api/classes — create a new class
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { academicYear, className, section, teacherId } = body;

    if (!academicYear || !className || !section || !teacherId) {
      return NextResponse.json({ error: "academicYear, className, section, and teacherId are required" }, { status: 400 });
    }

    const existing = await prisma.class.findUnique({
      where: { academicYear_className_section: { academicYear, className, section } },
    });

    if (existing) {
      return NextResponse.json({ error: "This class already exists" }, { status: 409 });
    }

    const newClass = await prisma.class.create({
      data: { academicYear, className, section, teacherId },
    });

    return NextResponse.json(newClass, { status: 201 });
  } catch (error) {
    console.error("POST /api/classes error:", error);
    return NextResponse.json({ error: "Failed to create class" }, { status: 500 });
  }
}
