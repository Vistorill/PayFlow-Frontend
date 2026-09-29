import SiteHeader from "../components/landing/SiteHeader";
import Hero from "../components/landing/Hero";
import Institucional from "../components/landing/Institucional";
import Produtos from "../components/landing/Produtos";
import Microcredito from "../components/landing/Microcredito";
import Programas from "../components/landing/Programas";
import Contato from "../components/landing/Contato";
import Carreiras from "../components/landing/Carreiras";
import Imprensa from "../components/landing/Imprensa";
import AppDownload from "../components/landing/AppDownload";
import Selos from "../components/landing/Selos";
import SiteFooter from "../components/landing/SiteFooter";

export default function Landing() {
  return (
    <div className="min-h-screen bg-base-950 bg-radial-fade text-ink-100">
      <SiteHeader />
      <main>
        <Hero />
        <Institucional />
        <Produtos />
        <Microcredito />
        <Programas />
        <Contato />
        <Carreiras />
        <Imprensa />
        <AppDownload />
        <Selos />
      </main>
      <SiteFooter />
    </div>
  );
}
