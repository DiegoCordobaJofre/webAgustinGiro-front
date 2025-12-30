import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/portfolio/components/home/home.component').then(m => m.HomeComponent)
  },
  {
    path: 'proyectos',
    loadComponent: () => import('./features/portfolio/components/projects/projects.component').then(m => m.ProjectsComponent)
  },
  {
    path: 'proyectos/:id',
    loadComponent: () => import('./features/portfolio/components/project-detail/project-detail.component').then(m => m.ProjectDetailComponent)
  },
  {
    path: 'sobre',
    loadComponent: () => import('./features/portfolio/components/about/about.component').then(m => m.AboutComponent)
  },
  {
    path: 'contacto',
    loadComponent: () => import('./features/portfolio/components/contact/contact.component').then(m => m.ContactComponent)
  },
  {
    path: 'admin',
    children: [
      {
        path: 'login',
        loadComponent: () => import('./features/admin/components/login/login.component').then(m => m.LoginComponent)
      },
      {
        path: 'dashboard',
        loadComponent: () => import('./features/admin/components/dashboard/dashboard.component').then(m => m.DashboardComponent),
        canActivate: [authGuard]
      },
      {
        path: 'projects/new',
        loadComponent: () => import('./features/admin/components/project-form/project-form.component').then(m => m.ProjectFormComponent),
        canActivate: [authGuard]
      },
      {
        path: 'projects/:id/edit',
        loadComponent: () => import('./features/admin/components/project-form/project-form.component').then(m => m.ProjectFormComponent),
        canActivate: [authGuard]
      }
    ]
  },
  {
    path: '**',
    redirectTo: ''
  }
];


