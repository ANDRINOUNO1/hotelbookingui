import { Component, ViewContainerRef, OnInit, OnDestroy } from '@angular/core';
import { ErrorModalService } from '../_services/error-modal.service';
import { ErrorModalComponent } from '../_components/error-modal.component';

@Component({
  selector: 'app-modal-container',
  standalone: true,
  template: `<div class="modal-container"></div>`,
  styles: [`
    .modal-container {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: 10000;
    }
  `]
})
export class ModalContainerComponent implements OnInit, OnDestroy {
  constructor(
    private viewContainerRef: ViewContainerRef,
    private errorModalService: ErrorModalService
  ) {}

  ngOnInit() {
    // Set the view container ref for the error modal service
    (this.errorModalService as any).setViewContainerRef(this.viewContainerRef);
  }

  ngOnDestroy() {
    // Clean up
  }
}
