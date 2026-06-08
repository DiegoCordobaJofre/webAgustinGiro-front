import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { CarouselService } from '../../../../core/services/carousel.service';
import { ProjectService } from '../../../../core/services/project.service';
import { CarouselItem, Project } from '../../../../models/project.model';
import { pickLocale } from '../../../../core/i18n/localized';

const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/gif'
];
const MAX_IMAGE_BYTES = 10 * 1024 * 1024;

@Component({
  selector: 'app-carousel-admin',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, TranslateModule],
  templateUrl: './carousel-admin.component.html',
  styleUrls: ['./carousel-admin.component.scss']
})
export class CarouselAdminComponent implements OnInit {
  items: CarouselItem[] = [];
  projects: Project[] = [];
  isLoading = true;

  // ----- alta de un item nuevo -----
  newProjectId: number | null = null;
  newGrayscale = false;
  newFile: File | null = null;
  newFilePreview: string | null = null;
  creating = false;
  formError = '';

  readonly imageAcceptAttr = ALLOWED_IMAGE_TYPES.join(',');

  constructor(
    private carouselService: CarouselService,
    private projectService: ProjectService,
    private translate: TranslateService
  ) {}

  ngOnInit(): void {
    this.loadAll();
  }

  private loadAll(): void {
    this.isLoading = true;
    this.projectService.getAll().subscribe({
      next: (projects) => {
        this.projects = projects;
        this.loadItems();
      },
      error: () => {
        this.projects = [];
        this.loadItems();
      }
    });
  }

  private loadItems(): void {
    this.carouselService.getAll().subscribe({
      next: (items) => {
        this.items = items;
        this.isLoading = false;
      },
      error: () => {
        this.items = [];
        this.isLoading = false;
      }
    });
  }

  /** Titulo del proyecto en idioma activo, para mostrar en la tabla y el select. */
  titleFor(value: CarouselItem | Project): string {
    return pickLocale(value.title, this.translate.currentLang || 'es');
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] ?? null;
    this.formError = '';
    if (!file) {
      this.clearNewFile();
      return;
    }
    const error = this.validateImageFile(file);
    if (error) {
      this.formError = `${file.name}: ${error}`;
      input.value = '';
      this.clearNewFile();
      return;
    }
    this.clearNewFile();
    this.newFile = file;
    this.newFilePreview = URL.createObjectURL(file);
  }

  private validateImageFile(file: File): string | null {
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      return 'tipo no permitido (solo JPG, PNG, WEBP, GIF)';
    }
    if (file.size > MAX_IMAGE_BYTES) {
      return 'supera el tamaño máximo de 10 MB';
    }
    return null;
  }

  createItem(): void {
    this.formError = '';
    if (this.newProjectId == null) {
      this.formError = 'Elige un proyecto.';
      return;
    }
    if (!this.newFile) {
      this.formError = 'Selecciona una imagen para el carrusel.';
      return;
    }
    this.creating = true;
    this.carouselService.create(this.newFile, this.newProjectId, this.newGrayscale).subscribe({
      next: (created) => {
        this.items = [...this.items, created];
        this.resetNewForm();
        this.creating = false;
      },
      error: () => {
        this.formError = 'No se pudo crear el item del carrusel.';
        this.creating = false;
      }
    });
  }

  toggleGrayscale(item: CarouselItem): void {
    const next = !item.grayscale;
    this.carouselService.update(item.id, { grayscale: next }).subscribe({
      next: (updated) => {
        item.grayscale = updated.grayscale;
      },
      error: () => alert('No se pudo actualizar el item.')
    });
  }

  deleteItem(item: CarouselItem): void {
    if (!confirm('¿Quitar este proyecto del carrusel?')) return;
    this.carouselService.delete(item.id).subscribe({
      next: () => {
        this.items = this.items.filter((i) => i.id !== item.id);
      },
      error: () => alert('No se pudo eliminar el item.')
    });
  }

  moveUp(index: number): void {
    if (index <= 0) return;
    this.swapAndPersist(index, index - 1);
  }

  moveDown(index: number): void {
    if (index >= this.items.length - 1) return;
    this.swapAndPersist(index, index + 1);
  }

  private swapAndPersist(a: number, b: number): void {
    const reordered = [...this.items];
    [reordered[a], reordered[b]] = [reordered[b], reordered[a]];
    this.items = reordered;
    const orderedIds = reordered.map((i) => i.id);
    this.carouselService.reorder(orderedIds).subscribe({
      next: (items) => {
        this.items = items;
      },
      error: () => {
        alert('No se pudo guardar el nuevo orden.');
        this.loadItems();
      }
    });
  }

  private resetNewForm(): void {
    this.newProjectId = null;
    this.newGrayscale = false;
    this.clearNewFile();
  }

  private clearNewFile(): void {
    if (this.newFilePreview) {
      URL.revokeObjectURL(this.newFilePreview);
    }
    this.newFile = null;
    this.newFilePreview = null;
  }
}
