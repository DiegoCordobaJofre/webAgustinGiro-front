import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ProjectService } from '../../../../core/services/project.service';
import { Project, ProjectCategory } from '../../../../models/project.model';
import { Localized, pickLocale } from '../../../../core/i18n/localized';

const STATUS_KEYS: { [key: string]: string } = {
  'IN_EXECUTION': 'STATUS_IN_EXECUTION',
  'LICENSING_PHASE': 'STATUS_LICENSING_PHASE',
  'PREVIOUS_STUDY': 'STATUS_PREVIOUS_STUDY',
  'COMPLETED': 'STATUS_COMPLETED'
};

interface CarouselProject {
  id: number;
  title: Localized;
  description: Localized;
  category: ProjectCategory | null;
  status: string;
  image: string;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslateModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit, OnDestroy {
  featuredProjects: Project[] = [];
  carouselProjects: CarouselProject[] = [];
  currentSlide = 0;
  isLoading = true;
  private autoSlideInterval: any;

  constructor(
    private projectService: ProjectService,
    private translate: TranslateService
  ) {}

  ngOnInit(): void {
    this.loadFeaturedProjects();
    this.initializeCarousel();
  }

  ngOnDestroy(): void {
    if (this.autoSlideInterval) {
      clearInterval(this.autoSlideInterval);
    }
  }

  private loadFeaturedProjects(): void {
    this.projectService.getAll().subscribe({
      next: (projects) => {
        this.featuredProjects = projects;
        // Filtrar solo proyectos destacados (featured)
        const featuredProjects = projects.filter(p => p.featured);

        if (featuredProjects.length > 0) {
          this.carouselProjects = featuredProjects.slice(0, 5).map((p, index) => ({
            id: p.id || index + 1,
            title: p.title,
            description: p.description,
            category: p.category,
            status: this.getStatusLabel(p.status as string),
            image: this.getMainImage(p) || this.getExampleProjects()[index % 3].image
          }));
        } else {
          this.carouselProjects = this.getExampleProjects();
        }
        this.isLoading = false;
      },
      error: () => {
        // Si hay error al cargar, usar proyectos de ejemplo
        this.carouselProjects = this.getExampleProjects();
        this.isLoading = false;
      }
    });
  }

  private getExampleProjects(): CarouselProject[] {
    return [
      {
        id: 1,
        title: { es: 'Casa Algarve' },
        description: { es: 'Villa moderna. Diseño contemporáneo que integra espacios interiores y exteriores.' },
        category: ProjectCategory.RESIDENTIAL,
        status: this.getStatusLabel('IN_EXECUTION'),
        image: 'https://raw.githubusercontent.com/DiegoCordobaJofre/webAgustinGiro-front/main/src/assets/images/projects/image-1.jpg'
      },
      {
        id: 2,
        title: { es: 'Residencia Giró' },
        description: { es: 'Casa tradicional portuguesa renovada con materiales locales. Patio interior y azulejos característicos del Algarve.' },
        category: ProjectCategory.RESIDENTIAL,
        status: this.getStatusLabel('COMPLETED'),
        image: 'https://raw.githubusercontent.com/DiegoCordobaJofre/webAgustinGiro-front/main/src/assets/images/projects/image-2.jpg'
      },
      {
        id: 3,
        title: { es: 'Villa Camila Tyson' },
        description: { es: 'Proyecto residencial con materiales locales. Integración con el paisaje natural del sur de Portugal.' },
        category: ProjectCategory.RESIDENTIAL,
        status: this.getStatusLabel('IN_EXECUTION'),
        image: 'https://raw.githubusercontent.com/DiegoCordobaJofre/webAgustinGiro-front/main/src/assets/images/projects/image-5.jpg'
      },
      {
        id: 4,
        title: { es: 'Casa Ostra' },
        description: { es: 'Casa tradicional italiana.' },
        category: ProjectCategory.RESIDENTIAL,
        status: this.getStatusLabel('IN_EXECUTION'),
        image: 'https://raw.githubusercontent.com/DiegoCordobaJofre/webAgustinGiro-front/main/src/assets/images/projects/cocina-ostra-1.jpg'
      }
    ];
  }

  /** Texto del titulo en el idioma activo (con fallback a ES). */
  titleFor(project: CarouselProject): string {
    return pickLocale(project.title, this.translate.currentLang || 'es');
  }

  /** Texto de la descripcion en el idioma activo (con fallback a ES). */
  descriptionFor(project: CarouselProject): string {
    return pickLocale(project.description, this.translate.currentLang || 'es');
  }

  /** Etiqueta traducida de la categoria (PROJECT_CATEGORY_*). */
  categoryLabelFor(project: CarouselProject): string {
    if (!project.category) return '';
    const key = 'PROJECT_CATEGORY_' + project.category;
    return this.translate.instant(key);
  }

  private initializeCarousel(): void {
    // Auto-slide cada 5 segundos
    this.autoSlideInterval = setInterval(() => {
      this.nextSlide();
    }, 5000);
  }

  nextSlide(): void {
    this.currentSlide = (this.currentSlide + 1) % this.carouselProjects.length;
  }

  previousSlide(): void {
    this.currentSlide = this.currentSlide === 0
      ? this.carouselProjects.length - 1
      : this.currentSlide - 1;
  }

  goToSlide(index: number): void {
    this.currentSlide = index;
    // Reiniciar el auto-slide
    if (this.autoSlideInterval) {
      clearInterval(this.autoSlideInterval);
    }
    this.initializeCarousel();
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


