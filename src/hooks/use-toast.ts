import { useState, useCallback } from 'react';

interface Toast {
  id: string;
  title: string;
  description?: string;
  variant?: 'default' | 'destructive';
}

let toastId = 0;

export const useToast = () => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = useCallback(({ title, description, variant = 'default' }: Omit<Toast, 'id'>) => {
    const id = `toast-${toastId++}`;
    const newToast: Toast = { id, title, description, variant };
    
    setToasts(prev => [...prev, newToast]);
    
    // Auto-dismiss after 3 seconds
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3000);

    // Also show native alert for important messages
    if (variant === 'destructive') {
      alert(`❌ ${title}\n${description || ''}`);
    } else {
      console.log(`✅ ${title}${description ? `\n${description}` : ''}`);
    }
  }, []);

  return { toast, toasts };
};
