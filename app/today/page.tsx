import { TodayScreen } from '@/components/TodayScreen';
import { loadToday } from '@/lib/data';

export default async function TodayPage() {
  return <TodayScreen data={await loadToday()} />;
}
