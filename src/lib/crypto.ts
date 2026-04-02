import crypto from "crypto"

const ALGORITHM = "aes-256-gcm"

function getKey() {
  const raw = process.env.ENCRYPTION_KEY || ""
  if (!raw) throw new Error("ENCRYPTION_KEY env var is not set")
  return crypto.createHash("sha256").update(raw).digest()
}

export function encryptObj(obj: any): string {
  const key = getKey()
  const iv = crypto.randomBytes(12)
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv)
  const plaintext = JSON.stringify(obj)
  const encrypted = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()])
  const tag = cipher.getAuthTag()
  // store as iv.tag.cipher
  return `${iv.toString("base64")}.${tag.toString("base64")}.${encrypted.toString("base64")}`
}

export function decryptToObj(payload: string): any {
  const key = getKey()
  // support two formats:
  // 1) AES-GCM encoded as iv.tag.cipher (base64 parts)
  // 2) legacy plaintext JSON stored directly

  // quick attempt: if payload looks like JSON, parse directly
  const trimmed = payload.trim()
  if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
    try {
      return JSON.parse(trimmed)
    } catch (e) {
      // fallthrough to attempt decryption
    }
  }

  const parts = payload.split('.')
  if (parts.length !== 3) throw new Error('Invalid encrypted payload')
  const iv = Buffer.from(parts[0], 'base64')
  const tag = Buffer.from(parts[1], 'base64')
  const encrypted = Buffer.from(parts[2], 'base64')
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv)
  decipher.setAuthTag(tag)
  const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()])
  return JSON.parse(decrypted.toString('utf8'))
}
