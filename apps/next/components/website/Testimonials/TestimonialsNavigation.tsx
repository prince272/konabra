import React from "react";
import { Button } from "@heroui/button";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { SwiperRef } from "swiper/react";

interface TestimonialsNavigationProps {
  swiperRef: React.RefObject<SwiperRef>;
}

export const TestimonialsNavigation: React.FC<TestimonialsNavigationProps> = ({ swiperRef }) => (
  <div className="mt-8 flex justify-center gap-4">
    <Button
      isIconOnly
      variant="flat"
      radius="full"
      aria-label="Previous testimonial"
      onPress={() => swiperRef.current?.swiper.slidePrev()}
    >
      <ArrowLeft size={20} />
    </Button>
    <Button
      isIconOnly
      variant="flat"
      radius="full"
      aria-label="Next testimonial"
      onPress={() => swiperRef.current?.swiper.slideNext()}
    >
      <ArrowRight size={20} />
    </Button>
  </div>
); 