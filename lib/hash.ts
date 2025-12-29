import bcrypt from "bcryptjs";

export function hashPassword(password: string): string {
  const salt = bcrypt.genSaltSync(10);
  return bcrypt.hashSync(password, salt);
}

export function verifyPassword(hash: string, password: string): boolean {
  return bcrypt.compareSync(password, hash);
}
