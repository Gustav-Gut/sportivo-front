import { Injectable, signal } from '@angular/core';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface Toast {
  id: string;
  type: ToastType;
  message: string;
  params?: any;
  duration?: number;
}

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  toasts = signal<Toast[]>([]);

  success(message: string, params?: any, duration = 4000) {
    this.add({ type: 'success', message, params, duration });
  }

  error(message: string, params?: any, duration = 5000) {
    this.add({ type: 'error', message, params, duration });
  }

  info(message: string, params?: any, duration = 4000) {
    this.add({ type: 'info', message, params, duration });
  }

  warning(message: string, params?: any, duration = 4000) {
    this.add({ type: 'warning', message, params, duration });
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
