import {Component, EventEmitter, OnInit, Output} from '@angular/core';
import {AsyncPipe, NgFor} from '@angular/common';
import {Observable, Subject} from 'rxjs';
import {Category} from 'src/app/models/category';
import {CategoryService} from 'src/app/services/category.service';
import {MatButtonToggleModule} from '@angular/material/button-toggle';

@Component({
  selector: 'app-category-select',
  standalone: true,
  imports: [
    NgFor,
    AsyncPipe,
    MatButtonToggleModule
  ],
  templateUrl: './category-select.component.html',
  styleUrls: ['./category-select.component.scss']
})
export class CategorySelectComponent implements OnInit{
  @Output() select = new EventEmitter<Category>();

  rootCategories!: Observable<Category[]>;
  modelCategories!: Observable<Category[]>;
  secondCategories!: Observable<Category[]>;

  selectedCategory!:Category;

  constructor(private categoryService:CategoryService ){}

  ngOnInit(): void {
    this.rootCategories = this.categoryService.getAllRootCategories()
  }

  rootSelect(category:Category) {
    // 清空二级
    this.secondCategories = new Subject();

    this.modelCategories = this.categoryService.getCategoriesByParentId(category.id);

    this.selectCategory(category)
  }

  modelSelect(category:Category) {
    this.secondCategories = this.categoryService.getCategoriesByParentId(category.id);

    this.selectCategory(category)
  }

  selectCategory(category: Category) {
    this.selectedCategory = category;
    this.select.emit(this.selectedCategory);
  }
}
