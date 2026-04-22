import { randomBytes } from "node:crypto";
import { NextRequest } from "next/server";
import { SignJWT, jwtVerify } from "jose";
import nacl from "tweetnacl";
import bs58 from "bs58";
import { PublicKey } from "@solana/web3.js";

const JWT_ALG = "HS256";
export const SESSION_COOKIE_NAME = "session";
const COOKIE_MAX_AGE_SECONDS = 7 * 24 * 60 * 60;
export const NONCE_TTL_MS = 5 * 60 * 1000;

export class UnauthorizedError extends Error {
  constructor(reason: string = "unauthenticated") {
    super(reason);
    this.name = "UnauthorizedError";
  }
}

function getJwtSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET env var missing");
  return new TextEncoder().encode(secret);
}

function getAppUrl(): string {
  const url = process.env.NEXT_PUBLIC_APP_URL;
  if (!url) throw new Error("NEXT_PUBLIC_APP_URL env var missing");
  return url;
}

export function isValidSolanaAddress(address: string): boolean {
  try {
    new PublicKey(address);
    return true;
  } catch {
    return false;
  }
}

export function generateNonce(): string {
  return bs58.encode(randomBytes(32));
}

export function buildSignInMessage(
  wallet: string,
  nonce: string,
  issuedAt: string = new Date().toISOString()
): string {
  return [
    "Sign in to Token Edge",
    "",
    `URL: ${getAppUrl()}`,
    `Wallet: ${wallet}`,
    `Nonce: ${nonce}`,
    `Issued: ${issuedAt}`,
  ].join("\n");
}

export function verifySolanaSignature(
  message: string,
  signatureBase58: string,
  walletBase58: string
): boolean {
  try {
    const messageBytes = new TextEncoder().encode(message);
    const signatureBytes = bs58.decode(signatureBase58);
    const pubkeyBytes = new PublicKey(walletBase58).toBytes();
    return nacl.sign.detached.verify(messageBytes, signatureBytes, pubkeyBytes);
  } catch {
    return false;
  }
}

export async function signSessionJwt(wallet: string): Promise<string> {
  return await new SignJWT({ wallet })
    .setProtectedHeader({ alg: JWT_ALG })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(getJwtSecret());
}

export async function verifySessionJwt(
  token: string
): Promise<{ wallet: string }> {
  const { payload } = await jwtVerify(token, getJwtSecret(), {
    algorithms: [JWT_ALG],
  });
  const wallet = payload.wallet;
  if (typeof wallet !== "string" || !isValidSolanaAddress(wallet)) {
    throw new Error("invalid session payload");
  }
  return { wallet };
}

export async function getSessionWallet(req: NextRequest): Promise<string> {
  const token = req.cookies.get(SESSION_COOKIE_NAME)?.value;
  if (!token) throw new UnauthorizedError();
  try {
    const { wallet } = await verifySessionJwt(token);
    return wallet;
  } catch {
    throw new UnauthorizedError();
  }
}

export function sessionCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: COOKIE_MAX_AGE_SECONDS,
  };
}

export function clearSessionCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: 0,
  };
}
