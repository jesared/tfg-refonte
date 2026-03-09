import { InputHTMLAttributes } from "react";

export type CategoryFormValues = {
  nom: string;
  heureDebut: string;
  heureFin: string;
  minPoints: string;
  maxPoints: string;
  maxJoueurs?: string;
};

type CategoryFormFieldsProps = {
  form: CategoryFormValues;
  allowEditMaxJoueurs: boolean;
  onChange: <K extends keyof CategoryFormValues>(field: K, value: CategoryFormValues[K]) => void;
};

function FieldLabel({ children }: { children: string }) {
  return <label className="mb-1 block text-sm font-medium text-foreground">{children}</label>;
}

function FieldInput(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm" />;
}

export function CategoryFormFields({ form, allowEditMaxJoueurs, onChange }: CategoryFormFieldsProps) {
  return (
    <>
      <div>
        <FieldLabel>Nom de la catégorie</FieldLabel>
        <FieldInput required value={form.nom} onChange={(e) => onChange("nom", e.target.value)} placeholder="Ex: Dames -1500" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <FieldLabel>Heure de début</FieldLabel>
          <FieldInput
            type="time"
            required
            value={form.heureDebut}
            onChange={(e) => onChange("heureDebut", e.target.value)}
          />
        </div>
        <div>
          <FieldLabel>Heure de fin (optionnel)</FieldLabel>
          <FieldInput type="time" value={form.heureFin} onChange={(e) => onChange("heureFin", e.target.value)} />
        </div>
      </div>

      <div className={`grid gap-4 ${allowEditMaxJoueurs ? "sm:grid-cols-3" : "sm:grid-cols-2"}`}>
        <div>
          <FieldLabel>Min points</FieldLabel>
          <FieldInput type="number" value={form.minPoints} onChange={(e) => onChange("minPoints", e.target.value)} />
        </div>
        <div>
          <FieldLabel>Max points</FieldLabel>
          <FieldInput type="number" value={form.maxPoints} onChange={(e) => onChange("maxPoints", e.target.value)} />
        </div>
        {allowEditMaxJoueurs && (
          <div>
            <FieldLabel>Max joueurs (tour courant)</FieldLabel>
            <FieldInput
              type="number"
              value={form.maxJoueurs ?? ""}
              onChange={(e) => onChange("maxJoueurs", e.target.value)}
            />
          </div>
        )}
      </div>
    </>
  );
}
