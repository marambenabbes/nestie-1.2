import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-pregnancy-timeline',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pregnancy-timeline.component.html',
  styleUrls: ['./pregnancy-timeline.component.scss']
})
export class PregnancyTimelineComponent implements OnChanges {
  @Input() currentWeek: number = 1;
  
  currentMonth: number = 0;
  
  months: string[] = [
    'app/assets/pregnancy/month1.png',
    'app/assets/pregnancy/month2.png',
    'app/assets/pregnancy/month3.png',
    'app/assets/pregnancy/month4.png',
    'app/assets/pregnancy/month5.png',
    'app/assets/pregnancy/month6.png',
    'app/assets/pregnancy/month7.png',
    'app/assets/pregnancy/month8.png',
    'app/assets/pregnancy/month9.png'
  ];

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['currentWeek']) {
      this.updateMonth();
    }
  }

  private updateMonth(): void {
    const month = Math.floor((this.currentWeek - 1) / 4);
    this.currentMonth = Math.max(0, Math.min(month, 8));
  }
}
