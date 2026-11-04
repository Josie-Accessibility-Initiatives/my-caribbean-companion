"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/AuthProvider";
import { errorMessage, fetchJson } from "@/lib/fetch-json";

const CONFIRM_WORD = "DELETE";

/** "Danger zone" on the profile page: permanently delete the account. */
export default function DeleteAccount() {
  const router = useRouter();
  const { signOut } = useAuth();
  const [open, setOpen] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  const close = () => {
    setOpen(false);
    setConfirmText("");
    setError("");
  };

  const handleDelete = async () => {
    setError("");
    try {
      setDeleting(true);
      await fetchJson("/api/account", { method: "DELETE" }, "Could not delete your account.");
      // Clears the local session and any saved plan/checklist in this browser.
      await signOut().catch(() => {});
      router.replace("/");
    } catch (err) {
      setError(errorMessage(err, "Could not delete your account. Please try again."));
      setDeleting(false);
    }
  };

  return (
    <section className="danger-zone" aria-labelledby="danger-zone-title">
      <h2 id="danger-zone-title">Delete account</h2>
      <p>
        Permanently delete your account, profile, saved plans and checklist progress.
        This cannot be undone.
      </p>

      {!open ? (
        <button type="button" className="btn-danger-outline" onClick={() => setOpen(true)}>
          Delete my account
        </button>
      ) : (
        <div className="danger-zone-confirm">
          <label className="form-label">
            Type <strong>{CONFIRM_WORD}</strong> to confirm
            <input
              className="form-input"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              autoComplete="off"
              autoFocus
            />
          </label>
          {error && <div className="form-error">{error}</div>}
          <div className="row">
            <button
              type="button"
              className="btn-danger"
              onClick={handleDelete}
              disabled={confirmText !== CONFIRM_WORD || deleting}
            >
              {deleting ? "Deleting…" : "Permanently delete"}
            </button>
            <button type="button" className="btn-secondary" onClick={close} disabled={deleting}>
              Cancel
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
