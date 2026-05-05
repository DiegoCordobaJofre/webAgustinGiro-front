import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  forwardRef
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import {
  Localized,
  SUPPORTED_LANGS,
  SupportedLang,
  FALLBACK_LANG
} from '../../../core/i18n/localized';
import { TranslationService } from '../../../core/services/translation.service';

/**
 * Editor de strings traducibles. Renderiza tabs por idioma y, si DeepL esta
 * habilitado en el server, ofrece un boton "Auto-traducir" que rellena los
 * idiomas restantes desde el idioma de origen (por defecto "es").
 *
 * Uso (reactive forms):
 *   <app-localized-input formControlName="title"></app-localized-input>
 */
@Component({
  selector: 'app-localized-input',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  templateUrl: './localized-input.component.html',
  styleUrls: ['./localized-input.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => LocalizedInputComponent),
      multi: true
    }
  ]
})
export class LocalizedInputComponent implements ControlValueAccessor, OnInit {
  @Input() label = '';
  @Input() placeholder = '';
  @Input() multiline = false;
  @Input() rows = 5;
  @Input() required = false;
  @Input() sourceLang: SupportedLang = FALLBACK_LANG;

  @Output() valueChange = new EventEmitter<Localized>();

  readonly langs = SUPPORTED_LANGS;
  readonly langLabels: Record<SupportedLang, string> = {
    es: 'Español',
    en: 'English',
    pt: 'Português'
  };

  activeLang: SupportedLang = FALLBACK_LANG;
  value: Localized = { en: '', es: '', pt: '' };

  translationsEnabled = false;
  isTranslating = false;
  translationError = '';

  disabled = false;

  private onChange: (value: Localized) => void = () => {};
  private onTouched: () => void = () => {};

  constructor(private translation: TranslationService) {}

  ngOnInit(): void {
    this.translation.status().subscribe({
      next: (s) => (this.translationsEnabled = !!s.enabled),
      error: () => (this.translationsEnabled = false)
    });
  }

  writeValue(value: Localized | null | undefined): void {
    const normalized: Localized = { en: '', es: '', pt: '' };
    if (value && typeof value === 'object') {
      for (const lang of this.langs) {
        if (typeof value[lang] === 'string') {
          normalized[lang] = value[lang];
        }
      }
    }
    this.value = normalized;
  }

  registerOnChange(fn: (value: Localized) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState?(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  setLang(lang: SupportedLang): void {
    this.activeLang = lang;
  }

  onInput(lang: SupportedLang, raw: string): void {
    this.value = { ...this.value, [lang]: raw };
    this.onChange(this.value);
    this.valueChange.emit(this.value);
    this.onTouched();
  }

  isLangFilled(lang: SupportedLang): boolean {
    return !!this.value[lang] && this.value[lang].trim().length > 0;
  }

  autoTranslate(): void {
    const sourceText = (this.value[this.sourceLang] || '').trim();
    if (!sourceText) {
      this.translationError = 'Escribe primero el texto en ' + this.langLabels[this.sourceLang] + '.';
      return;
    }
    const targets = this.langs.filter((l) => l !== this.sourceLang);
    this.isTranslating = true;
    this.translationError = '';
    this.translation.translate(sourceText, this.sourceLang, targets).subscribe({
      next: (resp) => {
        const next: Localized = { ...this.value };
        let appliedAny = false;
        for (const lang of targets) {
          const translated = resp.translations?.[lang];
          if (translated && translated.trim()) {
            next[lang] = translated;
            appliedAny = true;
          }
        }
        if (!appliedAny) {
          this.translationError = 'No se obtuvieron traducciones. Revisa la API key de DeepL.';
        } else {
          this.value = next;
          this.onChange(this.value);
          this.valueChange.emit(this.value);
        }
        this.isTranslating = false;
      },
      error: () => {
        this.isTranslating = false;
        this.translationError = 'No se pudo conectar con el servicio de traducción.';
      }
    });
  }
}
