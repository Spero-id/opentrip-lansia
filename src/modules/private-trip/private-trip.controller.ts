import { NextRequest, NextResponse } from "next/server";
import { privateTripService } from "./private-trip.service";
import { auth } from "../auth/auth.config";

interface ValidationError {
  field: string;
  message: string;
}

function validateCreateRequest(body: Record<string, unknown>): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!body.title || typeof body.title !== "string" || body.title.trim().length === 0) {
    errors.push({ field: "title", message: "Judul perjalanan wajib diisi" });
  } else if (body.title.length > 255) {
    errors.push({ field: "title", message: "Judul perjalanan maksimal 255 karakter" });
  }

  if (body.durationDays == null || typeof body.durationDays !== "number" || body.durationDays < 1) {
    errors.push({ field: "durationDays", message: "Durasi perjalanan minimal 1 hari" });
  }

  if (body.participantsCount == null || typeof body.participantsCount !== "number" || body.participantsCount < 6) {
    errors.push({ field: "participantsCount", message: "Jumlah peserta minimal 6 orang" });
  } else if (body.participantsCount > 10) {
    errors.push({ field: "participantsCount", message: "Jumlah peserta maksimal 10 orang" });
  }

  if (!body.destinationPreferences || typeof body.destinationPreferences !== "string" || body.destinationPreferences.trim().length === 0) {
    errors.push({ field: "destinationPreferences", message: "Destinasi yang diinginkan wajib diisi" });
  }

  if (body.budgetEstimate != null && body.budgetEstimate !== "") {
    const val = Number(body.budgetEstimate);
    if (isNaN(val) || val < 0) {
      errors.push({ field: "budgetEstimate", message: "Kisaran anggaran harus berupa nominal valid dan tidak negatif" });
    }
  }

  if (body.specialRequirements != null && typeof body.specialRequirements === "string" && body.specialRequirements.length > 2000) {
    errors.push({ field: "specialRequirements", message: "Kebutuhan khusus maksimal 2000 karakter" });
  }

  return errors;
}

async function getSessionUserId(request: NextRequest): Promise<string | null> {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    return session?.user?.id ?? null;
  } catch {
    return null;
  }
}



export const privateTripController = {
  async create(req: NextRequest) {
    const userId = await getSessionUserId(req);
    if (!userId) {
      return NextResponse.json({ error: "Anda harus login untuk mengirim request" }, { status: 401 });
    }

    let body: Record<string, unknown>;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "Format request body tidak valid" }, { status: 400 });
    }

    const errors = validateCreateRequest(body);
    if (errors.length > 0) {
      return NextResponse.json({ errors }, { status: 400 });
    }

    try {
      const result = await privateTripService.submitRequest(userId, {
        title: body.title as string,
        durationDays: body.durationDays as number,
        participantsCount: body.participantsCount as number,
        destinationPreferences: (body.destinationPreferences as string) || "",
        specialRequirements: (body.specialRequirements as string) || undefined,
        budgetEstimate: body.budgetEstimate ? String(body.budgetEstimate) : undefined,
      });

      return NextResponse.json({
        id: result.id,
        status: result.status,
        submittedAt: result.submittedAt,
      }, { status: 201 });
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Gagal menyimpan request";
      return NextResponse.json({ error: message }, { status: 500 });
    }
  },

  async listByUser(req: NextRequest) {
    const userId = await getSessionUserId(req);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const requests = await privateTripService.findByUserId(userId);
    return NextResponse.json(requests);
  },

  async getById(req: NextRequest, { params }: { params: { id: string } }) {
    const userId = await getSessionUserId(req);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const request = await privateTripService.findById(params.id);
    if (!request) {
      return NextResponse.json({ error: "Request tidak ditemukan" }, { status: 404 });
    }
    if (request.userId !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    const proposals = await privateTripService.findProposalsByRequestId(params.id);
    return NextResponse.json({ ...request, proposals });
  },

  async listAdmin(req: NextRequest) {
    const url = new URL(req.url);
    const status = url.searchParams.get("status") || undefined;
    const search = url.searchParams.get("search") || undefined;
    const limit = Math.min(Number(url.searchParams.get("limit")) || 20, 100);
    const offset = Number(url.searchParams.get("offset")) || 0;
    return NextResponse.json(await privateTripService.findAll({ status, search, limit, offset }));
  },

  async getAdminDetail(req: NextRequest, { params }: { params: { id: string } }) {
    const request = await privateTripService.findById(params.id);
    if (!request) {
      return NextResponse.json({ error: "Request tidak ditemukan" }, { status: 404 });
    }
    const proposals = await privateTripService.findProposalsByRequestId(params.id);
    return NextResponse.json({ ...request, proposals });
  },

  async updateRequestStatus(req: NextRequest, { params }: { params: { id: string } }) {
    let body: { action?: string };
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "Invalid body" }, { status: 400 });
    }
    if (!body.action) {
      return NextResponse.json({ error: "Action is required" }, { status: 400 });
    }
    try {
      const result = await privateTripService.updateStatus(params.id, body.action);
      return NextResponse.json(result);
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Unknown error";
      return NextResponse.json({ error: message }, { status: 400 });
    }
  },

  async createProposal(req: NextRequest, { params }: { params: { id: string } }) {
    const userId = await getSessionUserId(req);
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    let body: { proposalContent?: string; estimatedPrice?: string; inclusions?: string; exclusions?: string };
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "Invalid body" }, { status: 400 });
    }
    if (!body.proposalContent) {
      return NextResponse.json({ error: "Konten proposal wajib diisi" }, { status: 400 });
    }
    if (body.estimatedPrice != null) {
      const price = Number(body.estimatedPrice);
      if (isNaN(price) || price < 0) {
        return NextResponse.json({ error: "Harga estimasi tidak valid" }, { status: 400 });
      }
    }
    try {
      const proposal = await privateTripService.createProposal(params.id, userId, {
        proposalContent: body.proposalContent,
        estimatedPrice: body.estimatedPrice || "",
        inclusions: body.inclusions || "",
        exclusions: body.exclusions || "",
      });
      return NextResponse.json(proposal, { status: 201 });
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Unknown error";
      return NextResponse.json({ error: message }, { status: 400 });
    }
  },

  async respondToProposal(req: NextRequest, { params }: { params: { id: string } }) {
    const userId = await getSessionUserId(req);
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    let body: { proposalId?: string; action?: string; revisionNote?: string };
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "Invalid body" }, { status: 400 });
    }
    if (!body.proposalId || !body.action) {
      return NextResponse.json({ error: "proposalId and action are required" }, { status: 400 });
    }
    if (body.action === "revise" && body.revisionNote && body.revisionNote.trim().length > 1000) {
      return NextResponse.json({ error: "Catatan revisi maksimal 1000 karakter" }, { status: 400 });
    }
    try {
      const result = await privateTripService.respondToProposal(
        params.id, body.proposalId, userId, body.action,
        body.revisionNote?.trim() || undefined
      );
      return NextResponse.json(result);
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Unknown error";
      return NextResponse.json({ error: message }, { status: 400 });
    }
  },
};
