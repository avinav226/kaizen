import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

/** Someone who already has an active goal has finished onboarding. */
export default async function OnboardingLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data } = await supabase.from('goals').select('id').eq('status', 'active').limit(1);
  if (data && data.length > 0) redirect('/today');
  return <>{children}</>;
}
