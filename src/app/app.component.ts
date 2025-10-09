import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ModalContainerComponent } from './_components/modal-container.component';

@Component({
  selector: 'app-root',
  standalone: true, 
  imports: [RouterModule, ModalContainerComponent], 
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'hotel-reservation-app';
}