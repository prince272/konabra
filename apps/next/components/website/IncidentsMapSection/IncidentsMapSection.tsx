import { IncidentsMapBackground } from "./IncidentsMapBackground";
import { IncidentsMapHeadline } from "./IncidentsMapHeadline";
import { IncidentsMapFeatures } from "./IncidentsMapFeatures";
import { IncidentsMapCard } from "./IncidentsMapCard";

export const IncidentsMapSection = () => (
  <section id="incidents-map" className="relative overflow-hidden bg-background py-20">
    <IncidentsMapBackground />
    <div className="container relative z-10 mx-auto px-6 md:px-8">
      <IncidentsMapHeadline />
      <div className="grid items-center gap-12 md:grid-cols-2">
        <IncidentsMapFeatures />
        <IncidentsMapCard />
      </div>
    </div>
  </section>
); 