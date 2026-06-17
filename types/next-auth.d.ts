import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface User {
    role?: "INDIVIDUAL" | "BUSINESS" | "CA_STAFF" | "CA_PARTNER";
  }

  interface Session {
    user: {
      id: string;
      role: "INDIVIDUAL" | "BUSINESS" | "CA_STAFF" | "CA_PARTNER";
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    role?: "INDIVIDUAL" | "BUSINESS" | "CA_STAFF" | "CA_PARTNER";
  }
}
