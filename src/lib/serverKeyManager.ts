import fs from 'fs';
import path from 'path';
import { generateKeyPairSync, privateDecrypt } from 'crypto';

const KEY_DIR = path.resolve(process.cwd(), '.keys');
const PRIV_PATH = path.join(KEY_DIR, 'server_priv.pem');
const PUB_PATH = path.join(KEY_DIR, 'server_pub.pem');

function ensureKeys() {
  if (!fs.existsSync(KEY_DIR)) fs.mkdirSync(KEY_DIR, { recursive: true });

  if (!fs.existsSync(PRIV_PATH) || !fs.existsSync(PUB_PATH)) {
    const { publicKey, privateKey } = generateKeyPairSync('rsa', {
      modulusLength: 2048,
      publicKeyEncoding: { type: 'spki', format: 'pem' },
      privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
    });

    fs.writeFileSync(PRIV_PATH, privateKey);
    fs.writeFileSync(PUB_PATH, publicKey);
  }
}

export function getPublicKeyPEM(): string {
  ensureKeys();
  return fs.readFileSync(PUB_PATH, 'utf8');
}

export function decryptBase64(encryptedB64: string): string {
  ensureKeys();
  // encryptedB64 is expected to be a base64 string
  const priv = fs.readFileSync(PRIV_PATH, 'utf8');
  const buffer = Buffer.from(encryptedB64, 'base64');
  try {
    const decrypted = privateDecrypt(
      {
        key: priv,
        padding: require('crypto').constants.RSA_PKCS1_OAEP_PADDING,
        oaepHash: 'sha256',
      },
      buffer
    );

    return decrypted.toString('utf8');
  } catch (err) {
    console.error('Error decrypting payload:', err);
    throw err;
  }
}

export default { getPublicKeyPEM, decryptBase64 };
