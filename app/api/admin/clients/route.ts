import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin, parsePagination, parseSearch, parseFilter } from "@/lib/admin-auth";
import { logAudit } from "@/lib/audit";
import { checkRateLimit } from "@/lib/rate-limit";
import { validatePhone, validateEmail, validateRequired, validateNumber } from "@/lib/validation";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const authError = requireAdmin(request);
  if (authError) return authError;

  const { page, limit, skip } = parsePagination(request);
  const search = parseSearch(request);
  const filters = parseFilter(request);

  const where: Record<string, unknown> = {};

  if (filters.activity) where.activity = { contains: filters.activity, mode: "insensitive" };
  if (filters.category) where.category = filters.category;
  if (filters.planId) where.planId = Number(filters.planId);
  if (filters.from || filters.to) {
    const dateFilter: Record<string, Date> = {};
    if (filters.from) {
      const d = new Date(filters.from);
      if (!isNaN(d.getTime())) dateFilter.gte = d;
    }
    if (filters.to) {
      const d = new Date(filters.to);
      if (!isNaN(d.getTime())) { d.setHours(23, 59, 59, 999); dateFilter.lte = d; }
    }
    if (Object.keys(dateFilter).length > 0) {
      where.subscriptionStartDate = dateFilter;
    }
  }
  if (search) {
    where.OR = [
      { fullName: { contains: search, mode: "insensitive" } },
      { phone: { contains: search, mode: "insensitive" } },
      { activity: { contains: search, mode: "insensitive" } },
      { email: { contains: search, mode: "insensitive" } },
    ];
  }

  try {
    const [clients, total] = await Promise.all([
      prisma.client.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
        include: {
          plan: { select: { id: true, name: true, price: true, durationDays: true } },
          assignedCoach: { select: { id: true, name: true } },
        },
      }),
      prisma.client.count({ where }),
    ]);

    return NextResponse.json({ data: clients, total, page, limit });
  } catch (error) {
    console.error("Error fetching clients:", error);
    return NextResponse.json({ error: "Erreur lors du chargement des membres" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const authError = requireAdmin(request);
  if (authError) return authError;

  const ip = request.headers.get("x-forwarded-for") || "unknown";
  const { allowed } = checkRateLimit(`clients-create:${ip}`, 30, 60000);
  if (!allowed) {
    return NextResponse.json({ error: "Trop de tentatives. Réessayez dans 1 minute." }, { status: 429 });
  }

  const body = await request.json();
  const {
    fullName, phone, email, dateOfBirth, profileImageUrl,
    activity, category, subscriptionStartDate, subscriptionDurationDays,
    pricePaid, planId, assignedCoachId, notes,
  } = body;

  const nameCheck = validateRequired(fullName, "Nom complet");
  if (!nameCheck.valid) return NextResponse.json({ error: nameCheck.error }, { status: 400 });

  const phoneCheck = validatePhone(phone);
  if (!phoneCheck.valid) return NextResponse.json({ error: phoneCheck.error }, { status: 400 });

  if (email) {
    const emailCheck = validateEmail(email);
    if (!emailCheck.valid) return NextResponse.json({ error: emailCheck.error }, { status: 400 });
  }

  const priceCheck = validateNumber(String(pricePaid), "Prix", 0);
  if (!priceCheck.valid) return NextResponse.json({ error: priceCheck.error }, { status: 400 });

  if (!activity) {
    return NextResponse.json({ error: "Le champ Activité est requis" }, { status: 400 });
  }

  try {
    const client = await prisma.client.create({
      data: {
        fullName,
        phone,
        email: email || null,
        dateOfBirth: dateOfBirth && !isNaN(new Date(dateOfBirth).getTime()) ? new Date(dateOfBirth) : null,
        profileImageUrl: profileImageUrl || null,
        activity,
        category: category || "FITNESS",
        subscriptionStartDate: subscriptionStartDate && !isNaN(new Date(subscriptionStartDate).getTime()) ? new Date(subscriptionStartDate) : new Date(),
        subscriptionDurationDays: subscriptionDurationDays ?? 30,
        pricePaid: Number(pricePaid),
        planId: planId ? Number(planId) : null,
        assignedCoachId: assignedCoachId ? Number(assignedCoachId) : null,
        notes: notes || null,
      },
      include: {
        plan: { select: { id: true, name: true, price: true, durationDays: true } },
        assignedCoach: { select: { id: true, name: true } },
      },
    });

    logAudit({ action: "Created member", entity: "Client", entityId: client.id, details: `Created member: ${client.fullName}` });

    return NextResponse.json(client, { status: 201 });
  } catch (error) {
    console.error("Error creating client:", error);
    return NextResponse.json({ error: "Erreur lors de la création du membre" }, { status: 500 });
  }
}
