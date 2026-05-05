import { Localized } from '../core/i18n/localized';

export interface Project {
  id?: number;
  title: Localized;
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
  ProjectCategory.OTHER
];

export interface ProjectCreateDto {
  title: Localized;
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
  description?: Localized;
  category?: ProjectCategory;
  status?: ProjectStatus;
  images?: ProjectImageCreateDto[];
  featured?: boolean;
  showInMenu?: boolean;
}
