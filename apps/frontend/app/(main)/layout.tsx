import Navbar from '@/app/components/layout/Navbar';

export default function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors">
      <Navbar />
      <main className="container mx-auto px-4 py-8 pt-20 bg-white dark:bg-gray-900 text-gray-800 dark:text-white transition-colors">
        {children}
      </main>
    </div>
  );
}