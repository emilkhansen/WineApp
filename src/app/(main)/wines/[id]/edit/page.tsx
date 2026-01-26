import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { WineForm } from "@/components/wines/wine-form";
import { getWine } from "@/actions/wines";

interface EditWinePageProps {
  params: Promise<{ id: string }>;
}

export default async function EditWinePage({ params }: EditWinePageProps) {
  const { id } = await params;
  const wine = await getWine(id);

  if (!wine) {
    notFound();
  }

  return (
    <div className="container py-8 max-w-2xl">
      <div className="flex items-center gap-4 mb-8">
        <Link href={`/wines/${wine.id}`}>
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-3xl font-bold">Edit Wine</h1>
      </div>

      <WineForm wine={wine} />
    </div>
  );
}
