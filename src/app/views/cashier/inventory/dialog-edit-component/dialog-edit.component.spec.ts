import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogEditComponent } from './dialog-edit.component';
import {ToastService} from "../../../../services/toast.service";
import {MerchandiseService} from "../../../../services/merchandise.service";
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {provideAnimations} from "@angular/platform-browser/animations";
import {By} from "@angular/platform-browser";
import {HarnessLoader} from "@angular/cdk/testing";
import {TestbedHarnessEnvironment} from "@angular/cdk/testing/testbed";
import {MatErrorHarness, MatFormFieldHarness} from "@angular/material/form-field/testing";
import {ReactiveFormsModule} from "@angular/forms";
import {cold, getTestScheduler} from "jasmine-marbles";

describe('DialogEditComponentComponent', () => {
  let component: DialogEditComponent;
  let fixture: ComponentFixture<DialogEditComponent>;
  let toastServiceMock: jasmine.SpyObj<ToastService>;
  let meServiceMock: jasmine.SpyObj<MerchandiseService>;


  beforeEach(async () => {
    toastServiceMock = jasmine.createSpyObj("ToastService", ["push"]);
    meServiceMock = jasmine.createSpyObj("MerchandiseService", ["updateMerchandise"]);

    await TestBed.configureTestingModule({
      imports: [DialogEditComponent, ReactiveFormsModule],
      providers: [
        { provide: MatDialogRef, useValue: {close(){}}},
        { provide: ToastService, useValue: toastServiceMock },
        { provide: MerchandiseService, useValue: meServiceMock },
        { provide: MAT_DIALOG_DATA, useValue:{ id: 1, category:{id: 10, parentId: 1, name: "test model 1"}, cost: 10.0, price: 20.0, imei:"1", sold: false, createTime: new Date() }},
        provideAnimations()
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DialogEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should call service when submit', () => {
    const $q = cold("---x|");
    meServiceMock.updateMerchandise.and.returnValue($q);

    component.form.controls.cost.setValue(999);
    component.form.controls.price.setValue(1999);
    component.form.controls.imei.setValue("test001");
    component.form.markAsTouched();
    component.onSubmit();
    fixture.detectChanges();
    getTestScheduler().flush();

    expect(meServiceMock.updateMerchandise).toHaveBeenCalled();
    expect(toastServiceMock.push).toHaveBeenCalled();
  });
});
