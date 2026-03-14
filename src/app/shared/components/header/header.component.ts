import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

const LANG_STORAGE_KEY = 'agustin-giro-lang';
const SUPPORTED_LANGS = ['es', 'en', 'pt'] as const;

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslateModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit, OnDestroy {
  isMenuOpen = false;
  isLangOpen = false;
  logoExists = true;
  currentLang: string = 'es';
  currentLangLabel = '';
  private langLabels: { [key: string]: string } = {
    es: 'Español',
    en: 'English',
    pt: 'Português'
  };
  private clickOutsideListener?: (e: MouseEvent) => void;

  constructor(private translate: TranslateService) {}

  ngOnInit(): void {
    const saved = localStorage.getItem(LANG_STORAGE_KEY);
    const lang = saved && SUPPORTED_LANGS.includes(saved as any) ? saved : 'es';
    this.currentLang = lang;
    this.translate.use(lang);
    this.updateLangLabel();
    this.translate.onLangChange.subscribe(() => this.updateLangLabel());
  }

  ngOnDestroy(): void {
    this.removeClickOutsideListener();
  }

  private updateLangLabel(): void {
    this.currentLangLabel = this.langLabels[this.currentLang] ?? this.currentLang;
  }

  toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
  }

  closeMenu(): void {
    this.isMenuOpen = false;
  }

  toggleLang(): void {
    this.isLangOpen = !this.isLangOpen;
    if (this.isLangOpen) {
      this.addClickOutsideListener();
    } else {
      this.removeClickOutsideListener();
    }
  }

  setLang(lang: string): void {
    if (!SUPPORTED_LANGS.includes(lang as any)) return;
    this.currentLang = lang;
    this.translate.use(lang);
    localStorage.setItem(LANG_STORAGE_KEY, lang);
    this.isLangOpen = false;
    this.removeClickOutsideListener();
  }

  private addClickOutsideListener(): void {
    this.clickOutsideListener = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest('.nav__lang')) return;
      this.isLangOpen = false;
      this.removeClickOutsideListener();
    };
    setTimeout(() => document.addEventListener('click', this.clickOutsideListener!));
  }

  private removeClickOutsideListener(): void {
    if (this.clickOutsideListener) {
      document.removeEventListener('click', this.clickOutsideListener);
      this.clickOutsideListener = undefined;
    }
  }
}


