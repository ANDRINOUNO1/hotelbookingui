import { Component, OnInit } from '@angular/core';
import { ArchiveDataService } from '../../_services/archive.service';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-archive',
  imports: [CommonModule],
  templateUrl: './archive.component.html',
  styleUrl: './archive.component.scss'
})
export class ArchiveComponent implements OnInit {
  archives: any[] = [];
  selectedArchive: any = null;

  constructor(private archiveService: ArchiveDataService) {}

  ngOnInit(): void {
    this.archiveService.getAllArchives().subscribe({
      next: data => {
        this.archives = data;
      },
      error: err => console.error('Failed to load archives', err)
    });
  }


  viewDetails(archive: any) {
    this.selectedArchive = archive;
  }

  closeDetails() {
    this.selectedArchive = null;
  }
}