import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { ProjectService } from '../../../../core/services/project.service';
import { AuthService } from '../../../../core/services/auth.service';
import { Project, ProjectCategory, ProjectStatus } from '../../../../models/project.model';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { pickLocale } from '../../../../core/i18n/localized';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslateModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  projects: Project[] = [];
  isLoading = true;
  featuredCount = 0;
  menuCount = 0;

  constructor(
    private projectService: ProjectService,
    private authService: AuthService,
    private router: Router,
    private translate: TranslateService
  ) {}

  ngOnInit(): void {
    this.loadProjects();
  }

  private loadProjects(): void {
    this.projectService.getAll().subscribe({
      next: (projects) => {
        this.projects = projects;
        this.updateCounts();
        this.isLoading = false;
      },
      error: () => {
        // Si hay error, mostrar proyectos de ejemplo
        this.projects = this.getExampleProjects();
        this.updateCounts();
        this.isLoading = false;
      }
    });
  }

  private updateCounts(): void {
    this.featuredCount = this.projects.filter(p => p.featured === true).length;
    this.menuCount = this.projects.filter(p => p.showInMenu !== false).length;
  }

  private getExampleProjects(): Project[] {
    return [
      {
        id: 1,
        title: { es: 'Casa Algarve' },
        description: { es: 'Villa moderna con piscina y vistas al mar.' },
        category: ProjectCategory.RESIDENTIAL,
        status: ProjectStatus.IN_EXECUTION,
        featured: true,
        showInMenu: true,
        images: [{
          id: 1,
          url: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1920&q=80',
          alt: 'Casa Algarve',
          order: 0,
          isMain: true
        }]
      }
    ];
  }

  /** Texto del titulo en idioma activo (ES como fallback). */
  titleFor(project: Project): string {
    return pickLocale(project.title, this.translate.currentLang || 'es');
  }

  /** Etiqueta i18n de la categoria. */
  categoryLabelFor(project: Project): string {
    if (!project.category) return '';
    return this.translate.instant('PROJECT_CATEGORY_' + project.category);
  }

  getStatusLabel(status: string): string {
    const key = 'PROJECT_STATUS_' + status;
    const translated = this.translate.instant(key);
    return translated === key ? status : translated;
  }

  getProjectImage(project: Project): string {
    if (project.images && project.images.length > 0 && project.images[0]?.url) {
      return project.images[0].url;
    }
    return 'https://via.placeholder.com/80';
  }

  deleteProject(id: number | undefined): void {
    if (!id) return;
    
    if (confirm('¿Estás seguro de eliminar este proyecto?')) {
      this.projectService.delete(id).subscribe({
        next: () => {
          this.loadProjects();
        },
        error: () => {
          alert('Error al eliminar el proyecto');
        }
      });
    }
  }

  toggleFeatured(project: Project): void {
    if (!project.id) return;
    
    const update = { featured: !project.featured };
    this.projectService.update(project.id, update).subscribe({
      next: () => {
        project.featured = !project.featured;
        this.updateCounts();
      },
      error: () => {
        alert('Error al actualizar el proyecto');
      }
    });
  }

  toggleShowInMenu(project: Project): void {
    if (!project.id) return;
    
    const update = { showInMenu: !project.showInMenu };
    this.projectService.update(project.id, update).subscribe({
      next: () => {
        project.showInMenu = !project.showInMenu;
        this.updateCounts();
      },
      error: () => {
        alert('Error al actualizar el proyecto');
      }
    });
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/admin/login']);
  }
}



