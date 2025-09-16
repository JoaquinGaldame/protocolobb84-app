import { CommonModule } from '@angular/common';
import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
  Renderer2,
  ViewChild
} from '@angular/core';

@Component({
  selector: 'app-text-type',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      #container
      class="inline-block whitespace-pre-wrap tracking-tight"
      [ngClass]="className"
    >
      <span class="inline title" [style.color]="getCurrentTextColor()">
        {{ displayedText }}
      </span>
      <span
        #cursor
        *ngIf="showCursor"
        class="ml-1 inline-block"
        [ngClass]="cursorClassName"
        [class.hidden]="shouldHideCursor"
      >
        {{ cursorCharacter }}
      </span>
    </div>
  `,
  styleUrl: './text-type.css'
})
export class TextTypeComponent implements OnInit, OnDestroy {
  @Input() text: string | string[] = '';
  @Input() typingSpeed = 50;
  @Input() deletingSpeed = 30;
  @Input() pauseDuration = 2000;
  @Input() initialDelay = 0;
  @Input() loop = true;
  @Input() className = '';
  @Input() showCursor = true;
  @Input() hideCursorWhileTyping = false;
  @Input() cursorCharacter: string = '|';
  @Input() cursorClassName = '';
  @Input() cursorBlinkDuration = 0.5; // en segundos
  @Input() textColors: string[] = [];
  @Input() variableSpeed?: { min: number; max: number };
  @Input() startOnVisible = false;
  @Input() reverseMode = false;

  @Output() sentenceComplete = new EventEmitter<{
    sentence: string;
    index: number;
  }>();

  @ViewChild('cursor') cursorRef?: ElementRef;
  @ViewChild('container') containerRef?: ElementRef;

  displayedText = '';
  currentCharIndex = 0;
  isDeleting = false;
  currentTextIndex = 0;
  isVisible = true;

  private timeoutId: any;

  ngOnInit() {
    if (this.startOnVisible && this.containerRef) {
      const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            this.isVisible = true;
            this.startTyping();
            observer.disconnect();
          }
        });
      });
      observer.observe(this.containerRef.nativeElement);
    } else {
      this.startTyping();
    }
  }

  ngOnDestroy() {
    clearTimeout(this.timeoutId);
  }

  private startTyping() {
    if (!this.isVisible) return;

    const textArray = Array.isArray(this.text) ? this.text : [this.text];
    const currentText = textArray[this.currentTextIndex];
    const processedText = this.reverseMode
      ? currentText.split('').reverse().join('')
      : currentText;

    if (this.isDeleting) {
      if (this.displayedText === '') {
        this.isDeleting = false;
        if (this.currentTextIndex === textArray.length - 1 && !this.loop) {
          return;
        }

        this.sentenceComplete.emit({
          sentence: textArray[this.currentTextIndex],
          index: this.currentTextIndex
        });

        this.currentTextIndex = (this.currentTextIndex + 1) % textArray.length;
        this.currentCharIndex = 0;

        this.timeoutId = setTimeout(() => this.startTyping(), this.pauseDuration);
      } else {
        this.timeoutId = setTimeout(() => {
          this.displayedText = this.displayedText.slice(0, -1);
          this.startTyping();
        }, this.deletingSpeed);
      }
    } else {
      if (this.currentCharIndex < processedText.length) {
        const speed = this.variableSpeed
          ? this.getRandomSpeed()
          : this.typingSpeed;

        this.timeoutId = setTimeout(() => {
          this.displayedText += processedText[this.currentCharIndex];
          this.currentCharIndex++;
          this.startTyping();
        }, speed);
      } else if (textArray.length > 1) {
        this.timeoutId = setTimeout(() => {
          this.isDeleting = true;
          this.startTyping();
        }, this.pauseDuration);
      }
    }
  }

  private getRandomSpeed(): number {
    if (!this.variableSpeed) return this.typingSpeed;
    const { min, max } = this.variableSpeed;
    return Math.random() * (max - min) + min;
  }

  getCurrentTextColor(): string {
    if (this.textColors.length === 0) return '#ffffff';
    return this.textColors[this.currentTextIndex % this.textColors.length];
  }

  get shouldHideCursor(): boolean {
    const textArray = Array.isArray(this.text) ? this.text : [this.text];
    return (
      this.hideCursorWhileTyping &&
      (this.currentCharIndex < textArray[this.currentTextIndex].length ||
        this.isDeleting)
    );
  }
}