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
import { ProjectService } from '../../../../core/services/project.service';
import {
  Project,
  ProjectCreateDto,
  ProjectImage,
  ProjectStatus,
  ProjectUpdateDto
} from '../../../../models/project.model';

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

@Component({
  selector: 'app-project-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, RouterLink],
  templateUrl: './project-form.component.html',
  styleUrls: ['./project-form.component.scss']
})
export class ProjectFormComponent implements OnInit, OnDestroy {
  projectForm: FormGroup;
  isEditMode = false;
  projectId: number | null = null;
  isLoading = false;

  /** Imagenes ya guardadas en el backend (solo en modo edicion). */
  existingImages: ProjectImage[] = [];

  /** Archivos seleccionados en modo creacion, todavia sin subir. */
  pendingUploads: PendingUpload[] = [];

  /** En modo edicion, marca para que la proxima subida sea la principal. */
  nextUploadIsMain = false;

  isDragging = false;
  uploadError = '';

  statusOptions = [
    { value: ProjectStatus.IN_EXECUTION, label: 'En ejecución' },
    { value: ProjectStatus.LICENSING_PHASE, label: 'Fase Licenciamiento' },
    { value: ProjectStatus.PREVIOUS_STUDY, label: 'Fase Estudio-Previo' },
    { value: ProjectStatus.COMPLETED, label: 'Completado' }
  ];

