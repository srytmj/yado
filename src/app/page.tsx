import { Navbar } from "@/components/navbar";
import { Hero } from "@/components/hero";
import { ServiceGrid } from "@/components/service-grid";
import { StatusDashboard } from "@/components/status-dashboard";
import { Footer } from "@/components/footer";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col">
      <Navbar />
      <Hero />
      <ServiceGrid />
      <StatusDashboard />
      <Footer />
    </div>
  );
}
