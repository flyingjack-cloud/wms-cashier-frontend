export type DateTimeValue = Date | string | number;

function normalizeIsoForDate(value: string): string {
  return value.replace(/(\.\d{3})\d+(Z|[+-]\d{2}:?\d{2})$/, "$1$2");
}

export function toIsoUtcString(value: DateTimeValue): string {
  return new Date(value).toISOString();
}

export function toDate(value: DateTimeValue | null | undefined): Date {
  if (value == null) {
    return new Date();
  }

  return new Date(typeof value === "string" ? normalizeIsoForDate(value) : value);
}
