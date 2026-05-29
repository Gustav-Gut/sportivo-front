import { Component, ChangeDetectionStrategy, input, output } from '@angular/core';

export interface TabItem {
  /** Unique tab identifier */
  id: string;
  /** Pre-translated label text */
  label: string;
  /** Optional count badge shown next to the label */
  count?: number;
  /** Optional Material Symbols icon */
  icon?: string;
}

/**
 * Reusable tab navigation. The consumer owns the active state and the content.
 *
 * Usage:
 * <app-tabs
 *   [tabs]="[
 *     { id: 'list', label: 'Inscritos' | translate, count: items().length },
 *     { id: 'add', label: 'Agregar' | translate }
 *   ]"
 *   [activeTab]="activeTab()"
 *   (tabChange)="activeTab.set($event)" />
 *
 * @if (activeTab() === 'list') { ... }
 * @if (activeTab() === 'add')  { ... }
 */
@Component({
  selector: 'app-tabs',
  standalone: true,
  templateUrl: './tabs.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' }
})
export class TabsComponent {
  tabs = input<TabItem[]>([]);
  activeTab = input<string>('');
  tabChange = output<string>();

  onTabClick(tabId: string) {
    if (tabId !== this.activeTab()) {
      this.tabChange.emit(tabId);
    }
  }
}
