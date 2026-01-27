import { Header } from "@/components/header";
import { createClient } from "@/lib/supabase/server";

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <div className="min-h-screen bg-background">
      <Header userEmail={user?.email} />
      <main className="px-4 sm:px-6 lg:px-8">{children}</main>
    </div>
  );
}
