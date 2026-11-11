import { Clock } from 'lucide-react';

export default function WakeupBanner({ visible }) {
  if (!visible) return null;

  return (
    <div className="wakeup-banner" role="alert">
      <Clock size={16} strokeWidth={2} />
      <span>
        Waking up the server. Free hosting sleeps when idle, so the first load can take up to a minute.
      </span>
    </div>
  );
}
