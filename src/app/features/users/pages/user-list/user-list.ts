import { Component, ChangeDetectionStrategy, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AdvancedDataTable, AdvanceTableColumn } from '../../../../shared/ui/advanced-data-table/advanced-data-table';
import { UsersService, UserListResponse } from '../../../../core/services/users.service';
import { SportsService } from '../../../../core/services/sports.service';
import { ToastService } from '../../../../core/services/toast.service';
import { DrawerComponent } from '../../../../shared/ui/drawer/drawer';
import { DrawerSectionComponent } from '../../../../shared/ui/drawer-section/drawer-section';
import { LoadingComponent } from '../../../../shared/ui/loading/loading';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, AdvancedDataTable, DrawerComponent, DrawerSectionComponent, LoadingComponent],
  templateUrl: './user-list.html',
  styleUrls: ['./user-list.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserList implements OnInit {
  private usersService = inject(UsersService);
  private sportsService = inject(SportsService);
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private toast = inject(ToastService);

  // ── Table ──────────────────────────────────────────────
  columns: AdvanceTableColumn[] = [
    { key: 'rut', label: 'COMMON.TABLE.RUT', type: 'text' },
    { key: 'member', label: 'COMMON.TABLE.USER', type: 'member' },
    { key: 'roles', label: 'COMMON.TABLE.ROLES', type: 'status' },
    { key: 'email', label: 'COMMON.TABLE.EMAIL', type: 'text' },
    { key: 'status', label: 'COMMON.TABLE.STATUS', type: 'status' },
    {
      key: 'actions', label: '', type: 'actions',
      actions: [
        { label: 'COMMON.TABLE.EDIT', icon: 'edit', callback: (row: any) => this.openDrawerForEdit(row.id) }
      ]
    }
  ];

  usersData = signal<any[]>([]);
  isLoading = signal<boolean>(true);

  // ── Drawer ─────────────────────────────────────────────
  showDrawer = signal(false);
  isSaving = signal(false);
  errorMessage = signal<string | null>(null);
  sportsSchema = signal<any[]>([]);
  sportsLoaded = signal(false);
  isFormReady = signal(false);

  /** null = create mode, object = edit mode */
  editingUser = signal<any | null>(null);

  get isEditMode() { return this.editingUser() !== null; }
  get drawerTitle()    { return this.isEditMode ? 'MODALS.USER.EDIT_TITLE'   : 'MODALS.USER.NEW_TITLE'; }
  get drawerSubtitle() { return this.isEditMode ? 'MODALS.USER.EDIT_SUBTITLE' : 'MODALS.USER.NEW_SUBTITLE'; }
  get drawerIcon()     { return this.isEditMode ? 'edit'        : 'person_add'; }
  get submitLabel()    { return this.isEditMode ? 'MODALS.USER.SAVE_BTN' : 'MODALS.USER.CREATE_BTN'; }
  get submitIcon()     { return this.isEditMode ? 'save'         : 'person_add'; }

  // Accordion: which section is open (1, 2 or 3)
  openSection = signal<number>(1);
  toggleSection(n: number) {
    this.openSection.set(this.openSection() === n ? 0 : n);
  }

  selectedPrimaryRole = signal<'STUDENT' | 'COACH' | 'TUTOR' | 'ADMIN' | 'SUPERADMIN'>('STUDENT');

  userForm: FormGroup = this.fb.group({
    firstName: ['', Validators.required],
    lastName:  ['', Validators.required],
    rut:       ['', Validators.required],
    email:     ['', [Validators.required, Validators.email]],
    password:  ['', Validators.required],
    phone:     [''],
    roles:     [['STUDENT'], Validators.required],
    // Student
    student_birthDate:    [''],
    student_weight:       [''],
    student_height:       [''],
    student_bloodType:    [''],
    student_medicalNotes: [''],
    // Coach
    coach_specialty:       [''],
    coach_yearsExperience: [''],
    coach_certifications:  [''],
    // Tutor
    tutor_emergencyContact: [''],
    tutor_occupation:       [''],
    tutor_address:          ['']
  });

  ngOnInit() {
    this.loadUsers();
    // Pre-fetch sports schema so Create opens instantly
    this.sportsService.getSportsSchema().subscribe({
      next: (schema) => {
        this.sportsSchema.set(schema);
        this.registerDynamicFields(schema);
        this.sportsLoaded.set(true);
      }
    });
  }

  // ── List ───────────────────────────────────────────────
  loadUsers() {
    this.isLoading.set(true);
    this.usersService.getUsers().subscribe({
      next: (res: UserListResponse) => {
        const mappedData = res.data.map(user => ({
          id: user.id,
          rut: user.rut,
          member: {
            initials: user.firstName.charAt(0).toUpperCase() + user.lastName.charAt(0).toUpperCase(),
            name: `${user.firstName} ${user.lastName}`
          },
          email: user.email,
          roles: user.roles || [],
          status: user.active ? 'Active' : 'Inactive'
        }));
        this.usersData.set(mappedData);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false)
    });
  }

  // ── Drawer control ─────────────────────────────────────
  openDrawer(user?: any) {
    this.editingUser.set(user ?? null);
    this.openSection.set(1);
    this.errorMessage.set(null);

    // If schema is already loaded (pre-fetched), open instantly like Lessons
    if (!user && this.sportsLoaded()) {
      this.resetForm();
      this.isFormReady.set(true);
      this.showDrawer.set(true);
    } else {
      // Schema not ready yet (rare) or edit mode — show loader
      this.isFormReady.set(false);
      this.showDrawer.set(true);
      if (!user) {
        setTimeout(() => {
          this.ensureSchemaAndReady();
        }, 350);
      }
    }
  }

  private ensureSchemaAndReady(user?: any) {
    if (!this.sportsLoaded()) {
      this.sportsService.getSportsSchema().subscribe({
        next: (schema) => {
          this.sportsSchema.set(schema);
          this.registerDynamicFields(schema);
          this.sportsLoaded.set(true);
          if (user) this.patchFormForEdit(user); else this.resetForm();
          this.isFormReady.set(true);
        }
      });
    } else {
      if (user) this.patchFormForEdit(user); else this.resetForm();
      this.isFormReady.set(true);
    }
  }

  private resetForm() {
    this.userForm.reset();
    this.userForm.patchValue({ roles: ['STUDENT'] });
    this.selectedPrimaryRole.set('STUDENT');
    this.userForm.get('password')?.setValidators([Validators.required]);
    this.userForm.get('password')?.updateValueAndValidity();
  }

  private patchFormForEdit(user: any) {
    const role = Array.isArray(user.roles) ? user.roles[0] : 'STUDENT';
    this.selectedPrimaryRole.set(role);
    // Password is optional in edit mode — clear its validator
    this.userForm.get('password')?.clearValidators();
    this.userForm.get('password')?.updateValueAndValidity();
    this.userForm.patchValue({
      firstName: user.firstName ?? '',
      lastName:  user.lastName  ?? '',
      rut:       user.rut       ?? '',
      email:     user.email     ?? '',
      phone:     user.phone     ?? '',
      password:  '',  // always blank — user can optionally change it
      roles:     user.roles     ?? [role],
      // Student profile
      student_birthDate:    user.studentProfile?.birthDate ? new Date(user.studentProfile.birthDate).toISOString().split('T')[0] : '',
      student_weight:       user.studentProfile?.weight       ?? '',
      student_height:       user.studentProfile?.height       ?? '',
      student_bloodType:    user.studentProfile?.bloodType    ?? '',
      student_medicalNotes: user.studentProfile?.medicalNotes ?? '',
      // Coach profile
      coach_specialty:       user.coachProfile?.specialty       ?? '',
      coach_yearsExperience: user.coachProfile?.yearsExperience ?? '',
      coach_certifications:  user.coachProfile?.certifications  ?? '',
      // Tutor profile
      tutor_emergencyContact: user.tutorProfile?.emergencyContact ?? '',
      tutor_occupation:       user.tutorProfile?.occupation       ?? '',
      tutor_address:          user.tutorProfile?.address          ?? '',
    });

    // Patch dynamic sport fields from stored sportData JSON
    const patchSportData = (sportData: Record<string, any>, profileType: 'student' | 'coach') => {
      if (!sportData) return;
      Object.entries(sportData).forEach(([sportName, fields]) => {
        if (fields && typeof fields === 'object') {
          Object.entries(fields as Record<string, any>).forEach(([fieldKey, value]) => {
            const controlKey = `sport_${sportName.toLowerCase()}_${profileType}_${fieldKey}`;
            if (this.userForm.contains(controlKey)) {
              this.userForm.get(controlKey)?.setValue(value ?? '');
            }
          });
        }
      });
    };

    patchSportData(user.studentProfile?.sportData, 'student');
    patchSportData(user.coachProfile?.sportData,   'coach');
  }

  closeDrawer() {
    this.showDrawer.set(false);
    // Defer reset to not block the slide-out animation
    setTimeout(() => {
      this.isFormReady.set(false);
      this.userForm.reset({ roles: ['STUDENT'] });
      this.selectedPrimaryRole.set('STUDENT');
      this.errorMessage.set(null);
      this.userForm.get('password')?.setValidators([Validators.required]);
      this.userForm.get('password')?.updateValueAndValidity();
    }, 300);
  }

  private registerDynamicFields(sports: any[]) {
    sports.forEach(sport => {
      sport.schema.student?.forEach((field: any) => {
        const key = `sport_${sport.sportName.toLowerCase()}_student_${field.key}`;
        if (!this.userForm.contains(key))
          this.userForm.addControl(key, this.fb.control(''));
      });
      sport.schema.coach?.forEach((field: any) => {
        const key = `sport_${sport.sportName.toLowerCase()}_coach_${field.key}`;
        if (!this.userForm.contains(key))
          this.userForm.addControl(key, this.fb.control(''));
      });
    });
  }

  onRoleChange(event: Event) {
    const role = (event.target as HTMLSelectElement).value as any;
    this.selectedPrimaryRole.set(role);
    this.userForm.patchValue({ roles: [role] });
  }

  // Section completion checks (for checkmark indicators)
  section1Done() {
    const f = this.userForm;
    return f.get('roles')?.valid;
  }

  section2Done() {
    const f = this.userForm;
    // In edit mode password is optional, so exclude it from the check
    const requiredFields = this.isEditMode
      ? ['firstName', 'lastName', 'rut', 'email']
      : ['firstName', 'lastName', 'rut', 'email', 'password'];
    return requiredFields.every(k => f.get(k)?.valid);
  }

  section3Done() {
    // Section 3 is done if there are no missing role-specific or sport fields
    return this.validateRoleFields().length === 0;
  }

  /** Validates role-specific required sport fields that aren't in the main FormGroup validators */
  private validateRoleFields(): string[] {
    const role = this.selectedPrimaryRole();
    const v = this.userForm.value;
    const missing: string[] = [];

    const schemaKey = role === 'STUDENT' ? 'student' : role === 'COACH' ? 'coach' : null;
    if (!schemaKey) return []; // ADMIN / SUPERADMIN / TUTOR have no sport fields

    this.sportsSchema().forEach(sport => {
      sport.schema[schemaKey]?.forEach((field: any) => {
        if (field.required) {
          const controlKey = `sport_${sport.sportName.toLowerCase()}_${schemaKey}_${field.key}`;
          const val = v[controlKey];
          if (val === null || val === undefined || val === '') {
            missing.push(`${sport.sportName} → ${field.label}`);
          }
        }
      });
    });

    return missing;
  }

  onSubmit() {
    if (this.userForm.invalid) {
      this.userForm.markAllAsTouched();
      this.toast.warning('NOTIFICATIONS.USER_FORM_ERROR');
      return;
    }

    // Validate role-specific sport required fields
    const missingFields = this.validateRoleFields();
    if (missingFields.length > 0) {
      this.toast.warning('NOTIFICATIONS.USER_SPORT_FIELDS_ERROR', { fields: missingFields.join(', ') });
      // Open section 3 so the user can see them
      this.openSection.set(3);
      return;
    }

    this.isSaving.set(true);
    this.errorMessage.set(null);
    const v = this.userForm.value;
    const role = this.selectedPrimaryRole();

    const payload: any = {
      firstName: v.firstName, lastName: v.lastName,
      rut: v.rut, email: v.email,
      phone: v.phone, roles: v.roles
    };

    // If password is provided, include it in the payload
    if (v.password && v.password.trim() !== '') {
      payload.password = v.password;
    }

    if (role === 'STUDENT') {
      const sportData: any = {};
      this.sportsSchema().forEach(s => {
        const sk = s.sportName.toLowerCase();
        sportData[sk] = {};
        s.schema.student?.forEach((f: any) => {
          const val = v[`sport_${sk}_student_${f.key}`];
          if (val !== undefined && val !== '')
            sportData[sk][f.key] = f.type === 'number' ? parseFloat(val) : val;
        });
      });
      payload.studentProfile = {
        birthDate: v.student_birthDate ? new Date(v.student_birthDate).toISOString() : undefined,
        weight: v.student_weight ? parseFloat(v.student_weight) : undefined,
        height: v.student_height ? parseFloat(v.student_height) : undefined,
        bloodType: v.student_bloodType || undefined,
        medicalNotes: v.student_medicalNotes || undefined,
        sportData
      };
    } else if (role === 'COACH') {
      const sportData: any = {};
      this.sportsSchema().forEach(s => {
        const sk = s.sportName.toLowerCase();
        sportData[sk] = {};
        s.schema.coach?.forEach((f: any) => {
          const val = v[`sport_${sk}_coach_${f.key}`];
          if (val !== undefined && val !== '')
            sportData[sk][f.key] = f.type === 'number' ? parseFloat(val) : val;
        });
      });
      payload.coachProfile = {
        specialty: v.coach_specialty || undefined,
        yearsExperience: v.coach_yearsExperience ? parseInt(v.coach_yearsExperience, 10) : undefined,
        certifications: v.coach_certifications || undefined,
        sportData
      };
    } else if (role === 'TUTOR') {
      payload.tutorProfile = {
        emergencyContact: v.tutor_emergencyContact || undefined,
        occupation: v.tutor_occupation || undefined,
        address: v.tutor_address || undefined
      };
    }

    const call$ = this.isEditMode
      ? this.usersService.updateUser(this.editingUser().id, payload)
      : this.usersService.createUser(payload);

    call$.subscribe({
      next: () => {
        this.isSaving.set(false);
        this.toast.success(this.isEditMode ? 'NOTIFICATIONS.USER_UPDATE_SUCCESS' : 'NOTIFICATIONS.USER_ADD_SUCCESS');
        this.closeDrawer();
        this.loadUsers();
      },
      error: (err) => {
        this.errorMessage.set('NOTIFICATIONS.' + (this.isEditMode ? 'USER_UPDATE_ERROR' : 'USER_ADD_ERROR'));
        this.isSaving.set(false);
      }
    });
  }

  /** Load a single user by id and open the drawer for editing */
  openDrawerForEdit(userId: string) {
    // 1. Open drawer immediately with loader — identical to "New User"
    this.editingUser.set({ id: userId } as any);
    this.showDrawer.set(true);
    this.isFormReady.set(false);
    this.openSection.set(1);
    this.errorMessage.set(null);

    // 2. Wait for animation to fully complete before doing ANY work
    setTimeout(() => {
      this.usersService.getUser(userId).subscribe({
        next: (user) => {
          this.editingUser.set(user);
          this.ensureSchemaAndReady(user);
        },
        error: () => {
          this.toast.warning('NOTIFICATIONS.USER_LOAD_ERROR');
          this.closeDrawer();
        }
      });
    }, 350);
  }
}
