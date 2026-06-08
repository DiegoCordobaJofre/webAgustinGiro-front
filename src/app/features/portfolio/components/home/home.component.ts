import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ProjectService } from '../../../../core/services/project.service';
import { CarouselService } from '../../../../core/services/carousel.service';
import { Project, ProjectCategory } from '../../../../models/project.model';
import { Localized, pickLocale } from '../../../../core/i18n/localized';

interface CarouselProject {
  id: number;
  title: Localized;
  subtitle: Localized;
  category: ProjectCategory | null;
  /**
   * Estado crudo del proyecto (clave de enum: 'IN_EXECUTION', 'COMPLETED', etc.).
   * El template lo traduce con el pipe `| translate` para que reaccione al cambio de idioma.
   * Antes guardabamos aca el label ya traducido y eso cacheaba el idioma original.
   */
  status: string;
  image: string;
  /** Si es true, la imagen se muestra en blanco y negro en el carrusel. */
  grayscale: boolean;
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
  private autoSlideInterval: ReturnType<typeof setInterval> | null = null;
  private touchStartX = 0;
  private touchStartY = 0;
  private readonly swipeThresholdPx = 50;

  constructor(
    private projectService: ProjectService,
    private carouselService: CarouselService,
    private translate: TranslateService
  ) {}

  ngOnInit(): void {
    this.loadCarousel();
  }

  ngOnDestroy(): void {
    this.stopAutoSlide();
  }

