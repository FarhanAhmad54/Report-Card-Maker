import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

// POST /api/auth/register — register a new teacher
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, password } = body;

    if (!name || !email || !password) {
      return NextResponse.json({ error: "name, email, and password are required" }, { status: 400 });
    }

    const existing = await prisma.teacher.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: "A teacher with this email already exists" }, { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const teacher = await prisma.teacher.create({
      data: { name, email, password: hashedPassword },
    });

    return NextResponse.json({ id: teacher.id, name: teacher.name, email: teacher.email }, { status: 201 });
  } catch (error) {
    console.error("POST /api/auth/register error:", error);
    return NextResponse.json({ error: "Failed to register" }, { status: 500 });
  }
}
