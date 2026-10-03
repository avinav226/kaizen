import { Suspense } from 'react';
import { CheckinScreen } from '@/components/CheckinScreen';
import { loadToday } from '@/lib/data';

export default async function CheckinPage() {
  const data = await loadToday();
  return (
    <Suspense fallback={<main className="flex-1" />}>
      <CheckinScreen data={data} />
    </Suspense>
  );
}
