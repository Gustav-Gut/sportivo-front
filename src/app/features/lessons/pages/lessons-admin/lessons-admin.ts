import { Component, ChangeDetectionStrategy, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { LessonsService, Lesson, CreateLessonDto } from '../../../../core/services/lessons.service';
import { FacilitiesService, Facility } from '../../../../core/services/facilities.service';
import { SportsService } from '../../../../core/services/sports.service';
import { UsersService } from '../../../../core/services/users.service';
import { ToastService } from '../../../../core/services/toast.service';
import { ConfirmService } from '../../../../core/services/confirm.service';
import { RouterLink } from '@angular/router';

import { DrawerComponent } from '../../../../shared/ui/drawer/drawer';
import { DrawerSectionComponent } from '../../../../shared/ui/drawer-section/drawer-section';
import { LoadingComponent } from '../../../../shared/ui/loading/loading';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-lessons-admin',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, DrawerComponent, DrawerSectionComponent, LoadingComponent, TranslateModule],
  templateUrl: './lessons-admin.html',
  styleUrl: './lessons-admin.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LessonsAdmin implements OnInit {
  private lessonsService = inject(LessonsService);
  private facilitiesService = inject(FacilitiesService);
  private sportsService = inject(SportsService);
  private usersService = inject(UsersService);
  private fb = inject(FormBuilder);
  private toast = inject(ToastService);
  private confirmService = inject(ConfirmService);

  lessons = signal<Lesson[]>([]);
  facilities = signal<Facility[]>([]);
  sports = signal<any[]>([]);
  coaches = signal<any[]>([]);

  isLoading = signal(true);
  isSubmitting = signal(false);
  showDrawer = signal(false);
  openSection = signal<number>(1);

  openDrawer() { 
    this.showDrawer.set(true); 
    this.openSection.set(1); 
  }

  closeDrawer() { 
    this.showDrawer.set(false); 
    // Defer form reset to not block the slide-out animation
    setTimeout(() => {
      this.lessonForm.reset();
    }, 300);
  }
  toggleSection(n: number) { this.openSection.set(this.openSection() === n ? 0 : n); }

  section1Done() {
    const f = this.lessonForm;
    return f.get('name')?.valid && f.get('maxStudents')?.valid;
  }
  section2Done() {
    const f = this.lessonForm;
    return f.get('schoolSportId')?.valid && f.get('coachId')?.valid && f.get('facilityId')?.valid;
  }

  daysOfWeek = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];

  lessonForm = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(3)]],
    schoolSportId: ['', Validators.required],
    coachId: ['', Validators.required],
    facilityId: ['', Validators.required],
    dayOfWeek: ['MONDAY', Validators.required],
    startTime: ['', [Validators.required, Validators.pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)]],
    endTime: ['', [Validators.required, Validators.pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)]],
    maxStudents: [20, [Validators.required, Validators.min(1)]],
    active: [true]
  });

  ngOnInit() {
    this.loadAllData();
  }

  loadAllData() {
    this.isLoading.set(true);

    // Fetch all required data in parallel manually or natively handling
    Promise.all([
      this.lessonsService.getLessons().toPromise(),
      this.facilitiesService.getFacilities().toPromise(),
      this.sportsService.getSportsSchema().toPromise(),
      this.usersService.getUsers(1, 100).toPromise()
    ]).then(([lessonsRes, facilitiesRes, sportsRes, usersRes]) => {
      this.lessons.set(lessonsRes?.data || []);
      this.facilities.set(facilitiesRes || []);
      this.sports.set(sportsRes || []);
      
      // Filter only users who have the COACH role
      const allUsers = usersRes?.data || [];
      this.coaches.set(allUsers.filter(u => u.roles?.includes('COACH')));
      
      this.isLoading.set(false);
    }).catch(err => {
      this.toast.error('NOTIFICATIONS.LESSON_LOAD_ERROR');
      this.isLoading.set(false);
    });
  }

  onCreate() {
    if (this.lessonForm.invalid) {
      this.lessonForm.markAllAsTouched();
      this.toast.warning('NOTIFICATIONS.LESSON_FORM_ERROR');
      return;
    }

    this.isSubmitting.set(true);
    const data = this.lessonForm.value as CreateLessonDto;
    
    this.lessonsService.createLesson(data).subscribe({
      next: (newLesson) => {
        // Enriquecer el objeto para la UI
        const enrichedLesson = {
          ...newLesson,
          schoolSport: this.sports().find(s => s.id === newLesson.schoolSportId) || { sport: { name: 'Unknown Sport' } },
          coach: this.coaches().find(c => c.id === newLesson.coachId) || { firstName: 'Unknown', lastName: '' },
          _count: { enrollments: 0 }
        };

        this.lessons.update(current => [enrichedLesson, ...current]);
        this.lessonForm.reset({ active: true, dayOfWeek: 'MONDAY', maxStudents: 20 });
        this.toast.success('NOTIFICATIONS.LESSON_ADD_SUCCESS');
        this.closeDrawer();
        this.isSubmitting.set(false);
      },
      error: (err) => {
        this.toast.error('NOTIFICATIONS.LESSON_ADD_ERROR');
        this.isSubmitting.set(false);
      }
    });
  }

  onDelete(lesson: Lesson) {
    if (lesson._count?.enrollments && lesson._count.enrollments > 0) {
       this.toast.warning('NOTIFICATIONS.LESSON_DELETE_RESTRICT');
       return;
    }

    this.confirmService.ask({
      title: 'MODALS.DELETE_LESSON_TITLE',
      message: 'MODALS.DELETE_LESSON_MSG',
      params: { name: lesson.name },
      confirmText: 'MODALS.DELETE',
      danger: true
    }).then((confirmed) => {
      if (confirmed) {
        this.lessonsService.deleteLesson(lesson.id).subscribe({
          next: () => {
            this.lessons.update(current => current.filter(l => l.id !== lesson.id));
            this.toast.success('NOTIFICATIONS.LESSON_DELETE_SUCCESS');
          },
          error: (err) => {
            this.toast.error('NOTIFICATIONS.LESSON_DELETE_ERROR');
          }
        });
      }
    });
  }
}
