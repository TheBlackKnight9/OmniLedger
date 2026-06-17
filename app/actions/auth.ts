"use server";

import { db } from "@/lib/db";
import bcrypt from "bcryptjs";

export async function registerUser(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const name = formData.get("name") as string;

  if (!email || !password || !name) {
    return { error: "Missing required fields" };
  }

  try {
    const existingUser = await db.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return { error: "User already exists with this email" };
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await db.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
        role: "INDIVIDUAL", // Default role
      },
    });

    // Create an audit log
    await db.auditLog.create({
      data: {
        userId: user.id,
        action: "USER_REGISTER",
        resourceType: "User",
        resourceId: user.id,
        ipAddress: "127.0.0.1",
      },
    });

    return { success: true };
  } catch (error: any) {
    return { error: error.message || "Something went wrong" };
  }
}
