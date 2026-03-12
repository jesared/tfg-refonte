import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { prisma } from "@/lib/prisma";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { canManageCommunityReports } from "@/lib/community/rbac";
import { ValidationError, parseUpdateReportStatusDto } from "@/lib/community/validation";

export async function PATCH(req: Request, { params }: { params: Promise<{ reportId: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!canManageCommunityReports(session)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { reportId } = await params;
    const dto = parseUpdateReportStatusDto(await req.json());

    if (!dto.status) {
      return NextResponse.json({ error: "Missing required field: status" }, { status: 400 });
    }

    const report = await prisma.communityReport.findUnique({ where: { id: reportId }, select: { id: true } });
    if (!report) {
      return NextResponse.json({ error: "Report not found" }, { status: 404 });
    }

    const updated = await prisma.communityReport.update({
      where: { id: reportId },
      data: {
        status: dto.status,
        reviewedAt: new Date(),
      },
    });

    return NextResponse.json({ data: updated });
  } catch (error) {
    if (error instanceof ValidationError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