  readonly acceptAttr = ALLOWED_IMAGE_TYPES.join(',');

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private projectService: ProjectService
  ) {
    this.projectForm = this.fb.group({
      title: ['', [Validators.required]],
      description: ['', [Validators.required]],
      category: ['', [Validators.required]],
      status: [ProjectStatus.IN_EXECUTION, [Validators.required]],
      featured: [false],
      showInMenu: [true]
    });
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode = true;
      this.projectId = +id;
      this.loadProject(+id);
    }
  }

  ngOnDestroy(): void {
    this.pendingUploads.forEach((p) => URL.revokeObjectURL(p.previewUrl));
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
      description: project.description,
      category: project.category,
      status: project.status,
      featured: project.featured ?? false,
      showInMenu: project.showInMenu ?? true
    });
    this.existingImages = [...(project.images ?? [])].sort(
      (a, b) => (a.order ?? 0) - (b.order ?? 0)
    );
  }

  // ---------- Drag and drop ----------

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;
    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this.handleFiles(Array.from(files));
    }
  }

  onFileInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.handleFiles(Array.from(input.files));
      input.value = '';
    }
  }

  private handleFiles(files: File[]): void {
    this.uploadError = '';
    const validFiles: File[] = [];
    for (const file of files) {
      const error = this.validateFile(file);
      if (error) {
        this.uploadError = `${file.name}: ${error}`;
        continue;
      }
      validFiles.push(file);
    }

    if (validFiles.length === 0) {
      return;
    }

    if (this.isEditMode && this.projectId) {
      this.uploadFilesImmediately(validFiles);
    } else {
      this.queuePendingFiles(validFiles);
    }
  }

  private validateFile(file: File): string | null {
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      return 'tipo no permitido (solo JPG, PNG, WEBP, GIF)';
    }
    if (file.size > MAX_IMAGE_BYTES) {
      return 'supera el tamaño maximo de 10 MB';
    }
    return null;
  }

  // ---------- Modo creacion: cola en memoria ----------

  private queuePendingFiles(files: File[]): void {
    files.forEach((file) => {
      this.pendingUploads.push({
        file,
        previewUrl: URL.createObjectURL(file),
        isMain: this.pendingUploads.length === 0 && this.existingImages.length === 0,
        uploading: false
      });
    });
  }

  removePendingUpload(index: number): void {
    const removed = this.pendingUploads.splice(index, 1)[0];
    if (removed) {
      URL.revokeObjectURL(removed.previewUrl);
    }
  }

  setPendingMain(index: number): void {
    this.pendingUploads.forEach((p, i) => (p.isMain = i === index));
  }

  // ---------- Modo edicion: upload inmediato ----------

  private uploadFilesImmediately(files: File[]): void {
    if (!this.projectId) {
      return;
    }
    files.forEach((file) => this.uploadOne(file));
  }

  private uploadOne(file: File): void {
    if (!this.projectId) {
      return;
    }
    const previewUrl = URL.createObjectURL(file);
    const pending: PendingUpload = {
      file,
      previewUrl,
      isMain: this.nextUploadIsMain,
      uploading: true
    };
    this.pendingUploads.push(pending);
    const isMainForThisUpload = this.nextUploadIsMain;
    this.nextUploadIsMain = false;

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
          this.removePendingByRef(pending);
        },
        error: (err) => {
          pending.uploading = false;
          pending.error = this.extractErrorMessage(err);
        }
      });
  }

  private removePendingByRef(ref: PendingUpload): void {
    const idx = this.pendingUploads.indexOf(ref);
    if (idx >= 0) {
      const removed = this.pendingUploads.splice(idx, 1)[0];
      URL.revokeObjectURL(removed.previewUrl);
    }
  }

  // ---------- Eliminar imagen existente ----------

  deleteExistingImage(image: ProjectImage): void {
    if (!this.projectId || image.id == null) {
      return;
    }
    if (!confirm('¿Eliminar esta imagen?')) {
      return;
    }
    this.projectService.deleteImage(this.projectId, image.id).subscribe({
      next: () => {
        this.existingImages = this.existingImages.filter(
          (img) => img.id !== image.id
        );
      },
      error: () => alert('No se pudo eliminar la imagen')
    });
  }

  // ---------- Guardar metadata ----------

  onSubmit(): void {
    if (!this.projectForm.valid) {
      this.projectForm.markAllAsTouched();
      return;
    }
    this.isLoading = true;

    if (this.isEditMode && this.projectId) {
      this.updateProjectMetadata();
    } else {
      this.createProjectAndUpload();
    }
  }

  private updateProjectMetadata(): void {
    if (!this.projectId) {
      return;
    }
    const dto: ProjectUpdateDto = this.projectForm.value;
    this.projectService.update(this.projectId, dto).subscribe({
      next: () => this.router.navigate(['/admin/dashboard']),
      error: () => {
        alert('Error al actualizar el proyecto');
        this.isLoading = false;
      }
    });
  }

  private createProjectAndUpload(): void {
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
        if (this.pendingUploads.length === 0) {
          this.router.navigate(['/admin/dashboard']);
          return;
        }
        this.uploadAllPending(newId);
      },
      error: () => {
        alert('Error al crear el proyecto');
        this.isLoading = false;
      }
    });
  }

  private uploadAllPending(projectId: number): void {
    let remaining = this.pendingUploads.length;
    let hadError = false;

    this.pendingUploads.forEach((pending) => {
      pending.uploading = true;
      this.projectService
        .uploadImage(projectId, pending.file, {
          alt: pending.file.name,
          isMain: pending.isMain
        })
        .subscribe({
          next: () => {
            pending.uploading = false;
            remaining--;
            if (remaining === 0) {
              this.finishCreate(hadError);
            }
          },
          error: (err) => {
            pending.uploading = false;
            pending.error = this.extractErrorMessage(err);
            hadError = true;
            remaining--;
            if (remaining === 0) {
              this.finishCreate(hadError);
            }
          }
        });
    });
  }

  private finishCreate(hadError: boolean): void {
    if (hadError) {
      alert('Algunas imagenes no se pudieron subir. Revisa la lista y reintenta desde la edicion.');
      this.isLoading = false;
      return;
    }
    this.router.navigate(['/admin/dashboard']);
  }

  private extractErrorMessage(err: unknown): string {
    if (err && typeof err === 'object') {
      const anyErr = err as { error?: { message?: string }; message?: string };
      return anyErr.error?.message || anyErr.message || 'Error al subir';
    }
    return 'Error al subir';
  }
}
