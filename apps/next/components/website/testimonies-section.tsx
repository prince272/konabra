"use client";

import React, { useRef, useState } from "react";
import { Avatar } from "@heroui/avatar";
import { Button } from "@heroui/button";
import { Chip } from "@heroui/chip";
import { Icon } from "@iconify-icon/react";
import { Autoplay, Navigation, Pagination } from "swiper/modules";
import { Swiper, SwiperRef, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";

export const TestimonialsSection = () => {
  const swiperRef = useRef<SwiperRef>(null);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const testimonials = [
    {
      name: "Kwame Mensah",
      role: "Taxi Driver, Accra",
      avatar: "https://img.heroui.chat/image/avatar?w=150&h=150&u=1",
      content:
        "Konabra has changed how I navigate Accra's busy roads. The real-time traffic updates have saved me hours of sitting in jams, and I feel safer knowing where incidents are happening.",
      color: "text-warning",
      bgColor: "bg-warning/15 dark:bg-warning/20"
    },
    {
      name: "Ama Owusu",
      role: "Student, University of Ghana",
      avatar: "https://img.heroui.chat/image/avatar?w=150&h=150&u=2",
      content:
        "As someone who commutes to campus daily, the app has been invaluable. I've reported several potholes that were fixed within weeks, and the alerts help me plan safer routes.",
      color: "text-success-500",
      bgColor: "bg-success-500/15 dark:bg-success-500/20"
    },
    {
      name: "Daniel Adjei",
      role: "Traffic Officer, MTTD",
      avatar: "https://img.heroui.chat/image/avatar?w=150&h=150&u=3",
      content:
        "The data from Konabra helps us deploy resources more effectively. We can identify accident hotspots and respond faster to incidents. It's truly a game-changer for road safety.",
      color: "text-warning",
      bgColor: "bg-warning/15 dark:bg-warning/20"
    },
    {
      name: "Fatima Ibrahim",
      role: "Bus Driver, Metro Mass",
      avatar: "https://img.heroui.chat/image/avatar?w=150&h=150&u=4",
      content:
        "I transport dozens of passengers daily, and Konabra helps me ensure their safety. The incident alerts allow me to avoid dangerous areas and plan alternative routes.",
      color: "text-success-500",
      bgColor: "bg-success-500/15 dark:bg-success-500/20"
    },
    {
      name: "Emmanuel Osei",
      role: "Delivery Rider, Accra",
      avatar: "https://img.heroui.chat/image/avatar?w=150&h=150&u=5",
      content:
        "My job depends on fast delivery times. With Konabra, I can avoid traffic jams and road closures, making my deliveries more efficient while staying safe on the road.",
      color: "text-warning",
      bgColor: "bg-warning/15 dark:bg-warning/20"
    },
    {
      name: "Grace Mensah",
      role: "Parent & School Administrator",
      avatar: "https://img.heroui.chat/image/avatar?w=150&h=150&u=6",
      content:
        "As a school administrator, I use Konabra to monitor road conditions for our school buses. Parents appreciate knowing their children are taking the safest routes possible.",
      color: "text-success-500",
      bgColor: "bg-success-500/15 dark:bg-success-500/20"
    }
  ];

  return (
    <section id="testimonials" className="relative overflow-hidden py-20">
      {/* Background elements */}
      <div className="absolute inset-0 bg-background"></div>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(255,184,0,0.15),transparent_60%)] dark:bg-[radial-gradient(ellipse_at_bottom_right,rgba(255,184,0,0.1),transparent_80%)]"></div>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(23,201,100,0.15),transparent_60%)] dark:bg-[radial-gradient(ellipse_at_top_left,rgba(23,201,100,0.1),transparent_80%)]"></div>
      <div className="absolute -top-40 left-0 h-96 w-96 rounded-full bg-warning/5 blur-3xl dark:bg-warning/10"></div>
      <div className="absolute -bottom-40 right-0 h-96 w-96 rounded-full bg-success-500/5 blur-3xl dark:bg-success-500/10"></div>

      <div className="container relative z-10 mx-auto px-6 md:px-8">
        <div className="mb-16 text-center">
          <Chip color="warning" variant="flat" radius="full" className="mb-4">
            Testimonials
          </Chip>
          <h2 className="mb-4 font-montserrat text-3xl font-bold md:text-4xl">
            What{" "}
            <span className="relative inline-block text-primary">
              People
              <span className="absolute -bottom-2 left-0 h-1 w-full bg-primary/40"></span>
            </span>{" "}
            Are Saying
          </h2>
          <p className="mx-auto max-w-2xl text-foreground-700 dark:text-foreground-500">
            Hear from the community about how Konabra is making a difference across Ghana
          </p>
        </div>

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
                <div
                  className="relative h-full overflow-hidden rounded-lg bg-white/95 backdrop-blur-md transition-all duration-300 dark:bg-black/70"
                  style={{
                    transform: hoveredIndex === index ? "translateY(-8px)" : "translateY(0)",
                    boxShadow:
                      hoveredIndex === index
                        ? "0 10px 25px -5px rgba(0,0,0,0.15), 0 8px 10px -6px rgba(0,0,0,0.1)"
                        : "0 4px 10px -2px rgba(0,0,0,0.05)",
                    height: "100%"
                  }}
                >
                  <div className="relative z-10 flex h-full flex-col p-6">
                    <div
                      className={`${testimonial.color} ${testimonial.bgColor} mb-6 flex h-12 w-12 items-center justify-center rounded-lg`}
                    >
                      <Icon icon="solar:chat-round-dots-broken" width="20" height="20" />
                    </div>
                    <p className="mb-6 line-clamp-5">{testimonial.content}</p>
                    <div className="mt-auto flex items-center gap-4">
                      <Avatar src={testimonial.avatar} size="md" />
                      <div>
                        <h4 className="font-semibold">{testimonial.name}</h4>
                        <p className="text-sm text-foreground-600 dark:text-foreground-500">
                          {testimonial.role}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
          {/* Navigation controls */}
          <div className="mt-8 flex justify-center gap-4">
            <Button
              isIconOnly
              variant="flat"
              radius="full"
              aria-label="Previous testimonial"
              onPress={() => swiperRef.current?.swiper.slidePrev()}
            >
              <Icon icon="solar:arrow-left-broken" width="20" height="20" />
            </Button>
            <Button
              isIconOnly
              variant="flat"
              radius="full"
              aria-label="Next testimonial"
              onPress={() => swiperRef.current?.swiper.slideNext()}
            >
              <Icon icon="solar:arrow-right-broken" width="20" height="20" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};
