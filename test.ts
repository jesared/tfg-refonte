import { PrismaClient } from "@prisma/client";

async function main() {
  const prisma = new PrismaClient();
  await prisma.$disconnect();
  console.log("Prisma fonctionne");
}

void main();
