import React from "react";
import { NavbarBrand } from "@heroui/navbar";
import { MapPin } from "lucide-react";

export const NavbarBrandSection = () => (
  <NavbarBrand>
    <div className="flex items-center gap-2">
      <div className="rounded-full bg-gradient-to-r from-primary to-primary-600 p-1">
        <MapPin size={20} className="text-success" />
      </div>
      <p className="font-montserrat text-xl font-bold text-inherit">Konabra</p>
    </div>
  </NavbarBrand>
);
