import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { ProjectService } from '../../../../core/services/project.service';
import {
  Project,
  ProjectCategory,
  ProjectCreateDto,
  ProjectImage,
  ProjectStatus,
  ProjectUpdateDto,
  ProjectVideo,
  PROJECT_CATEGORIES
} from '../../../../models/project.model';
import { LocalizedInputComponent } from '../../../../shared/components/localized-input/localized-input.component';
import { isLocalizedEmpty, Localized } from '../../../../core/i18n/localized';

interface PendingUpload {
  file: File;
  previewUrl: string;
  isMain: boolean;
  uploading: boolean;
  error?: string;
}

const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/gif'
];
const MAX_IMAGE_BYTES = 10 * 1024 * 1024;

const ALLOWED_VIDEO_TYPES = [
  'video/mp4',
  'video/webm',
  'video/quicktime'
];
const MAX_VIDEO_BYTES = 100 * 1024 * 1024;

@Component({
  selector: 'app-project-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    RouterLink,
    TranslateModule,
    LocalizedInputComponent
  ],
  templateUrl: './project-form.component.html',
  styleUrls: ['./project-form.component.scss']
})
export class ProjectFormComponent implements OnInit, OnDestroy {
  projectForm: FormGroup;
  isEditMode = false;
  projectId: number | null = null;
  isLoading = false;

  // ----- Imagenes -----
  existingImages: ProjectImage[] = [];
  pendingImageUploads: PendingUpload[] = [];
  nextImageUploadIsMain = false;
  isDraggingImage = false;
  imageUploadError = '';

  // ----- Videos -----
  existingVideos: ProjectVideo[] = [];
  pendingVideoUploads: PendingUpload[] = [];
  nextVideoUploadIsMain = false;
  isDraggingVideo = false;
  videoUploadError = '';

  readonly statusOptions = [
    { value: ProjectStatus.IN_EXECUTION, key: 'PROJECT_STATUS_IN_EXECUTION' },
    { value: ProjectStatus.LICENSING_PHASE, key: 'PROJECT_STATUS_LICENSING_PHASE' },
    { value: ProjectStatus.PREVIOUS_STUDY, key: 'PROJECT_STATUS_PREVIOUS_STUDY' },
    { value: ProjectStatus.COMPLETED, key: 'PROJECT_STATUS_COMPLETED' }
  ];

  readonly categoryOptions = PROJECT_CATEGORIES.map((cat) => ({
    value: cat,
    key: 'PROJECT_CATEGORY_' + cat
  }));

