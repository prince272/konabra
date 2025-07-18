import React from "react";
import { Home, ListPlus, BarChart2, Info, MapPin, MessageCircle, Menu } from "lucide-react";

export function getMenuIcon(name: string) {
  switch (name) {
    case "Home":
      return <Home size={20} className="text-primary" />;
    case "Features":
      return <ListPlus size={20} className="text-primary" />;
    case "Impact":
      return <BarChart2 size={20} className="text-primary" />;
    case "Alerts":
      return <Info size={20} className="text-primary" />;
    case "Incidents":
      return <MapPin size={20} className="text-primary" />;
    case "Contact":
      return <MessageCircle size={20} className="text-primary" />;
    default:
      return <Menu size={20} className="text-primary" />;
  }
}
