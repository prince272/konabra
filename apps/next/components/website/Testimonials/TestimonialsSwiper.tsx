"use client";
import React, { useRef, useState } from "react";
import { Swiper, SwiperRef, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";
import { testimonials } from "./testimonialsData";
import { TestimonialCard } from "./TestimonialCard";
import { TestimonialsNavigation } from "./TestimonialsNavigation";

export const TestimonialsSwiper = () => {
  const swiperRef = useRef<SwiperRef>(null);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  return (
    <div className="relative">
      <Swiper
        ref={swiperRef}
        modules={[Autoplay, Pagination, Navigation]}
        slidesPerView={1}
        spaceBetween={30}
        grabCursor={true}
        loop={true}
        autoplay={{
          delay: 4000,
          disableOnInteraction: false
        }}
        speed={800}
        pagination={{
          clickable: true,
          bulletActiveClass: "swiper-pagination-bullet-active !bg-warning"
        }}
        breakpoints={{
          640: {
            slidesPerView: 2
          },
          1024: {
            slidesPerView: 3
          }
        }}
        watchSlidesProgress={true}
        observer={true}
        observeParents={true}
        className="!pb-12"
      >
        {testimonials.map((testimonial, index) => (
          <SwiperSlide
            key={index}
            className="h-auto"
            onMouseEnter={() => setHoveredIndex(index)}
            onMouseLeave={() => setHoveredIndex(null)}
          >
            <TestimonialCard testimonial={testimonial} hovered={hoveredIndex === index} />
          </SwiperSlide>
        ))}
      </Swiper>
      <TestimonialsNavigation swiperRef={swiperRef} />
    </div>
  );
}; 