import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ProjectService } from '../../../../core/services/project.service';
import { Project, ProjectCategory } from '../../../../models/project.model';
import { pickLocale } from '../../../../core/i18n/localized';

type ProjectGroup = 'OWN' | 'COLLABORATION';

@Component({
  selector: 'app-projects',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslateModule],
  templateUrl: './projects.component.html',
  styleUrls: ['./projects.component.scss']
})
export class ProjectsComponent implements OnInit {
  projects: Project[] = [];
  isLoading = true;
  selectedGroup: ProjectGroup = 'OWN';

  constructor(
    private projectService: ProjectService,
    private translate: TranslateService
  ) {}

  ngOnInit(): void {
    this.loadProjects();
  }

  private loadProjects(): void {
    this.projectService.getAll().subscribe({
      next: (projects) => {
        this.projects = projects.filter(p => p.showInMenu !== false);
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }

  filterByGroup(group: ProjectGroup): void {
    this.selectedGroup = group;
  }

  getFilteredProjects(): Project[] {
    if (this.selectedGroup === 'COLLABORATION') {
      return this.projects.filter(p => p.category === ProjectCategory.COLLABORATION);
    }
    return this.projects.filter(p => p.category !== ProjectCategory.COLLABORATION);
  }

  /** Titulo del proyecto en idioma activo. */
  titleFor(project: Project): string {
    return pickLocale(project.title, this.translate.currentLang || 'es');
  }

  getMainImage(project: Project): string {
    const mainImage = project.images?.find(img => img.isMain);
    return mainImage?.url || project.images?.[0]?.url || '';
  }
}



