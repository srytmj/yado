import { Hero } from "@/components/hero";
import { ServiceGrid } from "@/components/service-grid";
import { StatusDashboard } from "@/components/status-dashboard";
import { Footer } from "@/components/footer";
import { ScrollSection } from "@/components/interactive/scroll-section";
import { SectionSnap } from "@/components/interactive/section-snap";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col">
      <SectionSnap />
      <main className="flex flex-1 flex-col">
        <ScrollSection className="justify-center">
          <Hero />
        </ScrollSection>
        <ScrollSection id="services" className="justify-center">
          <ServiceGrid />
        </ScrollSection>
        <ScrollSection id="status" className="justify-between pt-24 pb-0">
          <StatusDashboard />
          <Footer />
        </ScrollSection>
      </main>
    </div>
  );
}
