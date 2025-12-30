import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { ProjectService } from '../../../../core/services/project.service';
import { Project } from '../../../../models/project.model';

@Component({
  selector: 'app-project-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './project-detail.component.html',
  styleUrls: ['./project-detail.component.scss']
})
export class ProjectDetailComponent implements OnInit {
  project: Project | null = null;
  isLoading = true;
  currentImageIndex = 0;

  constructor(
    private route: ActivatedRoute,
    private projectService: ProjectService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadProject(+id);
    }
  }

  private loadProject(id: number): void {
    this.projectService.getById(id).subscribe({
      next: (project) => {
        this.project = project;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }

  nextImage(): void {
    if (this.project?.images && this.project.images.length > 0) {
      this.currentImageIndex = (this.currentImageIndex + 1) % this.project.images.length;
    }
  }

  previousImage(): void {
    if (this.project?.images && this.project.images.length > 0) {
      this.currentImageIndex = this.currentImageIndex === 0 
        ? this.project.images.length - 1 
        : this.currentImageIndex - 1;
    }
  }

  goToImage(index: number): void {
    this.currentImageIndex = index;
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
}


