import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get("authorization");
    const passcode = authHeader?.split(" ")[1];

    if (passcode !== "admin123") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const teachers = await prisma.teacher.findMany({
      include: {
        classes: {
          include: {
            students: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const analyticsData = teachers.map((teacher) => {
      const totalClasses = teacher.classes.length;
      const totalStudents = teacher.classes.reduce(
        (sum, cls) => sum + cls.students.length,
        0
      );

      return {
        id: teacher.id,
        name: teacher.name,
        email: teacher.email,
        hashedPassword: teacher.password,
        createdAt: teacher.createdAt,
        totalClasses,
        totalStudents,
      };
    });

    const globalStats = {
      totalTeachers: teachers.length,
      totalClasses: analyticsData.reduce((sum, t) => sum + t.totalClasses, 0),
      totalStudents: analyticsData.reduce((sum, t) => sum + t.totalStudents, 0),
    };

    return NextResponse.json({ globalStats, teachers: analyticsData });
  } catch (error) {
    console.error("Admin API Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch analytics data" },
      { status: 500 }
    );
  }
}
