import Navbar from '@/app/components/layout/Navbar';
export default function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <main className="container mx-auto px-4 py-8 pt-20">{children}</main>
    </div>
  )
}