import { handlers } from "@/lib/auth";

export const { GET, POST } = handlers;
export const runtime = "nodejs"; // Force nodejs runtime for prisma / bcrypt
