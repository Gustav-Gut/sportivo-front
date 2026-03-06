import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-quick-action',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './quick-action.html',
  styleUrls: ['./quick-action.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class QuickAction {
  @Input({ required: true }) title!: string;
  @Input({ required: true }) subtitle!: string;
  @Input({ required: true }) icon!: string;
  @Input() theme: 'primary' | 'emerald' | 'red' = 'primary';
}
