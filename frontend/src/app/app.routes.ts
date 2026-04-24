import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: 'login',
    loadComponent: () => import('./pages/auth/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'register',
    loadComponent: () => import('./pages/auth/register/register.component').then(m => m.RegisterComponent)
  },
  {
    path: 'dashboard',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/layout/layout.component').then(m => m.LayoutComponent),
    children: [
      {
        path: '',
        loadComponent: () => import('./pages/patient-dashboard/patient-dashboard.component').then(m => m.PatientDashboardComponent)
      },
      {
        path: 'pregnancy',
        loadComponent: () => import('./pages/pregnancy-profile/pregnancy-profile.component').then(m => m.PregnancyProfileComponent)
      },
      {
        path: 'appointments',
        loadComponent: () => import('./pages/appointments/appointments.component').then(m => m.AppointmentsComponent)
      },
      {
        path: 'symptoms',
        loadComponent: () => import('./pages/symptoms/symptoms.component').then(m => m.SymptomsComponent)
      },
      {
        path: 'nutrition',
        loadComponent: () => import('./pages/nutrition/nutrition.component').then(m => m.NutritionComponent)
      },
      {
        path: 'medications',
        loadComponent: () => import('./pages/medications/medications.component').then(m => m.MedicationsComponent)
      },
      {
        path: 'growth',
        loadComponent: () => import('./pages/baby-growth/baby-growth.component').then(m => m.BabyGrowthComponent)
      },
      {
        path: 'baby-preview',
        loadComponent: () => import('./pages/baby-preview/baby-preview.component').then(m => m.BabyPreviewComponent)
      },
      {
        path: 'education',
        loadComponent: () => import('./pages/education/education-list.component').then(m => m.EducationListComponent)
      },
      {
        path: 'education/:moduleId',
        loadComponent: () => import('./pages/education/education-detail.component').then(m => m.EducationDetailComponent)
      },
      {
        path: 'doctor',
        canActivate: [roleGuard],
        data: { roles: ['DOCTOR', 'ADMIN'] },
        loadComponent: () => import('./pages/doctor-dashboard/doctor-dashboard.component').then(m => m.DoctorDashboardComponent)
      },
      {
        path: 'admin',
        canActivate: [roleGuard],
        data: { roles: ['ADMIN'] },
        loadComponent: () => import('./pages/admin-panel/admin-panel.component').then(m => m.AdminPanelComponent)
      },
      {
        path: 'doctor/education',
        canActivate: [roleGuard],
        data: { roles: ['DOCTOR', 'ADMIN'] },
        loadComponent: () => import('./pages/education/education-admin.component').then(m => m.EducationAdminComponent)
      },
      {
        path: 'doctor/education/:moduleId/quizzes',
        canActivate: [roleGuard],
        data: { roles: ['DOCTOR', 'ADMIN'] },
        loadComponent: () => import('./pages/education/education-quizzes.component').then(m => m.EducationQuizzesComponent)
      },
      {
        path: 'admin/education',
        redirectTo: 'doctor/education'
      },
      {
        path: 'admin/education/:moduleId/quizzes',
        redirectTo: 'doctor/education/:moduleId/quizzes'
      }
    ]
  },
  { path: '**', redirectTo: 'login' }
];
