import { Component } from '@angular/core';
import { RouterModule } from '@angular/router'; // <-- Add this

@Component({
  selector: 'app-root',
  standalone: true, // <-- Should be true for standalone
  imports: [RouterModule], // <-- Add this line
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'hotel-reservation-app';
}