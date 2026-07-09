import { TokenDetail } from "@/components/token/TokenDetail";

export default async function TokenPage({
  params,
}: {
  params: Promise<{ address: string }>;
}) {
  const { address } = await params;
  return <TokenDetail address={address} />;
}
