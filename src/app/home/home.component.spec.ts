import { Component, OnInit, OnDestroy, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ContentService, ContentItem } from '../_services/content.service';
import { Subject, takeUntil, BehaviorSubject } from 'rxjs';

export interface HeaderConfig {
  logo: {
    url: string;
    altText: string;
  };
  navigation: Array<{
    label: string;
    href: string;
    isExternal: boolean;
  }>;
  ctaButton: {
    text: string;
    href: string;
    isExternal: boolean;
  };
  loginButton: {
    text: string;
    href: string;
    isExternal: boolean;
  };
  styles: {
    backgroundColor: string;
    textColor: string;
    accentColor: string;
    fontFamily: string;
  };
  isEditable: boolean;
}

@Component({
  selector: 'app-dynamic-header',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './dynamic-header.component.html',
  styleUrls: ['./dynamic-header.component.scss']
})
export class DynamicHeaderComponent implements OnInit, OnDestroy {
  @Input() isEditable: boolean = false;
  @Input() showEditButton: boolean = true;
  @Output() editClicked = new EventEmitter<void>();

  private destroy$ = new Subject<void>();
  private headerConfigSubject = new BehaviorSubject<HeaderConfig>(this.getDefaultConfig());
  
  headerConfig$ = this.headerConfigSubject.asObservable();
  isEditing = false;
  editingConfig: HeaderConfig | null = null;
  loading = false;

  constructor(private contentService: ContentService) {}

  ngOnInit() {
    this.loadHeaderConfig();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private getDefaultConfig(): HeaderConfig {
    return {
      logo: {
        url: 'assets/images/bcflats.png',
        altText: 'BC Flats Logo'
      },
      navigation: [
        { label: 'Home', href: '#home', isExternal: false },
        { label: 'Rooms', href: '#rooms', isExternal: false },
        { label: 'About', href: '#about', isExternal: false },
        { label: 'Services', href: '#services', isExternal: false },
        { label: 'Contact', href: '#contact', isExternal: false }
      ],
      ctaButton: {
        text: 'Book Now',
        href: '/reserve',
        isExternal: false
      },
      loginButton: {
        text: 'Login',
        href: '/login',
        isExternal: false
      },
      styles: {
        backgroundColor: '#0b0b31',
        textColor: '#e5c07b',
        accentColor: '#b4884d',
        fontFamily: 'Montserrat, sans-serif'
      },
      isEditable: this.isEditable
    };
  }

  private loadHeaderConfig() {
    this.loading = true;
    
    // Load header content from content service
    this.contentService.getSectionContent('header')
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (contentItems: ContentItem[]) => {
          const config = this.parseContentToConfig(contentItems);
          this.headerConfigSubject.next(config);
          this.loading = false;
        },
        error: (error) => {
          console.error('Error loading header config:', error);
          // Use default config on error
          this.headerConfigSubject.next(this.getDefaultConfig());
          this.loading = false;
        }
      });
  }

  private parseContentToConfig(contentItems: ContentItem[]): HeaderConfig {
    const config = this.getDefaultConfig();
    
    contentItems.forEach(item => {
      switch (item.key) {
        case 'logo_url':
          config.logo.url = item.value || config.logo.url;
          break;
        case 'logo_alt':
          config.logo.altText = item.value || config.logo.altText;
          break;
        case 'navigation':
          try {
            config.navigation = JSON.parse(item.value || '[]');
          } catch (e) {
            console.warn('Invalid navigation JSON:', item.value);
          }
          break;
        case 'cta_button':
          try {
            config.ctaButton = JSON.parse(item.value || '{}');
          } catch (e) {
            console.warn('Invalid CTA button JSON:', item.value);
          }
          break;
        case 'login_button':
          try {
            config.loginButton = JSON.parse(item.value || '{}');
          } catch (e) {
            console.warn('Invalid login button JSON:', item.value);
          }
          break;
        case 'styles':
          try {
            config.styles = { ...config.styles, ...JSON.parse(item.value || '{}') };
          } catch (e) {
            console.warn('Invalid styles JSON:', item.value);
          }
          break;
      }
    });

    return config;
  }

  private configToContentItems(config: HeaderConfig): ContentItem[] {
    return [
      {
        section: 'header',
        type: 'text',
        key: 'logo_url',
        value: config.logo.url
      },
      {
        section: 'header',
        type: 'text',
        key: 'logo_alt',
        value: config.logo.altText
      },
      {
        section: 'header',
        type: 'text',
        key: 'navigation',
        value: JSON.stringify(config.navigation)
      },
      {
        section: 'header',
        type: 'text',
        key: 'cta_button',
        value: JSON.stringify(config.ctaButton)
      },
      {
        section: 'header',
        type: 'text',
        key: 'login_button',
        value: JSON.stringify(config.loginButton)
      },
      {
        section: 'header',
        type: 'text',
        key: 'styles',
        value: JSON.stringify(config.styles)
      }
    ];
  }

  startEditing() {
    this.editingConfig = { ...this.headerConfigSubject.value };
    this.isEditing = true;
    this.editClicked.emit();
  }

  cancelEditing() {
    this.isEditing = false;
    this.editingConfig = null;
  }

  saveChanges() {
    if (!this.editingConfig) return;

    this.loading = true;
    const contentItems = this.configToContentItems(this.editingConfig);
    
    // Save each content item
    const savePromises = contentItems.map(item => 
      this.contentService.updateText(item.section, item.key, item.value || '').toPromise()
    );

    Promise.all(savePromises)
      .then(() => {
        this.headerConfigSubject.next(this.editingConfig!);
        this.isEditing = false;
        this.editingConfig = null;
        this.loading = false;
      })
      .catch(error => {
        console.error('Error saving header config:', error);
        this.loading = false;
      });
  }

  addNavigationItem() {
    if (this.editingConfig) {
      this.editingConfig.navigation.push({
        label: 'New Item',
        href: '#',
        isExternal: false
      });
    }
  }

  removeNavigationItem(index: number) {
    if (this.editingConfig) {
      this.editingConfig.navigation.splice(index, 1);
    }
  }

  toggleMobileMenu() {
    // Add mobile menu toggle logic here
    const mobileMenu = document.querySelector('.mobile-menu');
    if (mobileMenu) {
      mobileMenu.classList.toggle('active');
    }
  }

  getCurrentConfig(): HeaderConfig {
    return this.headerConfigSubject.value;
  }
}