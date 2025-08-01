import { Component, OnInit } from '@angular/core';
import { ArchiveDataService } from '../../_services/archive.service';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-archive',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './archive.component.html',
  styleUrl: './archive.component.scss'
})
export class ArchiveComponent implements OnInit {
  archives: any[] = [];
  selectedArchive: any = null;
  isLoading = false;

  constructor(
    private archiveService: ArchiveDataService,
    private http: HttpClient // ✅ add this
  ) {}

  ngOnInit(): void {
    this.isLoading = true;

    this.http.get<any[]>(`${environment.apiUrl}/rooms`).subscribe({
      next: roomsData => {
        this.archiveService.getAllArchives().subscribe({
          next: archivesData => {
            this.archives = archivesData.map(archive => {
              const room = roomsData.find(r => r.id === archive.room_id);
              return {
                ...archive,
                roomNumber: room?.roomNumber || 'N/A',
                roomType: room?.RoomType?.type || 'N/A'
              };
            });
            this.isLoading = false;
          },
          error: err => {
            console.error('Failed to load archives', err);
            this.isLoading = false;
          }
        });
      },
      error: err => {
        console.error('Failed to load rooms', err);
        this.isLoading = false;
      }
    });
  }

  viewDetails(archive: any) {
    this.selectedArchive = archive;
  }

  closeDetails() {
    this.selectedArchive = null;
  }
}