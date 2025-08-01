import React from "react";
import { Avatar } from "@heroui/avatar";
import { MessageCircle } from "lucide-react";

export interface Testimonial {
  name: string;
  role: string;
  avatar: string;
  content: string;
  color: string;
  bgColor: string;
}

interface TestimonialCardProps {
  testimonial: Testimonial;
  hovered: boolean;
}

export const TestimonialCard: React.FC<TestimonialCardProps> = ({ testimonial, hovered }) => (
  <div
    className="relative h-full overflow-hidden rounded-lg bg-white/95 backdrop-blur-md transition-all duration-300 dark:bg-black/70"
    style={{
      transform: hovered ? "translateY(-8px)" : "translateY(0)",
      boxShadow: hovered
        ? "0 10px 25px -5px rgba(0,0,0,0.15), 0 8px 10px -6px rgba(0,0,0,0.1)"
        : "0 4px 10px -2px rgba(0,0,0,0.05)",
      height: "100%"
    }}
  >
    <div className="relative z-10 flex h-full flex-col p-6">
      <div className={`${testimonial.color} ${testimonial.bgColor} mb-6 flex h-12 w-12 items-center justify-center rounded-lg`}>
        <MessageCircle size={20} />
      </div>
      <p className="mb-6 line-clamp-5">{testimonial.content}</p>
      <div className="mt-auto flex items-center gap-4">
        <Avatar src={testimonial.avatar} size="md" />
        <div>
          <h4 className="font-semibold">{testimonial.name}</h4>
          <p className="text-sm text-foreground-600 dark:text-foreground-500">{testimonial.role}</p>
        </div>
      </div>
    </div>
  </div>
); 