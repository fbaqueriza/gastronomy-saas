/**
 * Utilidades para normalizar y manejar números de teléfono
 */

/**
 * Normaliza un número de teléfono para uso consistente
 * @param phone - Número de teléfono en cualquier formato
 * @returns Número normalizado con formato +XXXXXXXXXX
 */
export function normalizePhoneNumber(phone: string | null | undefined): string {
  if (!phone) return '';
  
  // Remover todos los caracteres no numéricos excepto el +
  let normalized = phone.replace(/[^\d+]/g, '');
  
  // Si no empieza con +, agregarlo
  if (!normalized.startsWith('+')) {
    normalized = `+${normalized}`;
  }
  
  // Remover + duplicados
  normalized = normalized.replace(/\++/g, '+');
  
  return normalized;
}

/**
 * Compara dos números de teléfono ignorando formato
 * @param phone1 - Primer número
 * @param phone2 - Segundo número
 * @returns true si son el mismo número
 */
export function phoneNumbersMatch(phone1: string | null | undefined, phone2: string | null | undefined): boolean {
  const normalized1 = normalizePhoneNumber(phone1);
  const normalized2 = normalizePhoneNumber(phone2);
  
  if (!normalized1 || !normalized2) return false;
  
  // Comparar sin el +
  const clean1 = normalized1.replace('+', '');
  const clean2 = normalized2.replace('+', '');
  
  return clean1 === clean2;
}

/**
 * Formatea un número para mostrar en la UI
 * @param phone - Número de teléfono
 * @returns Número formateado para mostrar
 */
export function formatPhoneForDisplay(phone: string | null | undefined): string {
  const normalized = normalizePhoneNumber(phone);
  if (!normalized) return '';
  
  // Para números argentinos (+54), formatear como +54 9 11 XXXX-XXXX
  if (normalized.startsWith('+54')) {
    const digits = normalized.slice(3); // Remover +54
    if (digits.length >= 10) {
      const area = digits.slice(0, 2);
      const first = digits.slice(2, 6);
      const second = digits.slice(6, 10);
      return `+54 ${area} ${first}-${second}`;
    }
  }
  
  return normalized;
}

/**
 * Valida si un número de teléfono es válido
 * @param phone - Número de teléfono
 * @returns true si es válido
 */
export function isValidPhoneNumber(phone: string | null | undefined): boolean {
  const normalized = normalizePhoneNumber(phone);
  
  // Debe tener al menos 10 dígitos después del +
  const digits = normalized.replace('+', '');
  return digits.length >= 10 && digits.length <= 15 && /^\d+$/.test(digits);
}
