import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ProjectService } from '../../../../core/services/project.service';
import { Project } from '../../../../models/project.model';

const STATUS_KEYS: { [key: string]: string } = {
  'IN_EXECUTION': 'STATUS_IN_EXECUTION',
  'LICENSING_PHASE': 'STATUS_LICENSING_PHASE',
  'PREVIOUS_STUDY': 'STATUS_PREVIOUS_STUDY',
  'COMPLETED': 'STATUS_COMPLETED'
};

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
  selectedCategory: string | null = null;
  categories: string[] = [];

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
        this.categories = [...new Set(this.projects.map(p => p.category))];
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }

  filterByCategory(category: string | null): void {
    this.selectedCategory = category;
  }

  getFilteredProjects(): Project[] {
    if (!this.selectedCategory) {
      return this.projects;
    }
    return this.projects.filter(p => p.category === this.selectedCategory);
  }

  getStatusLabel(status: string): string {
    const key = STATUS_KEYS[status];
    return key ? this.translate.instant(key) : status;
  }

  getMainImage(project: Project): string {
    const mainImage = project.images?.find(img => img.isMain);
    return mainImage?.url || project.images?.[0]?.url || '';
  }
}



