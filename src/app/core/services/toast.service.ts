import { Injectable, signal } from '@angular/core';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface Toast {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
}

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  toasts = signal<Toast[]>([]);

  success(message: string, duration = 4000) {
    this.add({ type: 'success', message, duration });
  }

  error(message: string, duration = 5000) {
    this.add({ type: 'error', message, duration });
  }

  info(message: string, duration = 4000) {
    this.add({ type: 'info', message, duration });
  }

  warning(message: string, duration = 4000) {
    this.add({ type: 'warning', message, duration });
  }

  remove(id: string) {
    this.toasts.update(current => current.filter(t => t.id !== id));
  }

  private add(toast: Omit<Toast, 'id'>) {
    const id = Math.random().toString(36).substring(2, 9);
    const newToast: Toast = { ...toast, id };
    
    this.toasts.update(current => [...current, newToast]);

    if (toast.duration && toast.duration > 0) {
      setTimeout(() => this.remove(id), toast.duration);
    }
  }
}
