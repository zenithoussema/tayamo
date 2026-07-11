import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-auth";
export const dynamic = "force-dynamic";

function csvEscape(value: string): string {
  const sanitized = value.replace(/^[=+\-@\t\r]/, "");
  return `"${sanitized.replace(/"/g, '""')}"`;
}

export async function GET(request: NextRequest) {
  const authError = requireAdmin(request);
  if (authError) return authError;

  const url = new URL(request.url);
  const type = url.searchParams.get("type");

  if (!type || !["members", "payments", "attendance"].includes(type)) {
    return NextResponse.json({ error: "Invalid type. Use: members, payments, attendance" }, { status: 400 });
  }

  let csv = "";
  let filename = "";

  if (type === "members") {
    const clients = await prisma.client.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        fullName: true,
        phone: true,
        email: true,
        activity: true,
        category: true,
        subscriptionStartDate: true,
        subscriptionDurationDays: true,
        pricePaid: true,
      },
    });
    csv = "id,fullName,phone,email,activity,category,subscriptionStartDate,subscriptionDurationDays,pricePaid\n";
    for (const c of clients) {
      csv += `${c.id},${csvEscape(c.fullName || "")},${csvEscape(c.phone)},${csvEscape(c.email || "")},${csvEscape(c.activity)},${c.category},${c.subscriptionStartDate.toISOString()},${c.subscriptionDurationDays},${c.pricePaid}\n`;
    }
    filename = "members.csv";
  } else if (type === "payments") {
    const payments = await prisma.payment.findMany({
      orderBy: { date: "desc" },
      include: { client: { select: { fullName: true } } },
    });
    csv = "id,clientName,amount,method,reference,date\n";
    for (const p of payments) {
      csv += `${p.id},${csvEscape(p.client.fullName || "")},${p.amount},${p.method},${csvEscape(p.reference || "")},${p.date.toISOString()}\n`;
    }
    filename = "payments.csv";
  } else if (type === "attendance") {
    const attendance = await prisma.attendance.findMany({
      orderBy: { checkIn: "desc" },
      include: { client: { select: { fullName: true } } },
    });
    csv = "id,clientName,checkIn,checkOut,method\n";
    for (const a of attendance) {
      csv += `${a.id},${csvEscape(a.client.fullName || "")},${a.checkIn.toISOString()},${a.checkOut ? a.checkOut.toISOString() : ""},${a.method}\n`;
    }
    filename = "attendance.csv";
  }

  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
