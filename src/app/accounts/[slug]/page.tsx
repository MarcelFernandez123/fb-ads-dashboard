import { accountConfigs } from '@/lib/metrics-config';
import { AccountDetailClient } from '@/components/pages/AccountDetailClient';

// Generate static params for all account slugs
export function generateStaticParams() {
  return accountConfigs.map((config) => ({
    slug: config.slug,
  }));
}

export default async function AccountDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <AccountDetailClient slug={slug} />;
}
