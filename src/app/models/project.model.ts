import { Localized } from '../core/i18n/localized';

export interface Project {
  id?: number;
  title: Localized;
  /**
   * Subtitulo corto opcional. Se usa en el carrusel del home como linea breve
   * debajo del titulo, en lugar de la descripcion completa.
   */
  subtitle?: Localized;
  description: Localized;
  category: ProjectCategory;
  status: ProjectStatus;
  images: ProjectImage[];
  videos?: ProjectVideo[];
  featured?: boolean; // Aparece en el carrusel de la pagina principal
  showInMenu?: boolean; // Aparece en la lista de proyectos
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Item del carrusel configurable de la pagina principal. Apunta a un proyecto
 * existente (projectId) y trae sus datos para mostrarlos sin otra llamada.
 */
export interface CarouselItem {
  id: number;
  projectId: number;
  imageUrl: string;
  grayscale: boolean;
  order: number;
  title: Localized;
  subtitle?: Localized;
  category: ProjectCategory | null;
  status: string;
}

export interface ProjectImage {
  id?: number;
  url: string;
  alt: string;
  order: number;
  isMain: boolean;
}

export interface ProjectVideo {
  id?: number;
  url: string;
  title: Localized;
  description?: Localized;
  order: number;
  isMain: boolean;
}

export enum ProjectStatus {
  IN_EXECUTION = 'IN_EXECUTION',
  LICENSING_PHASE = 'LICENSING_PHASE',
  PREVIOUS_STUDY = 'PREVIOUS_STUDY',
  COMPLETED = 'COMPLETED'
}

export enum ProjectCategory {
  RESIDENTIAL = 'RESIDENTIAL',
  COMMERCIAL = 'COMMERCIAL',
  INSTITUTIONAL = 'INSTITUTIONAL',
  INTERIOR = 'INTERIOR',
  URBANISM = 'URBANISM',
  RENOVATION = 'RENOVATION',
  LANDSCAPE = 'LANDSCAPE',
  COLLABORATION = 'COLLABORATION',
  OTHER = 'OTHER'
}

export const PROJECT_CATEGORIES: ProjectCategory[] = [
  ProjectCategory.RESIDENTIAL,
  ProjectCategory.COMMERCIAL,
  ProjectCategory.INSTITUTIONAL,
  ProjectCategory.INTERIOR,
  ProjectCategory.URBANISM,
  ProjectCategory.RENOVATION,
  ProjectCategory.LANDSCAPE,
  ProjectCategory.COLLABORATION,
  ProjectCategory.OTHER
];

export interface ProjectCreateDto {
  title: Localized;
  subtitle?: Localized;
  description: Localized;
  category: ProjectCategory;
  status: ProjectStatus;
  images: ProjectImageCreateDto[];
  featured?: boolean;
  showInMenu?: boolean;
}

export interface ProjectImageCreateDto {
  url: string;
  alt: string;
  order: number;
  isMain: boolean;
}

export interface ProjectUpdateDto {
  title?: Localized;
  subtitle?: Localized;
  description?: Localized;
  category?: ProjectCategory;
  status?: ProjectStatus;
  images?: ProjectImageCreateDto[];
  featured?: boolean;
  showInMenu?: boolean;
}
