import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Sidebar } from '../sidebar/sidebar';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, Sidebar],
  templateUrl: './main-layout.html',
  styleUrls: ['./main-layout.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MainLayout {
}
