import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { LessonsService, Lesson } from '../../../../core/services/lessons.service';
import { UsersService } from '../../../../core/services/users.service';
import { ToastService } from '../../../../core/services/toast.service';
import { ConfirmService } from '../../../../core/services/confirm.service';
import { Subject, debounceTime, distinctUntilChanged } from 'rxjs';
import { TitleCasePipe } from '@angular/common';

@Component({
  selector: 'app-lesson-details',
  imports: [CommonModule, FormsModule, RouterLink, TitleCasePipe],
  templateUrl: './lesson-details.html',
  styleUrl: './lesson-details.scss'
})
export class LessonDetails implements OnInit {
  private route = inject(ActivatedRoute);
  private lessonsService = inject(LessonsService);
  private usersService = inject(UsersService);
  private toast = inject(ToastService);
  private confirmService = inject(ConfirmService);

  lessonId = signal<string | null>(null);
  lesson = signal<Lesson | null>(null);
  enrolledStudents = signal<any[]>([]);
  
  // Search State
  searchQuery = signal<string>('');
  searchResults = signal<any[]>([]);
  isSearching = signal<boolean>(false);
  
  private searchSubject = new Subject<string>();

  ngOnInit() {
    this.lessonId.set(this.route.snapshot.paramMap.get('id'));
    if (this.lessonId()) {
      this.loadLessonDetails();
    }

    // Server-side Autocomplete Logic
    this.searchSubject.pipe(
      debounceTime(400),
      distinctUntilChanged()
    ).subscribe(searchTerm => {
      this.performSearch(searchTerm);
    });
  }

  loadLessonDetails() {
    this.lessonsService.getLesson(this.lessonId()!).subscribe({
      next: (res: any) => {
        this.lesson.set(res);
        // The backend `findOne` returns `enrollments` array 
        const students = res.enrollments?.map((e: any) => e.student) || [];
        this.enrolledStudents.set(students);
      },
      error: () => this.toast.error('NOTIFICATIONS.LESSON_DETAILS_ERROR')
    });
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

  performSearch(searchTerm: string) {
    this.usersService.getUsers(1, 10, searchTerm, 'STUDENT').subscribe({
      next: (res) => {
        // Filter out students already enrolled
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
    this.lessonsService.enrollStudent(this.lessonId()!, student.id).subscribe({
      next: () => {
        this.toast.success('NOTIFICATIONS.ENROLL_SUCCESS', { name: student.firstName });
        this.enrolledStudents.update(current => [...current, student]);
        // Remove from search results
        this.searchResults.update(current => current.filter(s => s.id !== student.id));
      },
      error: (err: any) => {
        this.toast.error('NOTIFICATIONS.ENROLL_ERROR');
      }
    });
  }

  async unenrollStudent(studentId: string, studentName: string) {
    const confirmed = await this.confirmService.ask({
      title: 'MODALS.UNENROLL_TITLE',
      message: 'MODALS.UNENROLL_MSG',
      params: { name: studentName },
      confirmText: 'MODALS.DELETE',
      danger: true
    });

    if (confirmed) {
      this.lessonsService.unenrollStudent(this.lessonId()!, studentId).subscribe({
        next: () => {
          this.toast.success('NOTIFICATIONS.UNENROLL_SUCCESS');
          this.enrolledStudents.update(current => current.filter(s => s.id !== studentId));
          // Refresh search if there is an active query so the removed student might reappear
          if (this.searchQuery().length >= 2) {
            this.searchSubject.next(this.searchQuery());
          }
        },
        error: () => this.toast.error('NOTIFICATIONS.UNENROLL_ERROR')
      });
    }
  }
}
