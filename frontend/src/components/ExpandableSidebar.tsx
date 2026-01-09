import { useState } from "react";
import {
  Menu,
  Bookmark,
  ShoppingCart,
  Library,
  Tag,
  Settings,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

// Menu items configuration
const MENU_ITEMS = [
  { name: "Bookmarks", id: "followed", icon: Bookmark },
  { name: "To Buy", id: "to-buy", icon: ShoppingCart },
  { name: "Franchises", id: "franchises", icon: Library },
  { name: "Releases", id: "releases", icon: Tag },
] as const;

interface ExpandableSidebarProps {
  activeView: string;
  onViewChange: (viewId: string) => void;
}

export default function ExpandableSidebar({ 
  activeView, 
  onViewChange 
}: ExpandableSidebarProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div 
      className={cn(
        "hidden md:flex flex-col bg-gray-900 text-white border-r border-gray-700 transition-all duration-300 h-full",
        isExpanded ? "w-64" : "w-16"
      )}
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-700 h-14">
        {isExpanded ? (
          <>
            <span className="text-sm font-semibold text-gray-300">Navigation</span>
            <ChevronLeft className="w-4 h-4 text-gray-400" />
          </>
        ) : (
          <Menu className="w-5 h-5 text-gray-400 mx-auto" />
        )}
      </div>

      {/* Navigation Items */}
      <div className="flex-1 overflow-auto py-2 px-2">
        <div className="space-y-1">
          {MENU_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onViewChange(item.id)}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors cursor-pointer",
                  isActive
                    ? "bg-blue-600 text-white hover:bg-blue-700"
                    : "hover:bg-gray-800 text-gray-300",
                  !isExpanded && "justify-center"
                )}
                title={!isExpanded ? item.name : undefined}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                {isExpanded && <span className="text-sm font-medium">{item.name}</span>}
              </button>
            );
          })}
        </div>
      </div>

      {/* Footer with Settings */}
      <div className="border-t border-gray-700 p-2">
        <button
          onClick={() => onViewChange('settings')}
          className={cn(
            "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors cursor-pointer",
            activeView === 'settings'
              ? "bg-blue-600 text-white hover:bg-blue-700"
              : "hover:bg-gray-800 text-gray-300",
            !isExpanded && "justify-center"
          )}
          title={!isExpanded ? "Settings" : undefined}
        >
          <Settings className="w-5 h-5 flex-shrink-0" />
          {isExpanded && <span className="text-sm font-medium">Settings</span>}
        </button>
      </div>

      {/* Expand/Collapse Indicator */}
      {!isExpanded && (
        <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
          <ChevronRight className="w-4 h-4 text-gray-500" />
        </div>
      )}
    </div>
  );
}

