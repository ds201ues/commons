import { redirect } from "next/navigation";
import { normalizeSeat } from "@/lib/types";

type Props = {
  params: Promise<{ roomId: string; seat: string }>
};

/** Legacy /maker|/decider paths → single room URL with ?as= */
export default async function LegacySeatRedirect({ params }: Props) {
  const { roomId, seat } = await params;
  const normalized = normalizeSeat(seat);
  if (!normalized) {
    redirect(`/r/${roomId}`);
  }
  redirect(`/r/${roomId}?as=${normalized}`);
}
