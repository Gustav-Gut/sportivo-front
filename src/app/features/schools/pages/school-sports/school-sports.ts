import { Component, ChangeDetectionStrategy, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { SportsService } from '../../../../core/services/sports.service';
import { ToastService } from '../../../../core/services/toast.service';
import { ConfirmService } from '../../../../core/services/confirm.service';

@Component({
  selector: 'app-school-sports',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  templateUrl: './school-sports.html',
  styleUrls: ['./school-sports.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SchoolSports implements OnInit {
  private sportsService = inject(SportsService);
  private toastService = inject(ToastService);
  private confirmService = inject(ConfirmService);

  isLoading = signal(true);
  isSaving = signal(false);
  sportsSchema = signal<any[]>([]);
  availableSports = signal<any[]>([]);
  selectedNewSportId = signal<string>('');

  // Sport field editing state
  editingSportId = signal<string | null>(null);
  editingFields = signal<any>({});

  ngOnInit() {
    this.loadSports();
  }

  private loadSports() {
    this.isLoading.set(true);
    this.sportsService.getSportsSchema().subscribe({
      next: (schema) => {
        this.sportsSchema.set(schema);
        this.loadAvailableSports();
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error loading sports schema:', err);
        this.isLoading.set(false);
      }
    });
  }

  private loadAvailableSports() {
    this.sportsService.getAvailableSports().subscribe({
      next: (sports) => {
        const available = sports.filter(s => !this.sportsSchema().some(assoc => assoc.sportName === s.name));
        this.availableSports.set(available);
      },
      error: (err) => console.error('Error loading available sports:', err)
    });
  }

  onAddSport() {
    const sportId = this.selectedNewSportId();
    if (!sportId) return;

    this.isSaving.set(true);

    this.sportsService.associateSport(sportId).subscribe({
      next: () => {
        this.selectedNewSportId.set('');
        this.loadSports();
        this.isSaving.set(false);
        this.toastService.success('NOTIFICATIONS.SPORT_ADD_SUCCESS');
      },
      error: (err) => {
        console.error('Error associating sport:', err);
        this.toastService.error('NOTIFICATIONS.SPORT_ADD_ERROR');
        this.isSaving.set(false);
      }
    });
  }

  async removeSport(schoolSportId: string, sportName: string) {
    const confirmed = await this.confirmService.ask({
      title: 'MODALS.REMOVE_SPORT_TITLE',
      message: 'MODALS.REMOVE_SPORT_MSG',
      params: { name: sportName },
      confirmText: 'MODALS.DELETE',
      danger: true
    });

    if (!confirmed) return;

    this.sportsService.dissociateSport(schoolSportId).subscribe({
      next: () => {
        this.loadSports();
        this.toastService.success('NOTIFICATIONS.SPORT_REMOVE_SUCCESS');
      },
      error: (err) => {
        console.error('Error removing sport:', err);
        this.toastService.error('NOTIFICATIONS.SPORT_REMOVE_ERROR');
      }
    });
  }

  // Sport field editing
  startEditingSport(sport: any) {
    this.editingSportId.set(sport.id);
    const currentFields = JSON.parse(JSON.stringify(sport.schema));
    this.editingFields.set(currentFields);
  }

  cancelEditingSport() {
    this.editingSportId.set(null);
    this.editingFields.set({});
  }

  addField(profileType: 'student' | 'coach') {
    const fields = this.editingFields() as any;
    if (!fields[profileType]) {
      fields[profileType] = [];
    }
    fields[profileType].push({
      key: '',
      label: '',
      type: 'text',
      required: false
    });
    this.editingFields.set({ ...fields });
  }

  removeField(profileType: 'student' | 'coach', index: number) {
    const fields = this.editingFields() as any;
    fields[profileType].splice(index, 1);
    this.editingFields.set({ ...fields });
  }

  saveSportConfig(sportId: string) {
    const customFields = this.editingFields();

    this.isSaving.set(true);
    this.sportsService.updateSportConfig(sportId, customFields).subscribe({
      next: () => {
        this.editingSportId.set(null);
        this.editingFields.set({});
        this.loadSports();
        this.isSaving.set(false);
        this.toastService.success('NOTIFICATIONS.SPORT_CONFIG_SUCCESS');
      },
      error: (err) => {
        console.error('Error updating sport config:', err);
        this.toastService.error('NOTIFICATIONS.SPORT_CONFIG_ERROR');
        this.isSaving.set(false);
      }
    });
  }

  getEditingStudentFields(): any[] {
    return this.editingFields()?.student || [];
  }

  getEditingCoachFields(): any[] {
    return this.editingFields()?.coach || [];
  }
}
