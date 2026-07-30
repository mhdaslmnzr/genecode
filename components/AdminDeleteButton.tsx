"use client";

export function AdminDeleteButton({ label }: { label: string }) {
  return (
    <button
      className="admin-btn admin-btn--danger"
      type="submit"
      onClick={(event) => {
        if (!window.confirm(`${label}? This permanently deletes it and cannot be undone.`)) {
          event.preventDefault();
        }
      }}
    >
      {label}
    </button>
  );
}
