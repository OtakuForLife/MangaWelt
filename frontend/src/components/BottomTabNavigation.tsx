import {
  Bookmark,
  ShoppingCart,
  Library,
  Tag,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";

// Menu items configuration
const MENU_ITEMS = [
  { name: "Bookmarks", id: "followed", icon: Bookmark },
  { name: "To Buy", id: "to-buy", icon: ShoppingCart },
  { name: "Franchises", id: "franchises", icon: Library },
  { name: "Releases", id: "releases", icon: Tag },
  { name: "Settings", id: "settings", icon: Settings },
] as const;

interface BottomTabNavigationProps {
  activeView: string;
  onViewChange: (viewId: string) => void;
}

export default function BottomTabNavigation({ 
  activeView, 
  onViewChange 
}: BottomTabNavigationProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-700 md:hidden z-50">
      <div className="flex items-center justify-around h-16 px-2">
        {MENU_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = activeView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              className={cn(
                "flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-lg transition-colors min-w-[60px]",
                isActive
                  ? "text-blue-500"
                  : "text-gray-400 hover:text-gray-200"
              )}
            >
              <Icon className={cn("w-6 h-6", isActive && "fill-blue-500")} />
              <span className="text-xs font-medium">{item.name}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

