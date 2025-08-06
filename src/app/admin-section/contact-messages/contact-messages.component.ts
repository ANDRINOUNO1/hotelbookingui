import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ContactMessageService, ContactMessage } from '../../_services/contact-message.service';

@Component({
  selector: 'app-contact-messages',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './contact-messages.component.html',
  styleUrls: ['./contact-messages.component.scss']
})
export class ContactMessagesComponent implements OnInit {
  contactMessages: ContactMessage[] = [];
  searchTerm: string = '';
  filteredMessages: ContactMessage[] = [];
  isLoading = false;
  errorMessage = '';

  constructor(private contactMessageService: ContactMessageService) {}

  ngOnInit() {
    this.loadMessages();
  }

  loadMessages() {
    this.isLoading = true;
    this.errorMessage = '';

    this.contactMessageService.getMessages().subscribe({
      next: (response) => {
        if (response.success) {
          this.contactMessages = response.data;
          this.applySearch();
        } else {
          this.errorMessage = response.message || 'Failed to load messages';
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading messages:', error);
        this.errorMessage = 'Failed to load messages. Please try again.';
        this.isLoading = false;
      }
    });
  }

  applySearch() {
    if (!this.searchTerm.trim()) {
      this.filteredMessages = [...this.contactMessages];
    } else {
      const search = this.searchTerm.toLowerCase();
      this.filteredMessages = this.contactMessages.filter(message =>
        message.name.toLowerCase().includes(search) ||
        message.email.toLowerCase().includes(search) ||
        message.subject.toLowerCase().includes(search) ||
        message.message.toLowerCase().includes(search)
      );
    }
  }

  onSearchTermChange() {
    this.applySearch();
  }

  clearSearch() {
    this.searchTerm = '';
    this.applySearch();
  }

  deleteMessage(id: number) {
    if (confirm('Are you sure you want to delete this message?')) {
      this.contactMessageService.deleteMessage(id).subscribe({
        next: (response) => {
          if (response.success) {
            this.contactMessages = this.contactMessages.filter(msg => msg.id !== id);
            this.filteredMessages = this.filteredMessages.filter(msg => msg.id !== id);
            alert('Message deleted successfully');
          } else {
            alert('Failed to delete message: ' + response.message);
          }
        },
        error: (error) => {
          console.error('Error deleting message:', error);
          alert('Failed to delete message. Please try again.');
        }
      });
    }
  }

  markAsRead(id: number) {
    this.contactMessageService.markAsRead(id).subscribe({
      next: (response) => {
        if (response.success) {
          const message = this.contactMessages.find(msg => msg.id === id);
          if (message) {
            message.status = 'read';
          }
          this.applySearch();
        }
      },
      error: (error) => {
        console.error('Error marking message as read:', error);
      }
    });
  }

  markAsReplied(id: number) {
    this.contactMessageService.markAsReplied(id).subscribe({
      next: (response) => {
        if (response.success) {
          const message = this.contactMessages.find(msg => msg.id === id);
          if (message) {
            message.status = 'replied';
          }
          this.applySearch();
        }
      },
      error: (error) => {
        console.error('Error marking message as replied:', error);
      }
    });
  }

  clearAllMessages() {
    if (confirm('Are you sure you want to delete all messages? This action cannot be undone.')) {
      // Note: This would require a backend endpoint to delete all messages
      // For now, we'll just clear the local array
      this.contactMessages = [];
      this.filteredMessages = [];
      alert('All messages cleared from view. Note: This only clears the view, not the database.');
    }
  }

  formatDate(date: string | Date): string {
    return new Date(date).toLocaleString();
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'unread': return 'status-unread';
      case 'read': return 'status-read';
      case 'replied': return 'status-replied';
      default: return '';
    }
  }

  getMessagePreview(message: string): string {
    return message.length > 100 ? message.substring(0, 100) + '...' : message;
  }
} 