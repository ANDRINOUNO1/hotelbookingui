import { Component, OnInit } from '@angular/core';
import { ArchiveDataService } from '../../_services/archive.service';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-archives',
  imports: [CommonModule],
  templateUrl: './archives.component.html',
  styleUrl: './archives.component.scss'
})
export class ArchivesComponent implements OnInit {
  archives: any[] = [];
  selectedArchive: any = null;
  isLoading = false;

  constructor(
    private archiveService: ArchiveDataService,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.isLoading = true;

    // Fetch archives and rooms data separately
    this.archiveService.getAllArchives().subscribe({
      next: archivesData => {
        // Fetch rooms data to get room numbers and types
        this.http.get<any[]>(`${environment.apiUrl}/rooms`).subscribe({
          next: roomsData => {
            // Map archives with room data
            this.archives = archivesData.map(archive => {
              const room = roomsData.find(r => r.id === archive.room_id);
              return {
                ...archive,
                roomNumber: room?.roomNumber || 'N/A',
                roomType: room?.roomType?.type || 'N/A'
              };
            });
            this.isLoading = false;
          },
          error: err => {
            console.error('Failed to load rooms', err);
            // Fallback to archives without room data
            this.archives = archivesData.map(archive => ({
              ...archive,
              roomNumber: 'N/A',
              roomType: 'N/A'
            }));
            this.isLoading = false;
          }
        });
      },
      error: err => {
        console.error('Failed to load archives', err);
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

  formatDate(dateString: string): string {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }
}