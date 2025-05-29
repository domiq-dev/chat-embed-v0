'use client';

import Link from "next/link";
import { cn } from "@/lib/utils";
import { dashboardRoutes } from "@/lib/routes";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { LeadProvider } from "@/lib/lead-context";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [expandedGroups, setExpandedGroups] = useState<string[]>(['/dashboard/knowledge']);

  const toggleGroup = (path: string) => {
    setExpandedGroups(prev => 
      prev.includes(path) 
        ? prev.filter(p => p !== path)
        : [...prev, path]
    );
  };

  return (
    <LeadProvider>
      <div className="flex flex-col md:flex-row min-h-screen">
        {/* Sidebar */}
        <aside className="w-full md:w-56 bg-black text-white p-4 space-y-4 flex md:block items-center justify-between md:items-start md:justify-start">
          {/* DomIQ AI Header */}
          <div className="text-2xl font-bold tracking-tight mb-2 md:mb-6">
            <span className="text-white">DomIQ</span>
            <span className="text-xs align-top text-purple-400 ml-1">AI</span>
          </div>

          <div className="flex md:flex-col gap-2">
            {dashboardRoutes.map((route) => (
              <div key={route.path}>
                {route.children ? (
                  <div>
                    <button
                      onClick={() => toggleGroup(route.path)}
                      className={cn(
                        "w-full flex items-center justify-between px-4 py-2 rounded text-sm transition-colors text-center md:text-left",
                        "hover:bg-purple-700 hover:text-white text-gray-300"
                      )}
                    >
                      <span>{route.label}</span>
                      <span className={cn(
                        "transition-transform",
                        expandedGroups.includes(route.path) ? "rotate-180" : ""
                      )}>
                        ▼
                      </span>
                    </button>
                    {expandedGroups.includes(route.path) && (
                      <div className="ml-4 mt-1 space-y-1">
                        {route.children.map((child) => (
                          <NavItem
                            key={child.path}
                            href={child.path}
                            label={child.label}
                            className="pl-4 text-sm"
                          />
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <NavItem
                    href={route.path}
                    label={route.label}
                  />
                )}
              </div>
            ))}
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 bg-gray-50 p-4 md:p-6">{children}</main>
      </div>
    </LeadProvider>
  );
}

function NavItem({ href, label, className }: { href: string; label: string; className?: string }) {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <Link
      href={href}
      className={cn(
        "block px-4 py-2 rounded text-sm transition-colors text-center md:text-left",
        isActive 
          ? "bg-purple-700 text-white" 
          : "hover:bg-purple-700 hover:text-white text-gray-300",
        className
      )}
    >
      {label}
    </Link>
  );
}
