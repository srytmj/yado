import { Hero } from "@/components/hero";
import { ServiceGrid } from "@/components/service-grid";
import { StatusDashboard } from "@/components/status-dashboard";
import { Footer } from "@/components/footer";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col">
      <main className="flex flex-1 flex-col">
        {/* Hero Entry Section */}
        <section className="relative flex flex-col items-center justify-center">
          <Hero />
        </section>

        {/* Microservices & Portals Registry Section */}
        <section id="services" className="relative scroll-mt-24 py-16 sm:py-24">
          <ServiceGrid />
        </section>

        {/* Fleet Health Telemetry Section */}
        <section id="status" className="relative scroll-mt-24 py-16 sm:py-24">
          <StatusDashboard />
        </section>
      </main>

      {/* Footer seamlessly connected */}
      <Footer />
    </div>
  );
}
