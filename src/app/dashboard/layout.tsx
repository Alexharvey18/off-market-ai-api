import { NotificationBell } from "@/components/NotificationBell"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div>
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <nav className="flex gap-4">
            <a href="/dashboard" className="font-medium hover:text-primary">
              Deals
            </a>
            <a href="/dashboard/profile" className="font-medium hover:text-primary">
              Profile
            </a>
          </nav>
          <NotificationBell />
        </div>
      </header>
      <main>
        {children}
      </main>
    </div>
  )
} 