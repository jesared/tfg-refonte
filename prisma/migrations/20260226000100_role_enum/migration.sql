-- Create enum for user role
CREATE TYPE "Role" AS ENUM ('USER', 'ADMIN');

-- Convert existing role column from text to enum
ALTER TABLE "User"
ALTER COLUMN "role" TYPE "Role"
USING ("role"::"Role");

-- Keep default role for newly created users
ALTER TABLE "User"
ALTER COLUMN "role" SET DEFAULT 'USER';
