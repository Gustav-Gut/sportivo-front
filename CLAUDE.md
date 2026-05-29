# Clubit Frontend — Guía de Desarrollo

Proyecto Angular 21 standalone para la plataforma de gestión de escuelas deportivas Clubit.
Este archivo es la fuente de verdad para continuar el desarrollo sin perder contexto entre sesiones.

---

## Stack técnico

| Herramienta | Versión |
|---|---|
| Angular | 21.2.0 (standalone-only, zoneless) |
| TypeScript | 5.9.2 (strict mode) |
| Tailwind CSS | 4.2.1 |
| @ngx-translate | 17.0.0 |
| RxJS | 7.8.0 |
| Vitest | 4.0.8 |

```bash
npm start        # ng serve --host 0.0.0.0
npm run build    # set-env + ng build
ng test          # vitest
```

---

## Estructura del proyecto

```
src/app/
├── core/
│   ├── guards/          # auth.guard.ts — protege rutas autenticadas
│   ├── interceptors/    # auth.interceptor.ts — agrega cookie + api-key header
│   ├── layout/          # main-layout, sidebar, mobile-menu, footer
│   └── services/        # Servicios inyectables (ver sección Servicios)
├── features/            # Módulos por dominio (lazy loaded)
│   ├── auth/            # Login
│   ├── finances/        # Dashboard + Payments
│   ├── lessons/         # Lessons admin
│   ├── schools/         # Info, Sports, Facilities, Payment Plans
│   ├── students/        # ⏳ Pendiente — carpeta vacía
│   └── users/           # User list + User form
└── shared/ui/           # 23 componentes reutilizables (ver sección UI)
```

---

## Internacionalización (i18n)

### Archivos de traducción
```
public/assets/i18n/
├── en-US.json
├── es-AR.json
└── es-CL.json   ← fallback por defecto
```

### Idioma activo
1. `localStorage.getItem('user_lang')`
2. Browser culture lang (ej: `es-CL`)
3. Browser lang mapeado (`es → es-CL`, `en → en-US`)
4. Default: `es-CL`

### Uso en templates
```html
<!-- Simple -->
{{ 'SCHOOL.INFO_PAGE.LABEL_NAME' | translate }}

<!-- Con parámetros -->
{{ 'COMMON.DAYS_OVERDUE' | translate: { count: daysCount } }}
{{ 'DASHBOARD.STATS.VS_LAST_MONTH' | translate: { value: '+15%' } }}
```

### Convención de keys
```
FEATURE.SUBSECTION.KEY
```

| Namespace | Uso |
|---|---|
| `AUTH` | Autenticación (login, etc.) |
| `SIDEBAR` | Menú lateral y navegación |
| `COMMON` | Compartido: status, tabla, días, meses, saving… |
| `MODALS` | Textos de modales: confirm, cancel, delete… |
| `NOTIFICATIONS` | Toasts del sistema |
| `DASHBOARD` | Stats, charts, quick actions, tablas resumen |
| `FINANCES` | Título, facturas, registros |
| `SCHOOL` | Info, sports, facilities, payment plans |
| `USERS` | Lista y drawer de usuarios |
| `LESSONS` | Lista y drawer de clases |

### Regla importante
**Toda cadena visible al usuario va en los JSON de i18n.** No hardcodear texto en templates ni en TypeScript. Al agregar features nuevas, agregar las keys en los 3 archivos (`en-US`, `es-AR`, `es-CL`).

---

## Librería de componentes UI (`shared/ui`)

Todos los componentes son standalone. Importar solo lo que se use en cada componente.

### Layout de página — patrón obligatorio

```html
<app-page-layout>
  <app-page-header
    [title]="'FEATURE.PAGE_TITLE' | translate"
    [subtitle]="'FEATURE.PAGE_SUBTITLE' | translate">
    <button actions (click)="openDrawer()">Acción</button>
  </app-page-header>

  <!-- contenido -->
</app-page-layout>
```

---

### `app-drawer` — Slide-over responsivo

Desktop: panel desde la derecha. Mobile: bottom sheet.

```html
<app-drawer
  [isOpen]="showDrawer()"
  [title]="'FEATURE.DRAWER.TITLE' | translate"
  [subtitle]="'FEATURE.DRAWER.SUBTITLE' | translate"
  icon="add_box"
  size="md"
  (closed)="closeDrawer()">

  <form id="myForm" [formGroup]="form" (ngSubmit)="onSubmit()" class="px-4 py-4 flex flex-col gap-5">
    <app-drawer-section
      [number]="1"
      [title]="'...' | translate"
      [isOpen]="openSection() === 1"
      [isDone]="form.valid"
      (toggle)="toggleSection(1)">
      <!-- campos -->
    </app-drawer-section>
  </form>

  <ng-container drawer-footer>
    <button type="button" (click)="closeDrawer()">{{ 'MODALS.CANCEL' | translate }}</button>
    <button type="submit" form="myForm" [disabled]="form.invalid || isSaving()">
      {{ 'MODALS.SAVE' | translate }}
    </button>
  </ng-container>
</app-drawer>
```

