"use client";

import { ChevronRight } from "lucide-react";
import { useRef } from "react";

type PostStatusFormProps = {
  postId: string;
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED" | "HIDDEN";
  updatePostStatus: (formData: FormData) => void | Promise<void>;
};

export function PostStatusForm({ postId, status, updatePostStatus }: PostStatusFormProps) {
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <form ref={formRef} action={updatePostStatus} className="flex items-center">
      <input type="hidden" name="postId" value={postId} />
      <div className="relative">
        <select
          name="status"
          aria-label="Changer le statut de la publication"
          defaultValue={status}
          onChange={() => formRef.current?.requestSubmit()}
          className="h-9 min-w-36 appearance-none rounded-md border border-input bg-background px-3 pr-9 text-sm font-medium text-foreground shadow-xs transition focus-visible:border-ring focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
        >
          <option value="DRAFT">Brouillon</option>
          <option value="PUBLISHED">Publié</option>
          <option value="ARCHIVED">Archivé</option>
          <option value="HIDDEN">Masqué</option>
        </select>
        <ChevronRight
          className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 rotate-90 text-muted-foreground"
          aria-hidden="true"
        />
      </div>
    </form>
  );
}
