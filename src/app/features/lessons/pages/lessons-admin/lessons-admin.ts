import { Component, ChangeDetectionStrategy, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Subject, debounceTime, distinctUntilChanged } from 'rxjs';
import { LessonsService, Lesson, CreateLessonDto } from '../../../../core/services/lessons.service';
import { FacilitiesService, Facility } from '../../../../core/services/facilities.service';
import { SportsService } from '../../../../core/services/sports.service';
import { UsersService } from '../../../../core/services/users.service';
import { ToastService } from '../../../../core/services/toast.service';
import { ConfirmService } from '../../../../core/services/confirm.service';

import { DrawerComponent } from '../../../../shared/ui/drawer/drawer';
import { DrawerSectionComponent } from '../../../../shared/ui/drawer-section/drawer-section';
import { LoadingComponent } from '../../../../shared/ui/loading/loading';
import { TranslateModule } from '@ngx-translate/core';
import { PageLayoutComponent } from '../../../../shared/ui/page-layout/page-layout';
import { PageHeaderComponent } from '../../../../shared/ui/page-header/page-header';
import { SectionCardComponent } from '../../../../shared/ui/section-card/section-card';
import { SectionHeaderComponent } from '../../../../shared/ui/section-header/section-header';
import { EmptyStateComponent } from '../../../../shared/ui/empty-state/empty-state';
import { SpinnerComponent } from '../../../../shared/ui/spinner/spinner';
import { FormFieldComponent } from '../../../../shared/ui/form-field/form-field';
import { TabsComponent } from '../../../../shared/ui/tabs/tabs';