**Tamaños disponibles:**
| `size` | Ancho desktop |
|---|---|
| `md` | 520px — default, formularios simples |
| `lg` | 600px — formularios con más secciones |
| `xl` | 720px — drawers con tabs o contenido complejo |

**Inputs:**

| Input | Tipo | Default |
|---|---|---|
| `isOpen` | `boolean` | `false` |
| `title` | `string` | `''` |
| `subtitle` | `string` | `''` |
| `icon` | `string` | `'edit'` |
| `size` | `'md' \| 'lg' \| 'xl'` | `'md'` |

**Outputs:** `closed` — emite al cerrar (ESC o botón ×)

---

### `app-drawer-section` — Sección colapsable dentro de drawer

| Input | Tipo | Default |
|---|---|---|
| `number` | `number` | `1` |
| `title` | `string` | `''` |
| `subtitle` | `string` | `''` |
| `isOpen` | `boolean` | `false` |
| `isDone` | `boolean` | `false` |

**Output:** `toggle` — emite al hacer click en el header

---

### `app-advanced-data-table` — Tabla con búsqueda, filtros y paginación

```typescript
columns: AdvanceTableColumn[] = [
  { key: 'name',   label: 'COMMON.TABLE.NAME',   type: 'text' },
  { key: 'amount', label: 'COMMON.TABLE.AMOUNT',  type: 'currency' },
  { key: 'status', label: 'COMMON.TABLE.STATUS',  type: 'status' },
  { key: 'member', label: 'COMMON.TABLE.MEMBER',  type: 'member' },
  {
    key: 'actions', label: '', type: 'actions',
    actions: [
      { label: 'COMMON.TABLE.EDIT', icon: 'edit', callback: (row) => this.onEdit(row) },
      { label: 'COMMON.TABLE.DELETE', icon: 'delete', callback: (row) => this.onDelete(row) },
    ]
  }
];
```

```html
<app-advanced-data-table
  [title]="'FEATURE.TABLE_TITLE' | translate"
  [columns]="columns"
  [data]="data()"
  [pageSize]="10">
</app-advanced-data-table>
```

---

### `app-summary-table` — Tabla simple sin paginación

```typescript
columns: TableColumn[] = [
  { key: 'name', label: 'COMMON.TABLE.NAME', type: 'text' },
  { key: 'amount', label: 'COMMON.TABLE.AMOUNT', type: 'currency' },
];
```

---

### `app-section-card` — Card glassmorphic para paneles

```html
<app-section-card>
  <!-- contenido -->
</app-section-card>
```

---

### `app-section-header` — Header de sección con icono

| Input | Tipo | Default |
|---|---|---|
| `icon` | `string` | `''` |
| `title` | `string` | `''` |
| `number` | `number \| null` | `null` |
| `bordered` | `boolean` | `true` |

---

### `app-stat-card` — Tarjeta de métrica con valor e ícono

| Input | Tipo | Requerido |
|---|---|---|
| `title` | `string` | ✅ |
| `value` | `string \| number` | ✅ |
| `icon` | `string` | ✅ |
| `trendText` | `string` | — |
| `trendColor` | `'emerald' \| 'red' \| 'primary'` | — |
| `glowColor` | `'emerald' \| 'red' \| 'primary'` | — |
| `progressPercentage` | `number` | — |

---

### `app-tabs` — Navegación por tabs

```typescript
tabs: TabItem[] = [
  { id: 'all', label: 'COMMON.ALL' },
  { id: 'active', label: 'COMMON.ACTIVE', count: 12 },
];
activeTab = signal('all');
```

```html
<app-tabs [tabs]="tabs" [activeTab]="activeTab()" (tabChange)="activeTab.set($event)" />
```

---

### `app-empty-state` — Estado vacío

| Input | Tipo | Default |
|---|---|---|
| `icon` | `string` | `'inbox'` |
| `title` | `string` | `''` |
| `subtitle` | `string` | `''` |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` |
| `framed` | `boolean` | `false` |

```html
<app-empty-state
  icon="sports_soccer"
  [title]="'FEATURE.EMPTY_TITLE' | translate"
  [subtitle]="'FEATURE.EMPTY_SUBTITLE' | translate"
  size="md">
  <ng-container action>
    <button (click)="openDrawer()">Agregar</button>
  </ng-container>
