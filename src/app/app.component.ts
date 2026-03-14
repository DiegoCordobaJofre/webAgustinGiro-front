import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { HeaderComponent } from './shared/components/header/header.component';
import { FooterComponent } from './shared/components/footer/footer.component';

const LANG_STORAGE_KEY = 'agustin-giro-lang';
const SUPPORTED = ['es', 'en', 'pt'];

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, HeaderComponent, FooterComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'Agustín Giró - Arquitecto';

  constructor(private translate: TranslateService) {}

  ngOnInit(): void {
    const saved = localStorage.getItem(LANG_STORAGE_KEY);
    const lang = saved && SUPPORTED.includes(saved) ? saved : 'es';
    this.translate.use(lang);
  }
}








