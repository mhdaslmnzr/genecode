export function formatPrice(value: string | null | undefined) {
  if (!value) return "";
  const amount = value.trim().replace(/^[₹\s]+/, "");
  return amount ? `₹${amount}` : "";
}
