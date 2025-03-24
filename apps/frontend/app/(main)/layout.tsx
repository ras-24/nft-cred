import Navbar from '@/app/components/layout/Navbar';
export default function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="container mx-auto px-4 py-8">{children}</main>
      {/* <Footer /> */}
    </div>
  )
}