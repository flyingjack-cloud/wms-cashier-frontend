import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatSelectModule} from "@angular/material/select";
import {MatInputModule} from "@angular/material/input";
import {FormsModule} from "@angular/forms";
import {Category} from "../../../../models/category";
import {CategoryService} from "../../../../services/category.service";
import {AsyncPipe} from "@angular/common";
import {Observable, of} from "rxjs";
import {MatButtonModule} from "@angular/material/button";
import {MatIconModule} from "@angular/material/icon";
import {MatDialog} from "@angular/material/dialog";
import {DialogAddBrandComponent} from "./dialog-add-brand/dialog-add-brand.component";
import {MatCardModule} from "@angular/material/card";
import {DialogAddModelComponent} from "./dialog-add-model/dialog-add-model.component";
import {ToastService} from "../../../../services/toast.service";

@Component({
  selector: 'app-category-manage',
  standalone: true,
  imports: [MatFormFieldModule, MatSelectModule, MatInputModule, FormsModule, AsyncPipe, MatButtonModule, MatIconModule, MatCardModule],
  templateUrl: './category-manage.component.html',
  styleUrl: './category-manage.component.scss'
})
export class CategoryManageComponent implements OnInit{
  brands: Observable<Category[]> = of();
  models: Observable<Category[]> = of();

  @Input() showDelete: boolean = true;
  @Output() selectEvent: EventEmitter<Category> = new EventEmitter<Category>();

  cateSelected : Category | undefined;

  constructor(private categoryService:CategoryService,
              public dialog: MatDialog,
              private toast: ToastService) {
  }

  ngOnInit(): void {
    this.brands = this.categoryService.getAllRootCategories();
  }

  selectBrand(selected: Category) {
    this.selectCategory(selected);
    this.models = this.categoryService.getCategoriesByParentId(selected.id);
  }

  selectCategory(selected: Category) {
    this.cateSelected = selected;
    this.selectEvent.emit(this.cateSelected);
  }

  addBrand(){
    this.dialog.open(DialogAddBrandComponent, {
      width: '300px',
      height: '280px'
    }).afterClosed().subscribe(()=> this.brands = this.categoryService.getAllRootCategories());
  }

  addModel(cate:Category) {
    this.dialog.open(DialogAddModelComponent, {
      width: '300px',
      height: '280px',
      data: cate
    }).afterClosed().subscribe(()=> this.selectBrand(cate));
  }

  reset() {
    this.cateSelected = undefined;
    this.brands = this.categoryService.getAllRootCategories();
    this.models = of();
  }

  deleteCate(){
    if (this.cateSelected){
      this.categoryService.deleteCategory(this.cateSelected.id).subscribe({
        next: data => this.toast.push("删除成功", "success"),
        complete: () => this.reset()
      });
    }
  }
}
