import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Récompenses",
  description:
    "Informations connues sur le financement des dotations et le barème de points du classement général.",
};

export default function RecompensesPage() {
  return (
    <main className="min-h-screen bg-card px-6 py-16 text-foreground">
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-12">
        <header className="space-y-4">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Récompenses
          </p>
          <h1 className="text-4xl font-semibold leading-tight">
            Dotations et points du classement général
          </h1>
          <p className="text-lg text-muted-foreground">
            Cette page reprend uniquement les éléments confirmés sur les récompenses du challenge.
          </p>
        </header>

        <section className="grid gap-6 rounded-3xl border border-border bg-muted/40 p-8 shadow-sm">
          <div className="space-y-3">
            <h2 className="text-2xl font-semibold">Financement des dotations</h2>
            <p className="text-base leading-7 text-foreground/90">
              Les dotations du classement général sont financées par l&apos;ensemble des clubs
              participants. À ce jour, le montant exact des dotations n&apos;est pas connu à
              l&apos;avance.
            </p>
            <div className="grid gap-3 text-sm text-muted-foreground sm:grid-cols-2">
              <div className="rounded-2xl border border-border bg-card/80 p-4">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Montants</p>
                <p className="mt-2">
                  Les montants de récompense ne sont pas définis à l&apos;avance.
                </p>
              </div>
              <div className="rounded-2xl border border-border bg-card/80 p-4">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                  Participation
                </p>
                <p className="mt-2">
                  Chaque club contribue au financement des dotations du classement général.
                </p>
              </div>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-border bg-card p-4">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Contribution</p>
              <p className="mt-2 text-base font-semibold text-foreground">Club participant</p>
              <p className="mt-2 text-sm text-muted-foreground">
                La participation existe, mais le niveau de contribution n&apos;est pas précisé.
              </p>
            </div>
            <div className="rounded-2xl border border-border bg-card p-4">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Répartition</p>
              <p className="mt-2 text-base font-semibold text-foreground">
                Information non communiquée
              </p>
              <p className="mt-2 text-sm text-muted-foreground">
                Le mode de répartition des dotations n&apos;est pas encore détaillé.
              </p>
            </div>
          </div>
        </section>

        <section className="space-y-6">
          <h2 className="text-2xl font-semibold">Barème de points</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {[
              { round: "Vainqueur", points: "9 points" },
              { round: "Finaliste", points: "6 points" },
              { round: "Demi-finaliste", points: "4 points" },
              { round: "Quart de finaliste", points: "2 points" },
              { round: "Autres", points: "0 point" },
            ].map((item) => (
              <article key={item.round} className="rounded-2xl border border-border bg-card p-5 shadow-sm">
                <p className="text-sm uppercase tracking-wide text-muted-foreground">{item.round}</p>
                <p className="mt-2 text-2xl font-semibold">{item.points}</p>
              </article>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
