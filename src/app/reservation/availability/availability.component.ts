import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReservationDataService } from '../../_services/reservation-data.service';
import { ROOMS, ROOM_TYPES } from '../../_models/entities';
import { RoomType } from '../../_models/booking.model';

@Component({
  selector: 'app-availability',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './availability.component.html',
  styleUrls: ['./availability.component.scss']
})
export class AvailabilityComponent implements OnInit {
  @Output() next = new EventEmitter<RoomType>();
  @Output() back = new EventEmitter<void>();


  availableRoomTypes: RoomType[] = [];

  constructor(private reservationDataService: ReservationDataService) {}

  ngOnInit() {
    this.availableRoomTypes = ROOM_TYPES.filter(type =>
      ROOMS.some(room => room.status && room.room_type_id === type.id)
    );
  }

  selectRoomType(roomType: RoomType) {
    this.reservationDataService.setSelectedRoomType(roomType);
    this.next.emit(roomType);
  }
}
