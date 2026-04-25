import { Component, signal, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('clubit-front');
  private translate = inject(TranslateService);

  constructor() {
    this.translate.addLangs(['en-US', 'es-CL', 'es-AR']);
    this.translate.setFallbackLang('en-CL');
    this.translate.use('es-CL');
  }
}
