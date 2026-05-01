import { Header } from "@/components/dashboard/Header";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex flex-col min-h-screen bg-surface-container">
      <Header />
      <main className="flex-1 overflow-y-auto pt-[56px]">
        {children}
      </main>
    </div>
  );
}
