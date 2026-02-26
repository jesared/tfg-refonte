"use client";

import { useState } from "react";

type SyncFacebookButtonProps = {
  user?: {
    role?: string | null;
  } | null;
};

type ToastState = {
  type: "success" | "error";
  message: string;
} | null;

export function SyncFacebookButton({ user }: SyncFacebookButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState<ToastState>(null);

  if (user?.role !== "ADMIN") {
    return null;
  }

  const handleSync = async () => {
    setIsLoading(true);
    setToast(null);

    try {
      const response = await fetch("/api/sync-facebook", {
        method: "POST",
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as { error?: string } | null;
        throw new Error(payload?.error ?? "La synchronisation Facebook a échoué.");
      }

      setToast({
        type: "success",
        message: "Synchronisation Facebook lancée avec succès.",
      });
    } catch (error) {
      setToast({
        type: "error",
        message:
          error instanceof Error
            ? error.message
            : "Une erreur est survenue pendant la synchronisation.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      <button
        type="button"
        onClick={handleSync}
        disabled={isLoading}
        className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {isLoading ? "Synchronisation en cours..." : "Synchroniser Facebook"}
      </button>

      {toast && (
        <div
          role="status"
          aria-live="polite"
          className={`rounded-md border px-3 py-2 text-sm ${
            toast.type === "success"
              ? "border-emerald-300 bg-emerald-50 text-emerald-800"
              : "border-rose-300 bg-rose-50 text-rose-800"
          }`}
        >
          {toast.message}
        </div>
      )}
    </div>
  );
}
