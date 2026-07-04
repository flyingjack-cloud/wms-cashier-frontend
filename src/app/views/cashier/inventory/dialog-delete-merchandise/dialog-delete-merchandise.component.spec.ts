import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogDeleteMerchandiseComponent } from './dialog-delete-merchandise.component';
import {ToastService} from "../../../../services/toast.service";
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {OrderConfirmComponent} from "../../shopping/order-confirm/order-confirm.component";
import {MerchandiseService} from "../../../../services/merchandise.service";
import {cold, getTestScheduler} from "jasmine-marbles";

describe('DialogDeleteMerchandiseComponent', () => {
  let component: DialogDeleteMerchandiseComponent;
  let fixture: ComponentFixture<DialogDeleteMerchandiseComponent>;
  let toastServiceMock: jasmine.SpyObj<ToastService>;
  let meServiceMock: jasmine.SpyObj<MerchandiseService>;

  beforeEach(async () => {
    toastServiceMock = jasmine.createSpyObj("ToastService", ["push"]);
    meServiceMock = jasmine.createSpyObj("MerchandiseService", ["deleteMerchandise"]);

    await TestBed.configureTestingModule({
      imports: [DialogDeleteMerchandiseComponent],
      providers: [
        { provide: MatDialogRef, useValue: {close(){}}},
        { provide: ToastService, useValue: toastServiceMock },
        { provide: MerchandiseService, useValue: meServiceMock },
        { provide: MAT_DIALOG_DATA, useValue:{ id: 1, category:{id: 10, parentId: 1, name: "test model 1"}, cost: 10.0, price: 20.0, imei:"1", sold: false, createTime: new Date() },}
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DialogDeleteMerchandiseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should send delete when submit', () => {
    const $e = cold("---x|");
    meServiceMock.deleteMerchandise.and.returnValue($e);

    component.delete();
    getTestScheduler().flush();
    fixture.detectChanges();

    expect(toastServiceMock.push).toHaveBeenCalled();
  });
});
