import { Component, OnInit } from '@angular/core';
import { ProductService } from '../../_services/product.service';
import { Product } from '../../_models/product.model';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-products',
  imports: [CommonModule, FormsModule],
  standalone: true,
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.scss']
})
export class ProductsComponent implements OnInit {
  products: Product[] = [];
  newProduct: Product = { name: '', category: '', price: 0, color: '', };
  editingProduct: Product | null = null;

  searchTerm: string = '';
  selectedCategory: string = '';
  categories: string[] = [];
  statuses: string[] = [];

  constructor(private productService: ProductService) {}

  ngOnInit(): void {
    this.loadProducts();
    this.loadStatuses();
  }

  loadProducts() {
    this.productService.getProducts().subscribe(data => {
      this.products = data;
      this.extractCategories();
    });
  }

  saveProduct() {
    if (this.editingProduct) {
      this.productService.updateProduct(this.editingProduct.id!, this.editingProduct).subscribe(() => {
        this.loadProducts();
        this.cancelEdit();
      });
    } else {
      this.productService.createProduct(this.newProduct).subscribe(() => {
        this.loadProducts();
        this.newProduct = { name: '', category: '', price: 0, color: '' };
      });
    }
  }

  editProduct(product: Product) {
    this.editingProduct = { ...product };
  }

  cancelEdit() {
    this.editingProduct = null;
  }

  deleteProduct(id: number) {
    if (confirm('Are you sure you want to delete this product?')) {
      this.productService.deleteProduct(id).subscribe(() => {
        this.loadProducts();
      });
    }
  }

  get filteredProducts(): Product[] {
    return this.products.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(this.searchTerm.toLowerCase());
      const matchesCategory = !this.selectedCategory || p.category === this.selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }

  private extractCategories() {
    this.categories = Array.from(new Set(this.products.map(p => p.category)));
  }

  loadStatuses() {
    // ✅ match backend ENUM
    this.statuses = ['pending', 'in_progress', 'completed', 'cancelled'];
  }
}