  /**
   * Carga el carrusel configurable desde el backend. Si no hay items configurados,
   * cae a los proyectos marcados como destacados (featured) y, en ultimo caso, a
   * los proyectos de ejemplo.
   */
  private loadCarousel(): void {
    this.carouselService.getAll().subscribe({
      next: (items) => {
        if (items.length > 0) {
          this.carouselProjects = items.map((item) => ({
            id: item.projectId,
            title: item.title ?? {},
            subtitle: item.subtitle ?? {},
            category: item.category,
            status: item.status || '',
            image: item.imageUrl,
            grayscale: !!item.grayscale
          }));
          this.isLoading = false;
          this.restartAutoSlide();
        } else {
          this.loadFeaturedProjects();
        }
      },
      error: () => this.loadFeaturedProjects()
    });
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
            subtitle: p.subtitle ?? {},
            category: p.category,
            status: (p.status as string) || '',
            image: this.getMainImage(p) || this.getExampleProjects()[index % 3].image,
            grayscale: false
          }));
        } else {
          this.carouselProjects = this.getExampleProjects();
        }
        this.isLoading = false;
        this.restartAutoSlide();
      },
      error: () => {
        // Si hay error al cargar, usar proyectos de ejemplo
        this.carouselProjects = this.getExampleProjects();
        this.isLoading = false;
        this.restartAutoSlide();
      }
    });
  }

  private getExampleProjects(): CarouselProject[] {
    return [
      {
        id: 1,
        title: { es: 'Casa Algarve' },
        subtitle: { es: 'Villa moderna en Aljezur' },
        category: ProjectCategory.RESIDENTIAL,
        status: 'IN_EXECUTION',
        image: 'https://raw.githubusercontent.com/DiegoCordobaJofre/webAgustinGiro-front/main/src/assets/images/projects/image-1.jpg',
        grayscale: false
      },
      {
        id: 2,
        title: { es: 'Residencia Giró' },
        subtitle: { es: 'Casa tradicional portuguesa renovada' },
        category: ProjectCategory.RESIDENTIAL,
        status: 'COMPLETED',
        image: 'https://raw.githubusercontent.com/DiegoCordobaJofre/webAgustinGiro-front/main/src/assets/images/projects/image-2.jpg',
        grayscale: false
      },
      {
        id: 3,
        title: { es: 'Villa Camila Tyson' },
        subtitle: { es: 'Residencial integrado al paisaje del sur de Portugal' },
        category: ProjectCategory.RESIDENTIAL,
        status: 'IN_EXECUTION',
        image: 'https://raw.githubusercontent.com/DiegoCordobaJofre/webAgustinGiro-front/main/src/assets/images/projects/image-5.jpg',
        grayscale: false
      },
      {
        id: 4,
        title: { es: 'Casa Ostra' },
        subtitle: { es: 'Casa tradicional italiana' },
        category: ProjectCategory.RESIDENTIAL,
        status: 'IN_EXECUTION',
        image: 'https://raw.githubusercontent.com/DiegoCordobaJofre/webAgustinGiro-front/main/src/assets/images/projects/cocina-ostra-1.jpg',
        grayscale: false
      }
    ];
  }

  /** Texto del titulo en el idioma activo (con fallback). */
  titleFor(project: CarouselProject): string {
    return pickLocale(project.title, this.translate.currentLang || 'es');
  }

  /**
   * Subtitulo corto en el idioma activo. Devuelve '' si el proyecto no tiene subtitulo,
   * para que la plantilla pueda ocultarlo con *ngIf.
   */
  subtitleFor(project: CarouselProject): string {
    return pickLocale(project.subtitle, this.translate.currentLang || 'es');
  }

  private initializeCarousel(): void {
    this.stopAutoSlide();
    if (this.carouselProjects.length <= 1) {
      return;
    }
    this.autoSlideInterval = setInterval(() => {
      this.nextSlide(false);
    }, 5000);
  }

  private stopAutoSlide(): void {
    if (this.autoSlideInterval) {
      clearInterval(this.autoSlideInterval);
      this.autoSlideInterval = null;
    }
  }

  /** Reinicia el temporizador tras interaccion manual (swipe, dots). */
  private restartAutoSlide(): void {
    this.stopAutoSlide();
    this.initializeCarousel();
  }

  /**
   * Inicio del gesto tactil. Guardamos coordenadas para detectar swipe horizontal
   * en touchend y pausamos el auto-slide mientras el usuario interactua.
   */
  onTouchStart(event: TouchEvent): void {
    if (event.touches.length !== 1) {
      return;
    }
    this.touchStartX = event.touches[0].clientX;
    this.touchStartY = event.touches[0].clientY;
    this.stopAutoSlide();
  }

  /**
   * Fin del gesto tactil. Swipe izquierda → siguiente slide; derecha → anterior.
   * Ignoramos movimientos verticales (scroll de pagina).
   */
  onTouchEnd(event: TouchEvent): void {
    if (event.changedTouches.length !== 1 || this.carouselProjects.length <= 1) {
      this.restartAutoSlide();
      return;
    }

    const deltaX = event.changedTouches[0].clientX - this.touchStartX;
    const deltaY = event.changedTouches[0].clientY - this.touchStartY;

    if (Math.abs(deltaX) < this.swipeThresholdPx || Math.abs(deltaX) < Math.abs(deltaY)) {
      this.restartAutoSlide();
      return;
    }

    if (deltaX < 0) {
      this.nextSlide(false);
    } else {
      this.previousSlide(false);
    }
    this.restartAutoSlide();
  }

  nextSlide(restartTimer = true): void {
    if (this.carouselProjects.length === 0) {
      return;
    }
    this.currentSlide = (this.currentSlide + 1) % this.carouselProjects.length;
    if (restartTimer) {
      this.restartAutoSlide();
    }
  }

  previousSlide(restartTimer = true): void {
    if (this.carouselProjects.length === 0) {
      return;
    }
    this.currentSlide = this.currentSlide === 0
      ? this.carouselProjects.length - 1
      : this.currentSlide - 1;
    if (restartTimer) {
      this.restartAutoSlide();
    }
  }

  goToSlide(index: number): void {
    this.currentSlide = index;
    this.restartAutoSlide();
  }

  getMainImage(project: Project): string {
    const mainImage = project.images?.find(img => img.isMain);
    return mainImage?.url || project.images?.[0]?.url || '';
  }

}