</app-empty-state>
```

---

### `app-alert` — Banner de alerta inline

| Input | Tipo | Default |
|---|---|---|
| `variant` | `'error' \| 'warning' \| 'success' \| 'info'` | `'error'` |
| `message` | `string` | `''` |

---

### `app-badge` — Badge de etiqueta

| Input | Tipo | Default |
|---|---|---|
| `label` | `string` | `''` |
| `theme` | `'success' \| 'warning' \| 'error' \| 'info' \| 'default'` | `'default'` |
| `status` | `string` | — (auto-traduce `COMMON.STATUS.{STATUS}`) |

---

### `app-status-badge` — Badge de estado con dot

| Input | Tipo | Default |
|---|---|---|
| `variant` | `'success' \| 'danger' \| 'warning' \| 'info' \| 'neutral'` | `'success'` |
| `label` | `string` | `''` |

---

### `app-quick-action` — Card de acción rápida

| Input | Tipo | Requerido |
|---|---|---|
| `title` | `string` | ✅ |
| `subtitle` | `string` | ✅ |
| `icon` | `string` | ✅ |
| `theme` | `'primary' \| 'emerald' \| 'red'` | — |

---

### `app-inline-quick-add` — Formulario inline de agregar rápido

| Input | Tipo | Default |
|---|---|---|
| `open` | `boolean` | `false` |
| `label` | `string` | `''` |
| `icon` | `string` | `'add'` |
| `submitDisabled` | `boolean` | `false` |
| `isSubmitting` | `boolean` | `false` |

**Outputs:** `toggle`, `submit`

---

### `app-form-field` — Wrapper de campo con label

| Input | Tipo | Default |
|---|---|---|
| `label` | `string` | `''` |
| `required` | `boolean` | `false` |
| `hint` | `string` | `''` |

Clases CSS globales para inputs dentro: `.form-input`, `.form-input-sm`, `.form-textarea`

---

### `app-loading` — Spinner de página completa

```html
@if (isLoading()) {
  <app-loading [message]="'COMMON.LOADING' | translate" />
}
```

---

### `app-spinner` — Spinner inline

| Input | Tipo | Default |
|---|---|---|
| `size` | `'sm' \| 'md' \| 'lg'` | `'sm'` |

---

### `app-bar-chart` — Gráfico de barras

Dos series (primary/secondary). Ver implementación en finances/dashboard para ejemplo de uso.

---

### `app-user-action-list` — Card de usuario con acción

| Input | Tipo | Requerido |
|---|---|---|
| `initials` | `string` | ✅ |
| `title` | `string` | ✅ |
| `subtitle` | `string` | ✅ |
| `actionIcon` | `string` | — |

---

### `app-confirm-modal` y `app-toast-container`

Ya están montados en `main-layout`. **No agregar manualmente en páginas.**
Usar los servicios correspondientes:

```typescript
// Toast
this.toastService.success('NOTIFICATIONS.SAVE_SUCCESS');
this.toastService.error('NOTIFICATIONS.LOAD_ERROR');
this.toastService.warning('NOTIFICATIONS.VALIDATION_ERROR');

// Confirm
const ok = await this.confirmService.ask({
  title: 'MODALS.DELETE_TITLE',
  message: 'MODALS.DELETE_MSG',
  params: { name: entity.name },
  confirmText: 'MODALS.DELETE',
  danger: true
});
if (ok) { /* eliminar */ }
```

---

## Servicios core

| Servicio | Propósito |
|---|---|
| `AuthService` | Login, logout, checkAuthStatus. Signals: `isAuthenticated`, `currentUser` |
| `ToastService` | Notificaciones (success, error, warning, info) |
| `ConfirmService` | Modal de confirmación — retorna `Promise<boolean>` |
| `UsersService` | CRUD usuarios |
| `LessonsService` | CRUD lecciones + fetch de dependencias |
| `FacilitiesService` | CRUD instalaciones |
| `SportsService` | Lista de deportes + custom fields |
| `SchoolsService` | Fetch/update info de la escuela |
| `PaymentsService` | Operaciones de pagos |
| `PlansService` | CRUD planes de pago |

---

## Autenticación

- **Estrategia:** HttpOnly cookies + sesión backend
- `auth.interceptor.ts` — agrega `x-internal-api-key` header y `withCredentials: true`
- `auth.guard.ts` — protege todas las rutas bajo `/` excepto `/auth/login`
- Ruta por defecto post-login: `/finances/dashboard`

---

## Patrón de página nueva

Checklist al crear una página nueva:

1. **Crear archivos:** `feature-name.ts`, `feature-name.html`, `feature-name.scss`
2. **Registrar la ruta** en el archivo de rutas del feature con `authGuard`
3. **Lazy load** del feature desde `app.routes.ts`
4. **Usar `app-page-layout` + `app-page-header`** como wrapper siempre
5. **Drawer con `app-drawer`** directo en el template (no crear wrapper components)
6. **Signals para estado:** `showDrawer = signal(false)`, `isLoading = signal(true)`, etc.
7. **ChangeDetection: OnPush** en todos los componentes
8. **Texts:** todas las cadenas en i18n (los 3 archivos JSON)
9. **Acciones destructivas:** siempre pasar por `ConfirmService.ask()`
10. **Feedback:** usar `ToastService` para éxito/error de operaciones

---

## Patrón de componente con formulario en drawer

```typescript
@Component({ standalone: true, changeDetection: ChangeDetectionStrategy.OnPush, ... })
export class MyPage {
  private fb = inject(FormBuilder);
  private toastService = inject(ToastService);

