import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-stat-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './stat-card.html',
  styleUrls: ['./stat-card.scss'],
  host: {
    class: 'block h-full'
  },
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StatCard {
  @Input({ required: true }) title!: string;
  @Input({ required: true }) value!: string | number;
  @Input({ required: true }) icon!: string;
  @Input() trendText?: string;

  // Customization props
  @Input() trendColor: 'emerald' | 'red' | 'primary' = 'emerald';
  @Input() glowColor: 'emerald' | 'red' | 'primary' = 'primary';

  // Using an explicit progress bar if provided
  @Input() progressPercentage?: number;
}
