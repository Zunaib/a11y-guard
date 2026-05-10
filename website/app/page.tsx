import Nav from "@/components/Nav";
import Hero from "@/components/Hero";
import Terminal from "@/components/Terminal";
import Stats from "@/components/Stats";
import Features from "@/components/Features";
import CodeShowcase from "@/components/CodeShowcase";
import ComplianceTable from "@/components/ComplianceTable";
import InstallSection from "@/components/InstallSection";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <Terminal />
        <Stats />
        <Features />
        <CodeShowcase />
        <ComplianceTable />
        <InstallSection />
      </main>
      <Footer />
    </>
  );
}
