import { Component } from '@angular/core';

@Component({
  selector: 'app-success-full',
  templateUrl: './success-full.component.html',
  styleUrls: ['./success-full.component.css']
})
export class SuccessFullComponent {

  closeBox(): void {
    const welcomeBox = document.querySelector('.welcome-box') as HTMLElement;
    if (welcomeBox) {
      welcomeBox.style.display = 'none';
    }
  }

}
