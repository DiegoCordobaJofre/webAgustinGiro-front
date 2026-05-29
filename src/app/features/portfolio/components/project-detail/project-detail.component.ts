import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ProjectService } from '../../../../core/services/project.service';
import { Project, ProjectCategory, ProjectVideo } from '../../../../models/project.model';
import { pickLocale } from '../../../../core/i18n/localized';

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
  currentVideoIndex = 0;
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
        this.currentVideoIndex = this.pickInitialVideoIndex(project);
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = this.translate.instant('PROJECT_DETAIL_LOAD_ERROR');
        console.error('Error al cargar proyecto:', error);
      }
    });
  }

  /**
   * Arranca por el video marcado como principal si existe, sino por el primero
   * en orden de aparicion. Devuelve 0 si no hay videos.
   */
  private pickInitialVideoIndex(project: Project | null): number {
    if (!project?.videos || project.videos.length === 0) return 0;
    const mainIdx = project.videos.findIndex((v) => v.isMain);
    return mainIdx >= 0 ? mainIdx : 0;
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

  goToVideo(index: number): void {
    this.currentVideoIndex = index;
  }

  /** Video que esta sonando actualmente, o null si el proyecto no tiene videos. */
  get currentVideo(): ProjectVideo | null {
    if (!this.project?.videos || this.project.videos.length === 0) return null;
    return this.project.videos[this.currentVideoIndex] ?? this.project.videos[0];
  }

  /**
   * Imagen de poster para el reproductor: la imagen principal del proyecto (o la primera)
   * para evitar el frame negro inicial cuando aun no se cargo metadata del video.
   */
  get videoPoster(): string | null {
    if (!this.project?.images || this.project.images.length === 0) return null;
    const main = this.project.images.find((img) => img.isMain);
    return (main ?? this.project.images[0]).url;
  }

  /** Etiqueta legible para la lista de videos. Usa el titulo localizado. */
  videoTitleLabel(video: ProjectVideo): string {
    if (!video?.title) return '';
    return pickLocale(video.title, this.translate.currentLang || 'es');
  }

  getStatusLabel(status: string): string {
    const key = STATUS_KEYS[status];
    return key ? this.translate.instant(key) : status;
  }

  /** Etiqueta i18n para la categoria del proyecto. */
  getCategoryLabel(category: ProjectCategory | null | undefined): string {
    if (!category) return '';
    return this.translate.instant('PROJECT_CATEGORY_' + category);
  }

  /** Titulo en idioma activo. */
  get projectTitle(): string {
    return this.project ? pickLocale(this.project.title, this.translate.currentLang || 'es') : '';
  }

  /** Subtitulo corto en idioma activo (puede ser cadena vacia). */
  get projectSubtitle(): string {
    return this.project ? pickLocale(this.project.subtitle, this.translate.currentLang || 'es') : '';
  }

  /** Descripcion en idioma activo. */
  get projectDescription(): string {
    return this.project ? pickLocale(this.project.description, this.translate.currentLang || 'es') : '';
  }
}
