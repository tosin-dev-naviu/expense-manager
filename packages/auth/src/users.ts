import { z } from "zod";

import { hashPassword, verifyPassword } from "./password";

const credentialsSchema = z.object({
  email: z.email().transform((value) => value.trim().toLowerCase()),
  password: z.string().min(8),
});

type UserRecord = {
  id: string;
  email: string | null;
  name?: string | null;
  passwordHash?: string | null;
};

type UserDb = {
  user: {
    findUnique(args: unknown): Promise<UserRecord | null>;
    create(args: unknown): Promise<UserRecord>;
  };
};

export async function registerUser(
  input: { name: string; email: string; password: string },
  { db }: { db: UserDb },
): Promise<{ id: string; email: string | null; name?: string | null }> {
  const values = credentialsSchema.extend({
    name: z.string().trim().min(1),
  }).parse(input);

  const passwordHash = await hashPassword(values.password);

  return db.user.create({
    data: {
      email: values.email,
      name: values.name,
      passwordHash,
    },
    select: {
      id: true,
      email: true,
      name: true,
    },
  });
}

export async function authenticateUser(
  input: { email: string; password: string },
  { db }: { db: UserDb },
): Promise<{ id: string; email: string | null; name?: string | null }> {
  const values = credentialsSchema.parse(input);
  const user = await db.user.findUnique({
    where: { email: values.email },
    select: {
      id: true,
      email: true,
      name: true,
      passwordHash: true,
    },
  });

  if (!user || !(await verifyPassword(values.password, user.passwordHash))) {
    throw new Error("Invalid email or password.");
  }

  return {
    id: user.id,
    email: user.email,
    name: user.name,
  };
}
