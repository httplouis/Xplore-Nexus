import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { TrainingStatus } from "@prisma/client";

type Params = { params: { id: string } };

// POST /api/training/[id]/enroll
export async function POST(request: Request, { params }: Params) {
  try {
    const { id: trainingId } = params;
    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json({ success: false, error: "userId is required" }, { status: 400 });
    }

    const enrollment = await prisma.enrollment.upsert({
      where: {
        userId_trainingId: {
          userId,
          trainingId,
        },
      },
      update: {},
      create: {
        userId,
        trainingId,
        progress: 0,
        status: TrainingStatus.IN_PROGRESS,
      },
    });

    return NextResponse.json({ success: true, data: enrollment, message: "Enrolled successfully" });
  } catch (error: any) {
    console.error("POST enroll error:", error);
    return NextResponse.json({ success: false, error: "Internal server error: " + error.message }, { status: 500 });
  }
}
