export function AdminNotice({ success, error }: { success?: string; error?: string }) {
  const message = error || success;
  if (!message) return null;
  return <p className={error ? "admin-notice admin-notice--error" : "admin-notice admin-notice--success"} role="status">{message}</p>;
}
