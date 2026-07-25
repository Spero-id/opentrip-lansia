import { NextRequest, NextResponse } from "next/server";
import { auth } from "./auth.config";
import { toNextJsHandler } from "better-auth/next-js";

export const { GET, POST } = toNextJsHandler(auth.handler ?? auth);
