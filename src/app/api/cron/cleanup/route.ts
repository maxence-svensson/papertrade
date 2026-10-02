import { deleteAbandonedGuests } from "@/lib/data/portfolio";

/**
 * Tâche planifiée Vercel (voir `vercel.json`), une fois par jour. Vercel
 * envoie automatiquement `Authorization: Bearer $CRON_SECRET`.
 */
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const deleted = await deleteAbandonedGuests();
  return Response.json({ deleted });
}
