import { Component, HostListener, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ConfirmService } from '../../../core/services/confirm.service';

import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-confirm-modal',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './confirm-modal.component.html',
  styleUrls: ['./confirm-modal.component.scss']
})
export class ConfirmModalComponent {
  confirmService = inject(ConfirmService);

  @HostListener('document:keydown.escape')
  onEscape() {
    if (this.confirmService.config()) {
      this.onCancel();
    }
  }

  onConfirm() {
    this.confirmService.respond(true);
  }

  onCancel() {
    this.confirmService.respond(false);
  }
}