  readonly imageAcceptAttr = ALLOWED_IMAGE_TYPES.join(',');
  readonly videoAcceptAttr = ALLOWED_VIDEO_TYPES.join(',');

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private projectService: ProjectService
  ) {
    this.projectForm = this.fb.group({
      title: this.fb.control<Localized>(
        { en: '', es: '', pt: '' },
        { validators: [this.localizedRequiredValidator] }
      ),
      subtitle: this.fb.control<Localized>(
        { en: '', es: '', pt: '' }
      ),
      description: this.fb.control<Localized>(
        { en: '', es: '', pt: '' },
        { validators: [this.localizedRequiredValidator] }
      ),
      category: [ProjectCategory.RESIDENTIAL, [Validators.required]],
      status: [ProjectStatus.IN_EXECUTION, [Validators.required]],
      featured: [false],
      showInMenu: [true]
    });
  }

  /**
   * Validador para Localized: requiere al menos un idioma con texto. El idioma canonico
   * de fallback es ingles (ver FALLBACK_LANG), pero permitimos cargar contenido aunque
   * el ingles este vacio para no romper la edicion de proyectos migrados desde la
   * version monolingue (que tienen solo "es").
   */
  private localizedRequiredValidator = (control: { value: Localized | null | undefined }) => {
    const value = control.value;
    if (!value || isLocalizedEmpty(value)) {
      return { localizedRequired: true };
    }
    return null;
  };

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode = true;
      this.projectId = +id;
      this.loadProject(+id);
    }
  }

  ngOnDestroy(): void {
    this.pendingImageUploads.forEach((p) => URL.revokeObjectURL(p.previewUrl));
    this.pendingVideoUploads.forEach((p) => URL.revokeObjectURL(p.previewUrl));
  }

  private loadProject(id: number): void {
    this.projectService.getById(id).subscribe({
      next: (project) => this.applyProject(project),
      error: () => {
        alert('Error al cargar el proyecto');
        this.router.navigate(['/admin/dashboard']);
      }
    });
  }

  private applyProject(project: Project): void {
    this.projectForm.patchValue({
      title: project.title,
      subtitle: project.subtitle ?? { en: '', es: '', pt: '' },
      description: project.description,
      category: project.category,
      status: project.status,
      featured: project.featured ?? false,
      showInMenu: project.showInMenu ?? true
    });
    this.existingImages = [...(project.images ?? [])].sort(
      (a, b) => (a.order ?? 0) - (b.order ?? 0)
    );
    this.existingVideos = [...(project.videos ?? [])].sort(
      (a, b) => (a.order ?? 0) - (b.order ?? 0)
    );
  }

  // ============================================================
  //                        IMAGENES
  // ============================================================

  onImageDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDraggingImage = true;
  }

  onImageDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDraggingImage = false;
  }

  onImageDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDraggingImage = false;
    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this.handleImageFiles(Array.from(files));
    }
  }

  onImageFileInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.handleImageFiles(Array.from(input.files));
      input.value = '';
    }
  }

  private handleImageFiles(files: File[]): void {
    this.imageUploadError = '';
    const valid: File[] = [];
    for (const file of files) {
      const error = this.validateImageFile(file);
      if (error) {
        this.imageUploadError = `${file.name}: ${error}`;
        continue;
      }
      valid.push(file);
    }
    if (valid.length === 0) return;

    if (this.isEditMode && this.projectId) {
      valid.forEach((file) => this.uploadOneImage(file));
    } else {
      valid.forEach((file) => {
        this.pendingImageUploads.push({
          file,
          previewUrl: URL.createObjectURL(file),
          isMain:
            this.pendingImageUploads.length === 0 &&
            this.existingImages.length === 0,
          uploading: false
        });
      });
    }
  }

  private validateImageFile(file: File): string | null {
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      return 'tipo no permitido (solo JPG, PNG, WEBP, GIF)';
    }
    if (file.size > MAX_IMAGE_BYTES) {
      return 'supera el tamaño maximo de 10 MB';
    }
    return null;
  }

  private uploadOneImage(file: File): void {
    if (!this.projectId) return;
    const pending: PendingUpload = {
      file,
      previewUrl: URL.createObjectURL(file),
      isMain: this.nextImageUploadIsMain,
      uploading: true
    };
    this.pendingImageUploads.push(pending);
    const isMainForThisUpload = this.nextImageUploadIsMain;
    this.nextImageUploadIsMain = false;

    this.projectService
      .uploadImage(this.projectId, file, {
        alt: file.name,
        isMain: isMainForThisUpload
      })
      .subscribe({
        next: (saved) => {
          if (saved.isMain) {
            this.existingImages.forEach((img) => (img.isMain = false));
          }
          this.existingImages.push(saved);
          this.removePending(this.pendingImageUploads, pending);
        },
        error: (err) => {
          pending.uploading = false;
          pending.error = this.extractErrorMessage(err);
        }
      });
  }

  removePendingImage(index: number): void {
    const removed = this.pendingImageUploads.splice(index, 1)[0];
    if (removed) {
      URL.revokeObjectURL(removed.previewUrl);
    }
  }

  setPendingImageMain(index: number): void {
    this.pendingImageUploads.forEach((p, i) => (p.isMain = i === index));
  }

  moveImageUp(index: number): void {
    if (index <= 0) return;
    this.reorderImagesSwap(index, index - 1);
  }

  moveImageDown(index: number): void {
    if (index >= this.existingImages.length - 1) return;
    this.reorderImagesSwap(index, index + 1);
  }

  private reorderImagesSwap(a: number, b: number): void {
    if (!this.projectId) return;
    const reordered = [...this.existingImages];
    [reordered[a], reordered[b]] = [reordered[b], reordered[a]];
    this.existingImages = reordered;
    const orderedIds = reordered
      .map((img) => img.id)
      .filter((id): id is number => id != null);
    this.projectService.reorderImages(this.projectId, orderedIds).subscribe({
      next: (images) => {
        this.existingImages = [...images].sort(
          (x, y) => (x.order ?? 0) - (y.order ?? 0)
        );
      },
      error: () => alert('No se pudo guardar el nuevo orden de imágenes')
    });
  }

  deleteExistingImage(image: ProjectImage): void {
    if (!this.projectId || image.id == null) return;
    if (!confirm('¿Eliminar esta imagen?')) return;
    this.projectService.deleteImage(this.projectId, image.id).subscribe({
      next: () => {
        this.existingImages = this.existingImages.filter(
          (img) => img.id !== image.id
        );
      },
      error: () => alert('No se pudo eliminar la imagen')
    });
  }

  // ============================================================
  //                         VIDEOS
  // ============================================================

  onVideoDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDraggingVideo = true;
  }

  onVideoDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDraggingVideo = false;
  }

  onVideoDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDraggingVideo = false;
    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this.handleVideoFiles(Array.from(files));
    }
  }

  onVideoFileInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.handleVideoFiles(Array.from(input.files));
      input.value = '';
    }
  }

  private handleVideoFiles(files: File[]): void {
    this.videoUploadError = '';
    const valid: File[] = [];
    for (const file of files) {
      const error = this.validateVideoFile(file);
      if (error) {
        this.videoUploadError = `${file.name}: ${error}`;
        continue;
      }
      valid.push(file);
    }
    if (valid.length === 0) return;

    if (this.isEditMode && this.projectId) {
      valid.forEach((file) => this.uploadOneVideo(file));
    } else {
      valid.forEach((file) => {
        this.pendingVideoUploads.push({
          file,
          previewUrl: URL.createObjectURL(file),
          isMain:
            this.pendingVideoUploads.length === 0 &&
            this.existingVideos.length === 0,
          uploading: false
        });
      });
    }
  }

  private validateVideoFile(file: File): string | null {
    if (!ALLOWED_VIDEO_TYPES.includes(file.type)) {
      return 'tipo no permitido (solo MP4, WEBM, MOV)';
    }
    if (file.size > MAX_VIDEO_BYTES) {
      return 'supera el tamaño maximo de 100 MB';
    }
    return null;
  }

  private uploadOneVideo(file: File): void {
    if (!this.projectId) return;
    const pending: PendingUpload = {
      file,
      previewUrl: URL.createObjectURL(file),
      isMain: this.nextVideoUploadIsMain,
      uploading: true
    };
    this.pendingVideoUploads.push(pending);
    const isMainForThisUpload = this.nextVideoUploadIsMain;
    this.nextVideoUploadIsMain = false;

    this.projectService
      .uploadVideo(this.projectId, file, {
        title: file.name,
        isMain: isMainForThisUpload
      })
      .subscribe({
        next: (saved) => {
          if (saved.isMain) {
            this.existingVideos.forEach((v) => (v.isMain = false));
          }
          this.existingVideos.push(saved);
          this.removePending(this.pendingVideoUploads, pending);
        },
        error: (err) => {
          pending.uploading = false;
          pending.error = this.extractErrorMessage(err);
        }
      });
  }

  removePendingVideo(index: number): void {
    const removed = this.pendingVideoUploads.splice(index, 1)[0];
    if (removed) {
      URL.revokeObjectURL(removed.previewUrl);
    }
  }

  setPendingVideoMain(index: number): void {
    this.pendingVideoUploads.forEach((p, i) => (p.isMain = i === index));
  }

  moveVideoUp(index: number): void {
    if (index <= 0) return;
    this.reorderVideosSwap(index, index - 1);
  }

  moveVideoDown(index: number): void {
    if (index >= this.existingVideos.length - 1) return;
    this.reorderVideosSwap(index, index + 1);
  }

  private reorderVideosSwap(a: number, b: number): void {
    if (!this.projectId) return;
    const reordered = [...this.existingVideos];
    [reordered[a], reordered[b]] = [reordered[b], reordered[a]];
    this.existingVideos = reordered;
    const orderedIds = reordered
      .map((v) => v.id)
      .filter((id): id is number => id != null);
    this.projectService.reorderVideos(this.projectId, orderedIds).subscribe({
      next: (videos) => {
        this.existingVideos = [...videos].sort(
          (x, y) => (x.order ?? 0) - (y.order ?? 0)
        );
      },
      error: () => alert('No se pudo guardar el nuevo orden de videos')
    });
  }

  deleteExistingVideo(video: ProjectVideo): void {
    if (!this.projectId || video.id == null) return;
    if (!confirm('¿Eliminar este video?')) return;
    this.projectService.deleteVideo(this.projectId, video.id).subscribe({
      next: () => {
        this.existingVideos = this.existingVideos.filter(
          (v) => v.id !== video.id
        );
      },
      error: () => alert('No se pudo eliminar el video')
    });
  }

  // ============================================================
  //                         GUARDAR
  // ============================================================

  onSubmit(): void {
    if (!this.projectForm.valid) {
      this.projectForm.markAllAsTouched();
      return;
    }
    this.isLoading = true;

    if (this.isEditMode && this.projectId) {
      this.updateProjectMetadata();
    } else {
      this.createProjectAndUploadAll();
    }
  }

  private updateProjectMetadata(): void {
    if (!this.projectId) return;
    const dto: ProjectUpdateDto = this.projectForm.value;
    this.projectService.update(this.projectId, dto).subscribe({
      next: () => this.router.navigate(['/admin/dashboard']),
      error: () => {
        alert('Error al actualizar el proyecto');
        this.isLoading = false;
      }
    });
  }

  private createProjectAndUploadAll(): void {
    const dto: ProjectCreateDto = {
      ...this.projectForm.value,
      images: []
    };
    this.projectService.create(dto).subscribe({
      next: (created) => {
        const newId = created.id;
        if (newId == null) {
          this.router.navigate(['/admin/dashboard']);
          return;
        }
        const totalUploads =
          this.pendingImageUploads.length + this.pendingVideoUploads.length;
        if (totalUploads === 0) {
          this.router.navigate(['/admin/dashboard']);
          return;
        }
        this.uploadAllPending(newId, totalUploads);
      },
      error: () => {
        alert('Error al crear el proyecto');
        this.isLoading = false;
      }
    });
  }

  private uploadAllPending(projectId: number, total: number): void {
    let remaining = total;
    let hadError = false;

    const onDone = () => {
      remaining--;
      if (remaining === 0) {
        if (hadError) {
          alert(
            'Algunos archivos no se pudieron subir. Revisa la lista y reintenta desde la edicion.'
          );
          this.isLoading = false;
          return;
        }
        this.router.navigate(['/admin/dashboard']);
      }
    };

    this.pendingImageUploads.forEach((pending) => {
      pending.uploading = true;
      this.projectService
        .uploadImage(projectId, pending.file, {
          alt: pending.file.name,
          isMain: pending.isMain
        })
        .subscribe({
          next: () => {
            pending.uploading = false;
            onDone();
          },
          error: (err) => {
            pending.uploading = false;
            pending.error = this.extractErrorMessage(err);
            hadError = true;
            onDone();
          }
        });
    });

    this.pendingVideoUploads.forEach((pending) => {
      pending.uploading = true;
      this.projectService
        .uploadVideo(projectId, pending.file, {
          title: pending.file.name,
          isMain: pending.isMain
        })
        .subscribe({
          next: () => {
            pending.uploading = false;
            onDone();
          },
          error: (err) => {
            pending.uploading = false;
            pending.error = this.extractErrorMessage(err);
            hadError = true;
            onDone();
          }
        });
    });
  }

  // ============================================================
  //                         HELPERS
  // ============================================================

  private removePending(list: PendingUpload[], ref: PendingUpload): void {
    const idx = list.indexOf(ref);
    if (idx >= 0) {
      const removed = list.splice(idx, 1)[0];
      URL.revokeObjectURL(removed.previewUrl);
    }
  }

  /**
   * Devuelve el titulo del video en el idioma canonico (ingles), con fallback al primer
   * idioma con valor. Lo usa el grid del admin para mostrar una etiqueta corta sin tabs.
   */
  videoTitleLabel(video: ProjectVideo): string {
    if (!video || !video.title) return '';
    return video.title['en'] || video.title['es'] || video.title['pt'] || '';
  }

  private extractErrorMessage(err: unknown): string {
    if (err && typeof err === 'object') {
      const anyErr = err as { error?: { message?: string }; message?: string };
      return anyErr.error?.message || anyErr.message || 'Error al subir';
    }
    return 'Error al subir';
  }
}
