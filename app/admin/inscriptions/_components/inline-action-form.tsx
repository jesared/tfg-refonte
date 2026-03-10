"use client";

import type { ReactNode } from "react";

type InlineActionFormProps = {
  action: (formData: FormData) => void | Promise<void>;
  registrationId: string;
  children: ReactNode;
  confirmMessage?: string;
};

export function InlineActionForm({
  action,
  registrationId,
  children,
  confirmMessage,
}: InlineActionFormProps) {
  return (
    <form
      action={action}
      className="inline-flex"
      onSubmit={(event) => {
        if (confirmMessage && !window.confirm(confirmMessage)) {
          event.preventDefault();
        }
      }}
    >
      <input type="hidden" name="registrationId" value={registrationId} />
      {children}
    </form>
  );
}
