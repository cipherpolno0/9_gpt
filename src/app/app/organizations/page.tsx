import { RegistryPage } from "@/shared/components/registry-page";
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  return <RegistryPage kind="organizations" query={await searchParams} />;
}
