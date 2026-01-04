import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ProjectService } from '../../../../core/services/project.service';
import { Project, ProjectStatus } from '../../../../models/project.model';

interface CarouselProject {
  id: number;
  title: string;
  description: string;
  category: string;
  status: string;
  image: string;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit, OnDestroy {
  featuredProjects: Project[] = [];
  carouselProjects: CarouselProject[] = [];
  currentSlide = 0;
  isLoading = true;
  private autoSlideInterval: any;

  constructor(private projectService: ProjectService) { }

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
          // Usar proyectos reales del backend que estén marcados como featured
          this.carouselProjects = featuredProjects.slice(0, 5).map((p, index) => ({
            id: p.id || index + 1,
            title: p.title,
            description: p.description,
            category: p.category,
            status: this.getStatusLabel(p.status),
            image: this.getMainImage(p) || this.getExampleProjects()[index % 3].image
          }));
        } else {
          // Proyectos de ejemplo con imágenes de casas
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
        title: 'Casa Algarve',
        description: 'Villa moderna. Diseño contemporáneo que integra espacios interiores y exteriores.',
        category: 'Arquitectura',
        status: 'En ejecución',
        image: 'https://raw.githubusercontent.com/DiegoCordobaJofre/webAgustinGiro-front/main/src/assets/images/projects/image-1.jpg'
      },
      {
        id: 2,
        title: 'Residencia Giró',
        description: 'Casa tradicional portuguesa renovada con materiales locales. Patio interior y azulejos característicos del Algarve.',
        category: 'Arquitectura',
        status: 'Completado',
        image: 'https://raw.githubusercontent.com/DiegoCordobaJofre/webAgustinGiro-front/main/src/assets/images/projects/image-2.jpg',
      },
      {
        id: 3,
        title: 'Villa Camila Tyson',
        description: 'Proyecto residencial con materiales locales. Integración con el paisaje natural del sur de Portugal.',
        category: 'Arquitectura',
        status: 'En ejecución',
        image: 'https://raw.githubusercontent.com/DiegoCordobaJofre/webAgustinGiro-front/main/src/assets/images/projects/image-5.jpg'
      },
      {
        id: 4,
        title: 'Casa Ostra',
        description: 'Casa tradicional italiana.',
        category: 'Arquitectura',
        status: 'En ejecución',
        image: 'https://raw.githubusercontent.com/DiegoCordobaJofre/webAgustinGiro-front/main/src/assets/images/projects/cocina-ostra-1.jpg'
      },
    ];
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


