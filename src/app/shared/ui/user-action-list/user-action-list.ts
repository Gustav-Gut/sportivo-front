import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-user-action-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './user-action-list.html',
  styleUrls: ['./user-action-list.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserActionList {
  @Input({ required: true }) initials!: string;
  @Input({ required: true }) title!: string;
  @Input({ required: true }) subtitle!: string;
  @Input() actionIcon: string = 'notifications_active';
}
