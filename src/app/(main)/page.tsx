import { redirect } from "next/navigation";

export default function HomePage() {
  // For Iteration 1, redirect to wines page
  // In Iteration 2, this will be the dashboard with activity feed, calendar, and stats
  redirect("/wines");
}
