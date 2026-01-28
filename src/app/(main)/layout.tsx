import { Header } from "@/components/header";
import { createClient } from "@/lib/supabase/server";
import { getPendingRequests } from "@/actions/friends";

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const pendingRequests = await getPendingRequests();
  const pendingCount = pendingRequests.length;

  // Fetch is_admin from profile
  let isAdmin = false;
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("is_admin")
      .eq("id", user.id)
      .single();
    isAdmin = profile?.is_admin ?? false;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header userEmail={user?.email} pendingFriendRequests={pendingCount} isAdmin={isAdmin} />
      <main className="px-4 sm:px-6 lg:px-8">{children}</main>
    </div>
  );
}
