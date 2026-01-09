import {
  Menu,
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
] as const;

interface AppSidebarProps {
  onToggleNavPanel: () => void;
  isNavPanelVisible: boolean;
  activeView: string;
  onViewChange: (viewId: string) => void;
}

export default function AppSidebar({
  onToggleNavPanel,
  isNavPanelVisible,
  activeView,
  onViewChange
}: AppSidebarProps) {
  return (
    <div className="min-w-11 w-11 bg-gray-900 text-white border-r border-gray-700 flex flex-col h-full">
      {/* Header */}
      <div className="p-0">
        <button
          className="cursor-pointer h-11 w-11 flex items-center justify-center hover:bg-gray-800"
          onClick={onToggleNavPanel}
        >
          <Menu className={cn("w-5 h-5", !isNavPanelVisible && "rotate-90")} />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 p-0">
        {MENU_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = activeView === item.id;
          return (
            <button
              key={item.id}
              className={cn(
                "cursor-pointer h-11 w-11 flex items-center justify-center hover:bg-gray-800",
                isActive && "bg-blue-600 hover:bg-blue-700"
              )}
              onClick={() => onViewChange(item.id)}
            >
              <Icon className="w-5 h-5" />
            </button>
          );
        })}
      </div>

      {/* Footer */}
      <div className="p-0 mt-auto">
        <button
          className={cn(
            "cursor-pointer h-11 w-11 flex items-center justify-center hover:bg-gray-800",
            activeView === 'settings' && "bg-blue-600 hover:bg-blue-700"
          )}
          onClick={() => onViewChange('settings')}
        >
          <Settings className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
