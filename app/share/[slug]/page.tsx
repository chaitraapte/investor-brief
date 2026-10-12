import { notFound } from "next/navigation";
import Header from "@/components/Header";
import BriefResults from "@/components/BriefResults";
import { createClient } from "@/lib/supabase/server";
import { Brief } from "@/lib/types";

export default async function SharedBriefPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: row } = await supabase
    .from("briefs")
    .select("investor_name, firm_name, result, created_at")
    .eq("share_slug", slug)
    .eq("is_shared", true)
    .single();

  if (!row) {
    notFound();
  }

  return (
    <div className="flex flex-col flex-1 items-center bg-background px-6 py-16">
      <div className="w-full max-w-2xl">
        <Header />
      </div>
      <BriefResults
        brief={row.result as Brief}
        investorName={row.investor_name}
        firmName={row.firm_name}
        generatedAt={new Date(row.created_at).toLocaleString(undefined, {
          month: "short",
          day: "numeric",
          hour: "numeric",
          minute: "2-digit",
        })}
        readOnly
      />
    </div>
  );
}
