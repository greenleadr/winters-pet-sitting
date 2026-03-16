import BottomNav from '@/components/layout/BottomNav';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main content with bottom padding for nav */}
      <main className="pb-20 max-w-screen-sm mx-auto">{children}</main>
      <BottomNav />
    </div>
  );
}
