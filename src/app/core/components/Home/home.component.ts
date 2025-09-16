import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FieldsetModule } from 'primeng/fieldset';
import { AuroraComponent } from '../../common/aurora/aurora.component';
import { TextTypeComponent } from '../../common/text-type/text-type.component';

@Component({
  selector: 'app-home',
  imports: [AuroraComponent, TextTypeComponent, FieldsetModule],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class Home {
  constructor(private router: Router) {}

  navigateToSimulator() {
    this.router.navigate(['/bb84-simulator']);
  }

  navigateToCode() {
    this.router.navigate(['/code-view']);
  }


  onSentenceDone(event: { sentence: string; index: number }) {
    console.log('Frase completada:', event);
  }
}
