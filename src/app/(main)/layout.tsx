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

  return (
    <div className="min-h-screen bg-background">
      <Header userEmail={user?.email} pendingFriendRequests={pendingCount} />
      <main>{children}</main>
    </div>
  );
}
