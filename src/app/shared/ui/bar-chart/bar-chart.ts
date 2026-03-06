import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface ChartDataPoint {
  label: string;
  primaryValue: string;
  primaryHeightClass: string;
  secondaryValue?: string;
  secondaryHeightClass?: string;
}

@Component({
  selector: 'app-bar-chart',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './bar-chart.html',
  styleUrls: ['./bar-chart.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BarChart {
  @Input({ required: true }) data: ChartDataPoint[] = [];
}
