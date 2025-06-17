export function generateIna() {
  const now = new Date();
  const datePart = now.toISOString().slice(0, 10).replace(/-/g, ''); // YYYYMMDD
  const randomPart = Math.floor(100000 + Math.random() * 900000).toString();// 6 caractères chiffre
  return `INE-${datePart}-${randomPart}`;
}