import { Component, AfterViewInit, ElementRef,ViewChild } from '@angular/core';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements AfterViewInit{
  @ViewChild('carouselContainer', {static:false}) carouselContainer!: ElementRef;

  ngAfterViewInit(): void {
    const container = this.carouselContainer.nativeElement as HTMLElement;
    const scrollAmount = 300;

    const nextBnt = document.getElementById('nextBtn');
    const prevBnt = document.getElementById('prevBtn');

    if (nextBnt && prevBnt){
      nextBnt.addEventListener('click', () => {
        container.scrollBy({left:scrollAmount, behavior: 'smooth'});
      });

      prevBnt.addEventListener('click', () => {
        container.scrollBy({left: -scrollAmount, behavior: 'smooth'});
      });
    }

  }

}
