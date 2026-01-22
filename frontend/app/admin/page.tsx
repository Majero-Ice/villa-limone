import { AdminHeader, StatsCards } from '@/widgets/admin';

export default function AdminDashboardPage() {
  return (
    <>
      <AdminHeader />
      <main className="flex-1 p-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-serif text-graphite mb-6">Dashboard</h1>
          <StatsCards />
        </div>
      </main>
    </>
  );
}
