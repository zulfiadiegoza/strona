import PublicList from "@/components/PublicList";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Lista filmów | Baza Filmów",
  description: "Publiczna lista filmów",
};

export default function ListaPage() {
  return <PublicList />;
}
