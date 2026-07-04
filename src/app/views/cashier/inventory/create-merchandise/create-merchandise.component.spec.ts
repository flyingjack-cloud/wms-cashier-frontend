import {ComponentFixture, TestBed} from '@angular/core/testing';

import {CreateMerchandiseComponent} from './create-merchandise.component';
import {ToastService} from "../../../../services/toast.service";
import {provideAnimations} from "@angular/platform-browser/animations";
import {MerchandiseService} from "../../../../services/merchandise.service";
import {Component, EventEmitter, Input, OnInit, Output} from "@angular/core";
import {CategoryManageComponent} from "../category-manage/category-manage.component";
import {Category} from "../../../../models/category";
import {CategoryService} from "../../../../services/category.service";
import {MatDatepickerModule} from "@angular/material/datepicker";
import {MatInputModule} from "@angular/material/input";
import {MatSelectModule} from "@angular/material/select";
import {AsyncPipe} from "@angular/common";
import {MatButtonModule} from "@angular/material/button";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {MatIconModule} from "@angular/material/icon";
import {MatListModule} from "@angular/material/list";
import {MatProgressBarModule} from "@angular/material/progress-bar";
import {PreventEnterDirective} from "../../../../directives/prevent-enter.directive";
import {MatNativeDateModule} from "@angular/material/core";
import {By} from "@angular/platform-browser";


describe('CreateMerchandiseComponent', () => {
  let component: CreateMerchandiseComponent;
  let fixture: ComponentFixture<CreateMerchandiseComponent>;
  let toastServiceMock: jasmine.SpyObj<ToastService>;
  let meServiceMock: jasmine.SpyObj<MerchandiseService>;

  beforeEach(async () => {
    toastServiceMock = jasmine.createSpyObj("ToastService", ["push"]);
    meServiceMock = jasmine.createSpyObj("MerchandiseService", ["insertMerchandiseSet"]);

    await TestBed.configureTestingModule({
      imports: [CreateMerchandiseComponent,
        MatInputModule,
        MatSelectModule,
        AsyncPipe,
        MatButtonModule,
        FormsModule,
        MatIconModule,
        CategoryManageComponent,
        MatListModule,
        MatDatepickerModule,
        ReactiveFormsModule,
        MatProgressBarModule,
        PreventEnterDirective,
        MatNativeDateModule],
      providers: [
        { provide: ToastService, useValue: toastServiceMock },
        { provide: MerchandiseService, useValue: meServiceMock },
        { provide: CategoryService, useValue: jasmine.createSpyObj("CategoryService", ["getAllRootCategories"])},

        provideAnimations()
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(CreateMerchandiseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should add imei when click button', () => {
    const addBtn = fixture.debugElement.query(By.directive(PreventEnterDirective));
    const imeiInput = fixture.debugElement.query(By.css("input[type=text]"));
    imeiInput.nativeElement.value = "test001";
    addBtn.triggerEventHandler("click");

    expect(component.imeiSet.size).toBe(1);
    //重复输入测试
    imeiInput.nativeElement.value = "test001";
    addBtn.triggerEventHandler("click");
    expect(component.imeiSet.size).toBe(1);

    imeiInput.nativeElement.value = "test002";
    addBtn.triggerEventHandler("click");
    expect(component.imeiSet.size).toBe(2);
  });

  it('should not insert when imei set is empty', () => {
    component.submit();
    fixture.detectChanges();
    expect(toastServiceMock.push).toHaveBeenCalledTimes(1);
    expect(meServiceMock.insertMerchandiseSet).toHaveBeenCalledTimes(0);
  });
});
