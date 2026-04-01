import bcrypt from 'bcryptjs'
import { SignJWT, jwtVerify } from 'jose'

if (!process.env.NEXTAUTH_SECRET) {
  throw new Error('NEXTAUTH_SECRET environment variable is required for customer authentication')
}

const JWT_SECRET = new TextEncoder().encode(process.env.NEXTAUTH_SECRET)

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10)
}

export async function verifyPassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}

export async function createCustomerToken(payload: {
  id: string
  email: string
  name: string
  storeId: string
}): Promise<string> {
  return new SignJWT({ ...payload, role: 'customer' })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('30d')
    .sign(JWT_SECRET)
}

export async function verifyCustomerToken(token: string): Promise<any> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET)
    return payload
  } catch {
    return null
  }
}
