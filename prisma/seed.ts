import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { seedComplianceTasks } from "../lib/complianceRules";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding started...");

  // 1. Clean database
  await prisma.auditLog.deleteMany();
  await prisma.complianceTask.deleteMany();
  await prisma.document.deleteMany();
  await prisma.entity.deleteMany();
  await prisma.user.deleteMany();

  console.log("Cleaned existing data.");

  // 2. Hash password
  const passwordHash = await bcrypt.hash("password123", 10);

  // 3. Create Users
  const individualUser = await prisma.user.create({
    data: {
      email: "individual@test.com",
      name: "Aditya Sharma",
      password: passwordHash,
      role: "INDIVIDUAL",
    },
  });

  const businessUser = await prisma.user.create({
    data: {
      email: "business@test.com",
      name: "Rajesh Singhania",
      password: passwordHash,
      role: "BUSINESS",
    },
  });

  const caUser = await prisma.user.create({
    data: {
      email: "ca@test.com",
      name: "CA Neha Gupta",
      password: passwordHash,
      role: "CA_PARTNER",
    },
  });

  console.log("Created users:", {
    individual: individualUser.email,
    business: businessUser.email,
    ca: caUser.email,
  });

  // 4. Create Entities
  // Entity 1: Individual
  const individualEntity = await prisma.entity.create({
    data: {
      userId: individualUser.id,
      entityType: "INDIVIDUAL",
      pan: "ABCDE1234F",
      displayName: "Aditya Sharma (Individual)",
      complianceProfile: {
        role: "INDIVIDUAL",
        isAudit: false,
        salarySources: ["Salary Income", "House Property / Rental Income"],
      },
    },
  });

  // Entity 2: Business
  const businessEntity = await prisma.entity.create({
    data: {
      userId: businessUser.id,
      entityType: "COMPANY",
      pan: "ACDFG5678H",
      gstin: "27AAAAA1111A1Z1",
      cin: "U12345MH2021PTC123456",
      tan: "MUMT09876A",
      displayName: "Singhania Tech Private Limited",
      complianceProfile: {
        role: "BUSINESS",
        isAudit: true,
        hasGstin: true,
        hasTan: true,
        hasCin: true,
      },
    },
  });

  // Entity 3: CA Firm
  const caEntity = await prisma.entity.create({
    data: {
      userId: caUser.id,
      entityType: "FIRM",
      pan: "FRNKH8877L",
      displayName: "Neha Gupta & Associates",
      complianceProfile: {
        role: "CA_PARTNER",
        firmName: "Neha Gupta & Associates",
      },
    },
  });

  console.log("Created entities.");

  // 5. Seed Compliance Tasks using seedComplianceTasks
  console.log("Generating compliance calendar tasks...");

  // Seed tasks for Individual Entity
  await seedComplianceTasks(individualEntity.id, {
    role: "INDIVIDUAL",
    isAudit: false,
    salarySources: ["Salary Income", "House Property / Rental Income"],
  });

  // Seed tasks for Business Entity
  await seedComplianceTasks(businessEntity.id, {
    role: "BUSINESS",
    isAudit: true,
    hasGstin: true,
    hasTan: true,
    hasCin: true,
  });

  // Seed tasks for CA Entity
  await seedComplianceTasks(caEntity.id, {
    role: "CA_PARTNER",
    firmName: "Neha Gupta & Associates",
  });

  console.log("Seeding compliance tasks complete.");

  // 6. Add some Audit Logs
  await prisma.auditLog.create({
    data: {
      userId: individualUser.id,
      action: "SEED_INIT_DATA",
      resourceType: "System",
      ipAddress: "127.0.0.1",
    },
  });

  console.log("Seeding finished successfully!");
}

main()
  .catch((e) => {
    console.error("Error during seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
