import { motion } from "framer-motion";
import { Button } from "@heroui/button";
import { Camera, Navigation, SortAsc, ArrowRight } from "lucide-react";

export const IncidentsMapFeatures = () => (
  <div>
    <div className="space-y-8">
      <motion.div
        className="flex gap-4"
        initial={{ opacity: 0, x: -20 }}
        whileInView={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
        viewport={{ once: true, margin: "-100px" }}
      >
        <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-warning/10 text-warning">
          <Camera size={20} />
        </div>
        <div>
          <h3 className="mb-2 font-montserrat text-xl font-semibold">Photo Evidence</h3>
          <p className="text-foreground-600">
            Add photos to your incident reports to provide visual evidence and help others
            understand the situation.
          </p>
        </div>
      </motion.div>
      <motion.div
        className="flex gap-4"
        initial={{ opacity: 0, x: -20 }}
        whileInView={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        viewport={{ once: true, margin: "-100px" }}
      >
        <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-success-500/10 text-success-500">
          <Navigation size={20} />
        </div>
        <div>
          <h3 className="mb-2 font-montserrat text-xl font-semibold">Precise Location</h3>
          <p className="text-foreground-600">
            GPS integration ensures accurate location data for each incident, making it easy
            for others to avoid trouble spots.
          </p>
        </div>
      </motion.div>
      <motion.div
        className="flex gap-4"
        initial={{ opacity: 0, x: -20 }}
        whileInView={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        viewport={{ once: true, margin: "-100px" }}
      >
        <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-warning/10 text-warning">
          <SortAsc size={20} />
        </div>
        <div>
          <h3 className="mb-2 font-montserrat text-xl font-semibold">Incident History</h3>
          <p className="text-foreground-600">
            Track the history of reported incidents to identify recurring problems and
            monitor resolution progress.
          </p>
        </div>
      </motion.div>
      <div className="pt-4">
        <Button
          color="success"
          variant="solid"
          radius="full"
          endContent={<ArrowRight size={20} />}
        >
          View Incident Map
        </Button>
      </div>
    </div>
  </div>
); 