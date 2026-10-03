import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export default async function TodayPage() {
  const supabase = await createClient();
  const { data: user } = await supabase.auth.getUser();

  const { data: goal } = await supabase
    .from('goals')
    .select('id, title, started_at')
    .eq('status', 'active')
    .maybeSingle();
  if (!goal) redirect('/onboarding');

  const { data: step } = await supabase
    .from('steps')
    .select('text, frequency')
    .eq('goal_id', goal.id)
    .is('active_to', null)
    .maybeSingle();

  return (
    <main className="flex-1">
      <p className="text-[13px] text-text-secondary">{goal.title}</p>
      <h1 className="mt-2 font-display text-2xl leading-[30px]">{step?.text}</h1>
      <p className="mt-6 text-text-secondary">Starts {goal.started_at}. Signed in as {user.user?.email}.</p>
      <form action="/auth/signout" method="post" className="mt-8">
        <button type="submit" className="h-11 rounded-[12px] border border-border-strong bg-surface px-4 font-medium">
          Sign out
        </button>
      </form>
    </main>
  );
}
