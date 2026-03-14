/**
 * Utilitários compartilhados para operações com o Firebase Firestore.
 *
 * NOTA: O Firestore rejeita campos com valor `undefined`. Sempre use
 * `removeUndefinedFields()` antes de qualquer escrita (setDoc / updateDoc).
 */

function cleanValue(value: unknown): unknown {
  if (value === undefined) return undefined;
  if (value === null) return null;
  if (value instanceof Date) return value;
  if (Array.isArray(value)) return value.map(cleanValue);
  if (typeof value === 'object') return removeUndefinedFields(value as object);
  return value;
}

export function removeUndefinedFields<T extends object>(obj: T): T {
  const cleaned = {} as T;
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const value = obj[key];
      if (value === undefined) continue;
      const cleanedValue = cleanValue(value);
      if (cleanedValue !== undefined) {
        cleaned[key] = cleanedValue as T[Extract<keyof T, string>];
      }
    }
  }
  return cleaned;
}
