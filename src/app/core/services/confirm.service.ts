import { Injectable, signal } from '@angular/core';
import { Subject } from 'rxjs';

export interface ConfirmConfig {
  title: string;
  message: string;
  params?: any;
  confirmText?: string;
  cancelText?: string;
  danger?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ConfirmService {
  config = signal<ConfirmConfig | null>(null);
  
  private resolveSubject = new Subject<boolean>();

  ask(config: ConfirmConfig): Promise<boolean> {
    const finalConfig = {
      ...config,
      confirmText: config.confirmText || 'MODALS.CONFIRM',
      cancelText: config.cancelText || 'MODALS.CANCEL',
      danger: config.danger ?? false
    };

    this.config.set(finalConfig);
    
    return new Promise<boolean>((resolve) => {
      const subscription = this.resolveSubject.subscribe((result) => {
        subscription.unsubscribe();
        this.config.set(null);
        resolve(result);
      });
    });
  }

  respond(result: boolean) {
    if (this.config()) {
      this.resolveSubject.next(result);
    }
  }
}
