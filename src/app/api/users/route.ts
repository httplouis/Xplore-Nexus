import { NextResponse } from "next/server";
import type { ApiSuccess, ApiError, PaginatedResponse } from "@/types";
import { MOCK_USERS } from "@/lib/data/users";

function ok<T>(data: T, message?: string): NextResponse<ApiSuccess<T>> {
  return NextResponse.json({ success: true, data, ...(message ? { message } : {}) });
}
function err(error: string, status = 400): NextResponse<ApiError> {
  return NextResponse.json({ success: false, error }, { status });
}

// GET /api/users
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search")?.toLowerCase() ?? "";
  const role = searchParams.get("role");
  const status = searchParams.get("status");
  const page = Math.max(1, Number(searchParams.get("page") ?? "1"));
  const pageSize = Math.min(50, Math.max(1, Number(searchParams.get("pageSize") ?? "20")));

  let filtered = [...MOCK_USERS];

  if (search) {
    filtered = filtered.filter(
      (u) =>
        u.firstName.toLowerCase().includes(search) ||
        u.lastName.toLowerCase().includes(search) ||
        u.email.toLowerCase().includes(search) ||
        u.department.toLowerCase().includes(search)
    );
  }
  if (role) filtered = filtered.filter((u) => u.role === role);
  if (status) filtered = filtered.filter((u) => u.status === status);

  const total = filtered.length;
  const items = filtered.slice((page - 1) * pageSize, page * pageSize);

  const payload: PaginatedResponse<(typeof MOCK_USERS)[0]> = {
    items,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  };
  return ok(payload);
}
