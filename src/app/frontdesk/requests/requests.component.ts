import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { RequestService, Request } from '../../_services/requests.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-requests',
  imports: [CommonModule, FormsModule],
  templateUrl: './requests.component.html',
  styleUrl: './requests.component.scss'
})
export class RequestsComponent implements OnInit {
@Input() bookingId!: number;

  requests: Request[] = [];
  newRequest: Request = { 
    booking_id: 0, 
    type: 'meal', 
    description: '',
    extra_bed_size: 'single',
    food_options: '',
    parking_space: 'none',
    quantity: 1
  };

  constructor(private requestService: RequestService, private route: ActivatedRoute) {}

  ngOnInit() {
    // If input not provided, try from query param (?bookingId=123)
    if (!this.bookingId) {
      const paramId = Number(this.route.snapshot.queryParamMap.get('bookingId'));
      if (paramId) this.bookingId = paramId;
    }

    if (this.bookingId) {
      this.loadRequests();
      this.newRequest.booking_id = this.bookingId;
    }
  }

  loadRequests() {
    this.requestService.getRequestsByBooking(this.bookingId).subscribe({
      next: (res) => this.requests = res,
      error: (err) => console.error('Error loading requests:', err)
    });
  }

  addRequest() {
    if (!this.newRequest.type) return;

    this.requestService.createRequest(this.newRequest).subscribe({
      next: (res) => {
        this.requests.push(res);
        this.newRequest = { 
          booking_id: this.bookingId, 
          type: 'meal', 
          description: '',
          extra_bed_size: 'single',
          food_options: '',
          parking_space: 'none',
          quantity: 1
        };
      },
      error: (err) => console.error('Error creating request:', err)
    });
  }

  markCompleted(id: number) {
    this.requestService.updateRequest(id, { status: 'completed' }).subscribe({
      next: (res) => {
        const idx = this.requests.findIndex(r => r.id === id);
        if (idx > -1) this.requests[idx] = res;
      },
      error: (err) => console.error('Error updating request:', err)
    });
  }
}