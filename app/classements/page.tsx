import type { Metadata } from "next";

import ClassementsContent from "./ClassementsContent";

export const metadata: Metadata = {
  title: "Classements",
  description:
    "Barème et classement général du Trophée François Grieder, avec règles de départage.",
};

export default function ClassementsPage() {
  return <ClassementsContent />;
}
