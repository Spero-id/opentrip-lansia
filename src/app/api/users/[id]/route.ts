import { NextRequest, NextResponse } from "next/server";
import { authService } from "@/modules/auth";
import { auth } from "@/modules/auth/auth.config";
import { requireAdmin } from "@/shared/auth";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const denied = await requireAdmin(req);
  if (denied) return denied;

  try {
    const { id } = await params;
    const body = await req.json();

    // Anti-lockout: admin tidak bisa mengubah role dirinya sendiri
    const session = await auth.api.getSession({ headers: req.headers });
    if (
      session?.user &&
      session.user.id === id &&
      body.role &&
      body.role !== session.user.role
    ) {
      return NextResponse.json(
        { error: "Tidak dapat mengubah role akun sendiri" },
        { status: 400 }
      );
    }

    await authService.updateUser(id, body);
    return NextResponse.json({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Terjadi kesalahan";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const denied = await requireAdmin(req);
  if (denied) return denied;

  try {
    const { id } = await params;

    // Anti-lockout: admin tidak bisa menghapus akun sendiri
    const session = await auth.api.getSession({ headers: req.headers });
    if (session?.user && session.user.id === id) {
      return NextResponse.json(
        { error: "Tidak dapat menghapus akun sendiri" },
        { status: 400 }
      );
    }

    await authService.deleteUser(id);
    return NextResponse.json({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Terjadi kesalahan";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
