export function validatePhone(phone: string): { valid: boolean; error?: string } {
  const cleaned = phone.replace(/[\s\-().]/g, "");
  if (!cleaned) return { valid: false, error: "Le numéro de téléphone est requis" };
  if (!/^\+?\d{8,15}$/.test(cleaned)) return { valid: false, error: "Numéro de téléphone invalide" };
  return { valid: true };
}

export function validateEmail(email: string): { valid: boolean; error?: string } {
  if (!email) return { valid: true }; // optional
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { valid: false, error: "Adresse email invalide" };
  return { valid: true };
}

export function validateRequired(value: string, fieldName: string): { valid: boolean; error?: string } {
  if (!value || !value.trim()) return { valid: false, error: `Le champ ${fieldName} est requis` };
  return { valid: true };
}

export function validateNumber(value: string, fieldName: string, min?: number, max?: number): { valid: boolean; error?: string } {
  const num = Number(value);
  if (isNaN(num)) return { valid: false, error: `Le champ ${fieldName} doit être un nombre` };
  if (min !== undefined && num < min) return { valid: false, error: `Le champ ${fieldName} doit être ≥ ${min}` };
  if (max !== undefined && num > max) return { valid: false, error: `Le champ ${fieldName} doit être ≤ ${max}` };
  return { valid: true };
}
