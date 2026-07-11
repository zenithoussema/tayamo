import { prisma } from "./db";

export async function logAudit(params: {
  userId?: number;
  action: string;
  entity: string;
  entityId?: number;
  details?: string;
}) {
  try {
    await prisma.auditLog.create({ data: params });
  } catch (e) {
    console.error("Audit log failed:", e);
  }
}
