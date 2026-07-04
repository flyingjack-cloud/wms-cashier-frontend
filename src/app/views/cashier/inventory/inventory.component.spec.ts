import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InventoryComponent } from './inventory.component';
import {OrderService} from "../../../services/order.service";
import {MerchandiseService} from "../../../services/merchandise.service";
import {MatDialog} from "@angular/material/dialog";
import {By} from "@angular/platform-browser";
import {MatTabsModule} from "@angular/material/tabs";
import {CategoryService} from "../../../services/category.service";
import {Component, OnInit} from "@angular/core";
import {MatIconModule} from "@angular/material/icon";
import {MatTableModule} from "@angular/material/table";
import {ReactiveFormsModule} from "@angular/forms";
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatPaginatorModule} from "@angular/material/paginator";
import {MatInputModule} from "@angular/material/input";
import {provideAnimations} from "@angular/platform-browser/animations";
import {of} from "rxjs";
import {provideNativeDateAdapter} from "@angular/material/core";

@Component({
  selector: 'app-category-select',
  standalone: true,
  template: ``
})
export class CategorySelectComponent implements OnInit{
  ngOnInit(): void {
  }
}

@Component({
  selector: 'app-create-merchandise',
  standalone: true,
  template: ``
})
export class CreateMerchandiseComponent implements OnInit{
  ngOnInit(): void {
  }
}

@Component({
  selector: 'app-category-manage',
  standalone: true,
  template: ``
})
export class CategoryManageComponent implements OnInit{
  ngOnInit(): void {
  }
}

describe('InventoryComponent', () => {
  let component: InventoryComponent;
  let fixture: ComponentFixture<InventoryComponent>;
  let meServiceMock: jasmine.SpyObj<MerchandiseService>;
  let dialogMock: jasmine.SpyObj<MatDialog> = jasmine.createSpyObj('MatDialog', ['open']);

  beforeEach(async () => {
    meServiceMock = jasmine.createSpyObj("MerchandiseService", ["getMerchandiseByPage", "getMerchandisesByCateId"]);
    meServiceMock.getMerchandiseByPage.and.returnValue(of({
      count: 999,
      merchandise: [
        { id: 1, category:{id: 10, parentId: 1, name: "test model 1"}, cost: 10.0, price: 20.0, imei:"imei1", sold: false, createTime: new Date() },
        { id: 2, category:{id: 11, parentId: 1, name: "test model 2"}, cost: 20.0, price: 30.0, imei:"imei2", sold: false, createTime: new Date() },
      ]
    }))

    await TestBed.configureTestingModule({
      imports:[InventoryComponent, CategorySelectComponent, CreateMerchandiseComponent, CategoryManageComponent,MatInputModule,MatTabsModule, MatIconModule, MatTableModule, ReactiveFormsModule, MatFormFieldModule, MatPaginatorModule],
      providers: [
        { provide: MerchandiseService, useValue: meServiceMock},
        { provide: MatDialog, useValue: dialogMock},
        { provide: CategoryService, useValue: { getAllRootCategories: () => of([]), getCategoriesByParentId: () => of([]), deleteCategory: () => of(null) }},
        provideAnimations(),
        provideNativeDateAdapter()
      ],
    })
    .compileComponents();

    fixture = TestBed.createComponent(InventoryComponent);
    component = fixture.componentInstance;

    fixture.detectChanges();
  });

  it('should update data when filter', () => {
    const filterInput = fixture.debugElement.query(By.css("Input"));
    filterInput.nativeElement.value = "test model 1";
    filterInput.nativeElement.dispatchEvent(new Event("keyup"));
    fixture.detectChanges();
    expect(component.dataSource.filteredData.length).toBe(1);

    filterInput.nativeElement.value = "test model";
    filterInput.nativeElement.dispatchEvent(new Event("keyup"));
    fixture.detectChanges();
    expect(component.dataSource.filteredData.length).toBe(2);

    filterInput.nativeElement.value = "imei1";
    filterInput.nativeElement.dispatchEvent(new Event("keyup"));
    fixture.detectChanges();
    expect(component.dataSource.filteredData.length).toBe(1);
  });
});
