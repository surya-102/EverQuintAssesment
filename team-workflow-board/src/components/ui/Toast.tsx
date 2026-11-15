import { useEffect } from 'react';

interface ToastProps {
  message: string;
  onClose: () => void;
}

export default function Toast({ message, onClose }: ToastProps) {
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [message]);

  return (
    <div className="toast-area" aria-live="polite">
      {message && <div className="toast">{message}</div>}
    </div>
  );
}
