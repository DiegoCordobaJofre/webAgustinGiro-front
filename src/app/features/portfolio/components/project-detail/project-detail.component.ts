import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
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
  selector: 'app-project-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslateModule],
  templateUrl: './project-detail.component.html',
  styleUrls: ['./project-detail.component.scss']
})
export class ProjectDetailComponent implements OnInit {
  project: Project | null = null;
  isLoading = true;
  currentImageIndex = 0;
  errorMessage = '';

  constructor(
    private route: ActivatedRoute,
    private projectService: ProjectService,
    private translate: TranslateService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadProject(+id);
    } else {
      this.isLoading = false;
      this.errorMessage = this.translate.instant('PROJECT_DETAIL_INVALID_ID');
    }
  }

  private loadProject(id: number): void {
    this.projectService.getById(id).subscribe({
      next: (project) => {
        this.project = project;
        this.isLoading = false;
        this.errorMessage = '';
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = this.translate.instant('PROJECT_DETAIL_LOAD_ERROR');
        console.error('Error al cargar proyecto:', error);
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
    const key = STATUS_KEYS[status];
    return key ? this.translate.instant(key) : status;
  }
}







