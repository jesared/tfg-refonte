import { Mail, MapPin } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Contactez l'organisation du Trophée François Grieder pour toute question relative aux tournois, classements ou fonctionnement du challenge.",
};

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-card px-6 py-16 text-foreground">
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-12">
        {/* HEADER */}
        <header className="space-y-4">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Contact
          </p>

          <h1 className="text-4xl font-semibold leading-tight">Nous contacter</h1>

          <p className="text-lg leading-8 text-foreground/90">
            Une question concernant le Trophée François Grieder, le classement général ou
            l&apos;organisation des tournois ? L’équipe du challenge est à votre disposition.
          </p>
        </header>

        {/* INFORMATIONS */}
        <section className="grid gap-6 md:grid-cols-2">
          {/* EMAIL */}
          <div className="rounded-xl border border-border/60 bg-background/60 p-6 space-y-4">
            <div className="flex items-center gap-3">
              <Mail className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-semibold">Adresse email</h2>
            </div>

            <a
              href="mailto:contact@tropheefg.fr"
              className="text-primary font-medium hover:underline"
            >
              contact@tropheefg.fr
            </a>

            <p className="text-sm text-muted-foreground">
              Nous nous efforçons de répondre dans les meilleurs délais.
            </p>
          </div>

          {/* ORGANISATION */}
          <div className="rounded-xl border border-border/60 bg-background/60 p-6 space-y-4">
            <div className="flex items-center gap-3">
              <MapPin className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-semibold">Organisation</h2>
            </div>

            <p className="text-foreground/90">
              Challenge régional organisé dans les départements de la Marne et des Ardennes.
            </p>

            <p className="text-sm text-muted-foreground">
              Les tournois sont organisés par les clubs partenaires du circuit.
            </p>
          </div>
        </section>

        {/* NOTE */}
        <section className="rounded-lg border border-border/60 bg-muted/40 p-6 text-sm leading-6 text-muted-foreground">
          Pour les inscriptions aux tournois, merci d’utiliser les plateformes d’inscription propres
          à chaque club organisateur.
        </section>
      </div>
    </main>
  );
}