  showDrawer = signal(false);
  isSaving = signal(false);
  openSection = signal<number>(1);

  form = this.fb.group({
    name: ['', Validators.required],
  });

  openDrawer() { this.showDrawer.set(true); }

  closeDrawer() {
    this.form.reset();
    this.openSection.set(1);
    this.showDrawer.set(false);
  }

  toggleSection(n: number) {
    this.openSection.set(this.openSection() === n ? 0 : n);
  }

  onSubmit() {
    if (this.form.invalid) return;
    this.isSaving.set(true);
    this.myService.create(this.form.value).subscribe({
      next: () => {
        this.toastService.success('NOTIFICATIONS.SAVE_SUCCESS');
        this.closeDrawer();
        this.loadData();
      },
      error: () => {
        this.toastService.error('NOTIFICATIONS.SAVE_ERROR');
      },
      complete: () => this.isSaving.set(false)
    });
  }
}
```

---

## Estado actual de features

| Feature | Ruta | Estado |
|---|---|---|
| Login | `/auth/login` | ✅ Completo |
| Finance Dashboard | `/finances/dashboard` | ✅ Completo |
| Payments / Invoices | `/finances/payments` | ✅ Completo |
| Lessons Admin | `/lessons` | ✅ Completo |
| School Info | `/school/info` | ✅ Completo |
| School Sports | `/school/sports` | ✅ Completo |
| School Facilities | `/school/facilities` | ✅ Completo |
| School Payment Plans | `/school/payment-plans` | ✅ Completo |
| User List | `/users` | ✅ Completo |
| User Form | `/users/new`, `/users/edit/:id` | ✅ Completo |
| **Students** | `/students` | ⏳ Pendiente — carpeta existe, sin implementar |

---

## Decisiones técnicas tomadas (no revertir)

- **Standalone-only:** Sin `NgModule`, todo `standalone: true`
- **Zoneless:** `provideZonelessChangeDetection()` — no usar `zone.js`
- **OnPush en todo:** `changeDetection: ChangeDetectionStrategy.OnPush`
- **Inyección via `inject()`:** No usar constructor para inyectar dependencias
- **Drawer directo:** No crear componentes wrapper para drawers. Cada página tiene su `<app-drawer>` inline
- **Tamaños de drawer estandarizados:** Solo `size="md"` (default), `size="lg"`, `size="xl"`. No usar `width` libre
- **i18n obligatorio:** Sin texto hardcodeado en templates ni `.ts`
- **Signals para estado local:** No usar `BehaviorSubject` para estado de componentes
- **RxJS para async:** Servicios retornan `Observable<T>`, suscribir en componentes

---

## Theming

- **Color primario:** `#3B82F6` (azul) — token: `primary`
- **Background app:** `#0A1628` (navy oscuro)
- **Card background:** `#111E2F` (glassmorphism oscuro)
- **Borders:** `border-slate-700/50`
- **Tipografía:** Plus Jakarta Sans
- **Iconos:** Material Symbols (outlined) — `<span class="material-symbols-outlined">icon_name</span>`
- **Estilo general:** Dark mode, glassmorphism, bordes sutiles

---

## Notas de sesiones anteriores

- **2026-05-24:** Homologación de traducciones — revisión y completado de keys i18n en los 3 JSON
- **2026-05-29:** Estandarización de drawers — reemplazado `width` libre por sistema `size: md/lg/xl`. Eliminado wrapper `InvoiceModal`, drawer de payments ahora es invocación directa estándar. Corregidos 2 warnings Angular (NG8107, NG8113)
