import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StatCard } from '../../../../shared/ui/stat-card/stat-card';
import { QuickAction } from '../../../../shared/ui/quick-action/quick-action';
import { SummaryTable, TableColumn } from '../../../../shared/ui/summary-table/summary-table';
import { UserActionList } from '../../../../shared/ui/user-action-list/user-action-list';
import { BarChart, ChartDataPoint } from '../../../../shared/ui/bar-chart/bar-chart';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, StatCard, QuickAction, SummaryTable, UserActionList, BarChart, TranslateModule],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Dashboard {
  private translate = inject(TranslateService);

  paymentColumns: TableColumn[] = [
    { key: 'member', label: 'COMMON.TABLE.MEMBER', type: 'member' },
    { key: 'date', label: 'COMMON.TABLE.DATE', type: 'text' },
    { key: 'amount', label: 'COMMON.TABLE.AMOUNT', type: 'currency' },
    { key: 'status', label: 'COMMON.TABLE.STATUS', type: 'status' }
  ];

  recentPayments = [
    { member: { initials: 'JD', name: 'John Doe' }, date: 'Today, 10:24 AM', amount: 150.00, status: 'Paid' },
    { member: { initials: 'AS', name: 'Alice Smith' }, date: 'Yesterday, 3:45 PM', amount: 85.50, status: 'Processing' },
    { member: { initials: 'MR', name: 'Mike Ross' }, date: 'Yesterday, 1:12 PM', amount: 210.00, status: 'Paid' },
    { member: { initials: 'SJ', name: 'Sarah Jones' }, date: 'Oct 24, 9:30 AM', amount: 65.00, status: 'Paid' },
    { member: { initials: 'RJ', name: 'Robert Johnson' }, date: 'Oct 23, 2:15 PM', amount: 120.00, status: 'Processing' }
  ];

  overdueAccounts = [
    { initials: 'TW', name: 'Tom Wilson', daysOverdue: '45 Days', amount: 150.00 },
    { initials: 'EK', name: 'Emma Knight', daysOverdue: '32 Days', amount: 85.50 },
    { initials: 'PL', name: 'Peter Lewis', daysOverdue: '28 Days', amount: 210.00 },
    { initials: 'MJ', name: 'Mary Jane', daysOverdue: '15 Days', amount: 65.00 },
    { initials: 'DB', name: 'David Black', daysOverdue: '10 Days', amount: 120.00 }
  ];

  revenueChartData: ChartDataPoint[] = [
    { label: 'May', primaryValue: '$28K', primaryHeightClass: 'h-[60%]', secondaryValue: '$30K', secondaryHeightClass: 'h-[70%]' },
    { label: 'Jun', primaryValue: '$32K', primaryHeightClass: 'h-[70%]', secondaryValue: '$35K', secondaryHeightClass: 'h-[75%]' },
    { label: 'Jul', primaryValue: '$35K', primaryHeightClass: 'h-[75%]', secondaryValue: '$35K', secondaryHeightClass: 'h-[75%]' },
    { label: 'Aug', primaryValue: '$29K', primaryHeightClass: 'h-[65%]', secondaryValue: '$32K', secondaryHeightClass: 'h-[70%]' },
    { label: 'Sep', primaryValue: '$31K', primaryHeightClass: 'h-[68%]', secondaryValue: '$34K', secondaryHeightClass: 'h-[72%]' },
    { label: 'Oct', primaryValue: '$38K', primaryHeightClass: 'h-[85%]', secondaryValue: '$40K', secondaryHeightClass: 'h-[90%]' }
  ];
}
