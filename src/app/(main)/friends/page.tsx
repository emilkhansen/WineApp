import { getProfile } from "@/actions/profile";
import { getFriends, getPendingRequests } from "@/actions/friends";
import { UsernameSetup } from "@/components/friends/username-setup";
import { AddFriendForm } from "@/components/friends/add-friend-form";
import { FriendsPageContent } from "./friends-page-content";

export default async function FriendsPage() {
  const profile = await getProfile();
  const friends = await getFriends();
  const pendingRequests = await getPendingRequests();

  const needsUsername = !profile?.username;

  return (
    <div className="container py-8">
      <UsernameSetup open={needsUsername} />

      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Friends</h1>
          <p className="text-muted-foreground">
            {friends.length} {friends.length === 1 ? "friend" : "friends"}
            {pendingRequests.length > 0 && (
              <span className="ml-2">
                ({pendingRequests.length} pending{" "}
                {pendingRequests.length === 1 ? "request" : "requests"})
              </span>
            )}
          </p>
        </div>
        <AddFriendForm />
      </div>

      <FriendsPageContent friends={friends} pendingRequests={pendingRequests} />
    </div>
  );
}
