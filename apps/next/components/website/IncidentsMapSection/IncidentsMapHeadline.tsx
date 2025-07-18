import { Chip } from "@heroui/chip";

export const IncidentsMapHeadline = () => (
  <div className="mb-16 text-center">
    <Chip color="primary" variant="flat" radius="full" className="mb-4">
      Incident Reporting
    </Chip>
    <h2 className="mb-4 font-montserrat text-3xl font-bold md:text-4xl">
      Quickly Report &{" "}
      <span className="relative inline-block text-primary">
        Monitor Incidents
        <span className="absolute -bottom-2 left-0 h-1 w-full bg-primary/40"></span>
      </span>
    </h2>
    <p className="mx-auto max-w-2xl text-foreground-600">
      Easily report road incidents and see them displayed on an interactive map
    </p>
  </div>
); 