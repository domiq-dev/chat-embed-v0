import Link from "next/link";
import { cn } from "@/lib/utils";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col md:flex-row min-h-screen">
      {/* Sidebar */}
      <aside className="w-full md:w-56 bg-black text-white p-4 space-y-4 flex md:block items-center justify-between md:items-start md:justify-start">
        {/* DomIQ AI Header */}
        <div className="text-2xl font-bold tracking-tight mb-2 md:mb-6">
          <span className="text-white">DomIQ</span>
          <span className="text-xs align-top text-purple-400 ml-1">AI</span>
        </div>

        <div className="flex md:flex-col gap-2">
          <NavItem href="/dashboard" label="Dashboard" />
          <NavItem href="/dashboard/deep-insights" label="Deep Insights" />
            <NavItem href="/dashboard/knowledgebase" label="Knowledgebase" /> {/* ✅ Added */}
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 bg-gray-50 p-4 md:p-6">{children}</main>
    </div>
  );
}

function NavItem({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className={cn(
        "block px-4 py-2 rounded text-sm transition-colors text-center md:text-left",
        "hover:bg-purple-700 hover:text-white"
      )}
    >
      {label}
    </Link>
  );
}
