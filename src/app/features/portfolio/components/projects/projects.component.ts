import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ProjectService } from '../../../../core/services/project.service';
import { Project } from '../../../../models/project.model';

@Component({
  selector: 'app-projects',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './projects.component.html',
  styleUrls: ['./projects.component.scss']
})
export class ProjectsComponent implements OnInit {
  projects: Project[] = [];
  isLoading = true;
  selectedCategory: string | null = null;
  categories: string[] = [];

  constructor(private projectService: ProjectService) {}

  ngOnInit(): void {
    this.loadProjects();
  }

  private loadProjects(): void {
    this.projectService.getAll().subscribe({
      next: (projects) => {
        // Filtrar solo proyectos que deben mostrarse en el menú
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
    const statusMap: { [key: string]: string } = {
      'IN_EXECUTION': 'En ejecución',
      'LICENSING_PHASE': 'Fase Licenciamiento',
      'PREVIOUS_STUDY': 'Fase Estudio-Previo',
      'COMPLETED': 'Completado'
    };
    return statusMap[status] || status;
  }

  getMainImage(project: Project): string {
    const mainImage = project.images?.find(img => img.isMain);
    return mainImage?.url || project.images?.[0]?.url || '';
  }
}



