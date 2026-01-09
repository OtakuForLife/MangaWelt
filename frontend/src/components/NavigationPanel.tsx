import {
  Bookmark,
  ShoppingCart,
  Library,
  Tag,
  Settings,
  Pin,
  PinOff,
} from "lucide-react";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";

// Menu items configuration
const MENU_ITEMS = [
  { name: "Bookmarks", id: "followed", icon: Bookmark },
  { name: "To Buy", id: "to-buy", icon: ShoppingCart },
  { name: "Franchises", id: "franchises", icon: Library },
  { name: "Releases", id: "releases", icon: Tag },
] as const;

interface NavigationPanelProps {
  activeView: string;
  onViewChange: (viewId: string) => void;
  onTogglePin: () => void;
  isPinned: boolean;
}

export default function NavigationPanel({ 
  activeView, 
  onViewChange,
  onTogglePin,
  isPinned
}: NavigationPanelProps) {
  return (
    <div className="h-full flex flex-col bg-gray-900 text-white border-r border-gray-700">
      {/* Header with Pin button */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-gray-700 min-h-[44px]">
        <span className="text-sm font-semibold text-gray-300">Navigation</span>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 p-0 text-gray-400 hover:text-white hover:bg-gray-800"
          onClick={onTogglePin}
          title={isPinned ? "Unpin sidebar (floating overlay)" : "Pin sidebar"}
        >
          {isPinned ? (
            <Pin className="h-4 w-4" />
          ) : (
            <PinOff className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Navigation Items */}
      <div className="flex-1 overflow-auto py-2 px-2">
        <div className="space-y-0.5">
          {MENU_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onViewChange(item.id)}
                className={cn(
                  "w-full flex items-center gap-3 px-2 py-2 rounded transition-colors cursor-pointer text-left",
                  isActive
                    ? "bg-blue-600 text-white hover:bg-blue-700"
                    : "hover:bg-gray-800 text-gray-300"
                )}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                <span className="text-sm">{item.name}</span>
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
            "w-full flex items-center gap-3 px-2 py-2 rounded transition-colors cursor-pointer text-left",
            activeView === 'settings'
              ? "bg-blue-600 text-white hover:bg-blue-700"
              : "hover:bg-gray-800 text-gray-300"
          )}
        >
          <Settings className="w-4 h-4 flex-shrink-0" />
          <span className="text-sm">Settings</span>
        </button>
      </div>
    </div>
  );
}