@Component({
  selector: 'app-lessons-admin',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    DrawerComponent,
    DrawerSectionComponent,
    LoadingComponent,
    TranslateModule,
    PageLayoutComponent,
    PageHeaderComponent,
    SectionCardComponent,
    SectionHeaderComponent,
    EmptyStateComponent,
    SpinnerComponent,
    FormFieldComponent,
    TabsComponent,
  ],
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

  // ── List state ──────────────────────────────────────────
  lessons = signal<Lesson[]>([]);
  facilities = signal<Facility[]>([]);
  sports = signal<any[]>([]);
  coaches = signal<any[]>([]);

  isLoading = signal(true);
  isSubmitting = signal(false);

  // ── Create lesson drawer ────────────────────────────────
  showDrawer = signal(false);
  openSection = signal<number>(1);

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

  // ── Manage lesson drawer ────────────────────────────────
  showManageDrawer = signal(false);
  activeManageTab = signal<'enrolled' | 'add'>('enrolled');
  selectedLesson = signal<Lesson | null>(null);
  enrolledStudents = signal<any[]>([]);
  isLoadingEnrolled = signal<boolean>(false);

  // Search state for enrolling
  searchQuery = signal<string>('');
  searchResults = signal<any[]>([]);
  isSearching = signal<boolean>(false);
  private searchSubject = new Subject<string>();

  ngOnInit() {
    this.loadAllData();

    // Server-side autocomplete for enroll search
    this.searchSubject.pipe(
      debounceTime(400),
      distinctUntilChanged()
    ).subscribe(searchTerm => {
      this.performSearch(searchTerm);
    });
  }

  loadAllData() {
    this.isLoading.set(true);

    Promise.all([
      this.lessonsService.getLessons().toPromise(),
      this.facilitiesService.getFacilities().toPromise(),
      this.sportsService.getSportsSchema().toPromise(),
      this.usersService.getUsers(1, 100).toPromise()
    ]).then(([lessonsRes, facilitiesRes, sportsRes, usersRes]) => {
      this.lessons.set(lessonsRes?.data || []);
      this.facilities.set(facilitiesRes || []);
      this.sports.set(sportsRes || []);

      const allUsers = usersRes?.data || [];
      this.coaches.set(allUsers.filter(u => u.roles?.includes('COACH')));

      this.isLoading.set(false);
    }).catch(() => {
      this.toast.error('NOTIFICATIONS.LESSON_LOAD_ERROR');
      this.isLoading.set(false);
    });
  }

  // ── Create Lesson Drawer ────────────────────────────────
  openDrawer() {
    this.showDrawer.set(true);
    this.openSection.set(1);
  }

  closeDrawer() {
    this.showDrawer.set(false);
    setTimeout(() => this.lessonForm.reset({ active: true, dayOfWeek: 'MONDAY', maxStudents: 20 }), 300);
  }

  toggleSection(n: number) {
    this.openSection.set(this.openSection() === n ? 0 : n);
  }

  section1Done() {
    const f = this.lessonForm;
    return f.get('name')?.valid && f.get('maxStudents')?.valid;
  }

  section2Done() {
    const f = this.lessonForm;
    return f.get('schoolSportId')?.valid && f.get('coachId')?.valid && f.get('facilityId')?.valid;
  }

  section3Done() {
    const f = this.lessonForm;
    return f.get('dayOfWeek')?.valid && f.get('startTime')?.valid && f.get('endTime')?.valid;
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
        const enrichedLesson = {
          ...newLesson,
          schoolSport: this.sports().find(s => s.id === newLesson.schoolSportId) || { sport: { name: 'Unknown Sport' } },
          coach: this.coaches().find(c => c.id === newLesson.coachId) || { firstName: 'Unknown', lastName: '' },
          _count: { enrollments: 0 }
        };

        this.lessons.update(current => [enrichedLesson, ...current]);
        this.toast.success('NOTIFICATIONS.LESSON_ADD_SUCCESS');
        this.closeDrawer();
        this.isSubmitting.set(false);
      },
      error: () => {
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
          error: () => this.toast.error('NOTIFICATIONS.LESSON_DELETE_ERROR')
        });
      }
    });
  }

  // ── Manage Lesson Drawer ────────────────────────────────
  openManageDrawer(lesson: Lesson) {
    this.selectedLesson.set(lesson);
    this.enrolledStudents.set([]);
    this.isLoadingEnrolled.set(true);
    this.activeManageTab.set('enrolled');
    this.searchQuery.set('');
    this.searchResults.set([]);
    this.showManageDrawer.set(true);

    // Fetch full lesson details with enrolled students
    this.lessonsService.getLesson(lesson.id).subscribe({
      next: (res: any) => {
        const students = res.enrollments?.map((e: any) => e.student) || [];
        this.enrolledStudents.set(students);
        this.isLoadingEnrolled.set(false);
      },
      error: () => {
        this.toast.error('NOTIFICATIONS.LESSON_DETAILS_ERROR');
        this.isLoadingEnrolled.set(false);
      }
    });
  }

  closeManageDrawer() {
    this.showManageDrawer.set(false);
    setTimeout(() => {
      this.selectedLesson.set(null);
      this.enrolledStudents.set([]);
      this.searchQuery.set('');
      this.searchResults.set([]);
      this.isSearching.set(false);
    }, 300);
  }

  isClassFull(): boolean {
    const l = this.selectedLesson();
    if (!l) return false;
    return this.enrolledStudents().length >= l.maxStudents;
  }

  /** Sync enrollment count back to the lessons grid */
  private updateLessonEnrollmentCount(lessonId: string, delta: number) {
    this.lessons.update(current =>
      current.map(l => l.id === lessonId
        ? { ...l, _count: { ...l._count, enrollments: (l._count?.enrollments || 0) + delta } }
        : l
      )
    );
  }

  onSearchChange(event: any) {
    const value = event.target.value;
    this.searchQuery.set(value);

    if (value.trim().length < 2) {
      this.searchResults.set([]);
      this.isSearching.set(false);
      return;
    }

    this.isSearching.set(true);
    this.searchSubject.next(value);
  }

  private performSearch(searchTerm: string) {
    this.usersService.getUsers(1, 10, searchTerm, 'STUDENT').subscribe({
      next: (res) => {
        const enrolledIds = this.enrolledStudents().map(s => s.id);
        const available = res.data.filter((u: any) => !enrolledIds.includes(u.id));
        this.searchResults.set(available);
        this.isSearching.set(false);
      },
      error: () => {
        this.toast.error('NOTIFICATIONS.SEARCH_ERROR');
        this.isSearching.set(false);
      }
    });
  }

  enrollStudent(student: any) {
    const lesson = this.selectedLesson();
    if (!lesson) return;

    this.lessonsService.enrollStudent(lesson.id, student.id).subscribe({
      next: () => {
        this.toast.success('NOTIFICATIONS.ENROLL_SUCCESS', { name: student.firstName });
        this.enrolledStudents.update(current => [...current, student]);
        this.searchResults.update(current => current.filter(s => s.id !== student.id));
        this.updateLessonEnrollmentCount(lesson.id, +1);
      },
      error: () => this.toast.error('NOTIFICATIONS.ENROLL_ERROR')
    });
  }

  async unenrollStudent(studentId: string, studentName: string) {
    const lesson = this.selectedLesson();
    if (!lesson) return;

    const confirmed = await this.confirmService.ask({
      title: 'MODALS.UNENROLL_TITLE',
      message: 'MODALS.UNENROLL_MSG',
      params: { name: studentName },
      confirmText: 'MODALS.DELETE',
      danger: true
    });

    if (!confirmed) return;

    this.lessonsService.unenrollStudent(lesson.id, studentId).subscribe({
      next: () => {
        this.toast.success('NOTIFICATIONS.UNENROLL_SUCCESS');
        this.enrolledStudents.update(current => current.filter(s => s.id !== studentId));
        this.updateLessonEnrollmentCount(lesson.id, -1);
        // Refresh search if active so the removed student can reappear
        if (this.searchQuery().length >= 2) {
          this.searchSubject.next(this.searchQuery());
        }
      },
      error: () => this.toast.error('NOTIFICATIONS.UNENROLL_ERROR')
    });
  }
}
