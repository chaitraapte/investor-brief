import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { nanoid } from "nanoid";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: existing } = await supabase
    .from("briefs")
    .select("share_slug")
    .eq("id", id)
    .single();

  if (!existing) {
    return NextResponse.json({ error: "Brief not found." }, { status: 404 });
  }

  const shareSlug = existing.share_slug ?? nanoid(10);

  const { error } = await supabase
    .from("briefs")
    .update({ is_shared: true, share_slug: shareSlug })
    .eq("id", id);

  if (error) {
    return NextResponse.json({ error: "Could not enable sharing." }, { status: 500 });
  }

  return NextResponse.json({ shareSlug });
}
