"use client";

import { ChevronRight } from "lucide-react";
import { useRef } from "react";

type RoleSelectFormProps = {
  userId: string;
  role: "USER" | "ADMIN";
  updateUserRole: (formData: FormData) => void | Promise<void>;
};

export function RoleSelectForm({ userId, role, updateUserRole }: RoleSelectFormProps) {
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <form ref={formRef} action={updateUserRole} className="flex items-center">
      <input type="hidden" name="userId" value={userId} />
      <div className="relative">
        <select
          name="role"
          aria-label="Changer le rôle utilisateur"
          defaultValue={role}
          onChange={() => formRef.current?.requestSubmit()}
          className="h-9 min-w-32 appearance-none rounded-md border border-input bg-background px-3 pr-9 text-sm font-medium text-foreground shadow-xs transition focus-visible:border-ring focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
        >
          <option value="USER">USER</option>
          <option value="ADMIN">ADMIN</option>
        </select>
        <ChevronRight
          className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 rotate-90 text-muted-foreground"
          aria-hidden="true"
        />
      </div>
    </form>
  );
}
