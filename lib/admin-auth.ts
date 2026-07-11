export { requireAuth as requireAdmin } from "./auth";
export { hasPermission, getAuthUser, requirePermission } from "./auth";
export type { UserRole } from "./auth";

import { NextRequest } from "next/server";

export function parsePagination(request: NextRequest) {
  const url = new URL(request.url);
  const page = Math.max(1, parseInt(url.searchParams.get("page") || "1"));
  const limit = Math.min(100, Math.max(1, parseInt(url.searchParams.get("limit") || "20")));
  const skip = (page - 1) * limit;
  return { page, limit, skip };
}

export function parseSearch(request: NextRequest) {
  const url = new URL(request.url);
  return url.searchParams.get("q") || "";
}

export function parseSort(request: NextRequest, allowedFields: string[]) {
  const url = new URL(request.url);
  const sortBy = url.searchParams.get("sortBy") || "createdAt";
  const order = url.searchParams.get("order") === "asc" ? "asc" : "desc";
  const field = allowedFields.includes(sortBy) ? sortBy : "createdAt";
  return { [field]: order } as Record<string, "asc" | "desc">;
}

export function parseFilter(request: NextRequest) {
  const url = new URL(request.url);
  const filters: Record<string, string> = {};
  url.searchParams.forEach((value, key) => {
    if (!["page", "limit", "q", "sortBy", "order"].includes(key)) {
      filters[key] = value;
    }
  });
  return filters;
}
