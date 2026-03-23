import { Injectable, signal } from '@angular/core';
import { Subject } from 'rxjs';

export interface ConfirmConfig {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  danger?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ConfirmService {
  config = signal<ConfirmConfig | null>(null);
  
  // A Subject to let the user "wait" for the promise resolution
  private resolveSubject = new Subject<boolean>();

  ask(config: ConfirmConfig): Promise<boolean> {
    const finalConfig = {
      ...config,
      confirmText: config.confirmText || 'Confirm',
      cancelText: config.cancelText || 'Cancel',
      danger: config.danger ?? false
    };

    this.config.set(finalConfig);
    
    // We return a Promise that will resolve when the modal emits
    return new Promise<boolean>((resolve) => {
      const subscription = this.resolveSubject.subscribe((result) => {
        subscription.unsubscribe();
        this.config.set(null);
        resolve(result);
      });
    });
  }

  // Called by the modal component when a user clicks a button
  respond(result: boolean) {
    if (this.config()) {
      this.resolveSubject.next(result);
    }
  }
}
