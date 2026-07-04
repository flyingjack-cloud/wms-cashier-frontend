import {ComponentFixture, TestBed} from '@angular/core/testing';

import {OrderConfirmComponent} from './order-confirm.component';
import {ToastService} from "../../../../services/toast.service";
import {OrderService} from "../../../../services/order.service";
import {MatDialogRef} from "@angular/material/dialog";
import {MAT_DIALOG_DATA} from "@angular/material/dialog";
import {provideAnimations} from "@angular/platform-browser/animations";
import {By} from "@angular/platform-browser";
import {cold, getTestScheduler} from "jasmine-marbles";
import {provideHttpClient} from "@angular/common/http";
import {provideHttpClientTesting} from "@angular/common/http/testing";

describe('OrderConfirmComponent', () => {
  let component: OrderConfirmComponent;
  let fixture: ComponentFixture<OrderConfirmComponent>;
  let orderServiceMock: jasmine.SpyObj<OrderService>;
  let toastServiceMock: jasmine.SpyObj<ToastService>;

  beforeEach(async () => {
    orderServiceMock = jasmine.createSpyObj("orderServiceMock", ["batchOrder"]);
    toastServiceMock = jasmine.createSpyObj("ToastService", ["push"]);

    await TestBed.configureTestingModule({
      imports: [OrderConfirmComponent],
      providers: [
        { provide: MatDialogRef, useValue: {close(){}}},
        { provide: MAT_DIALOG_DATA, useValue: {cart: [
              { id: -1, merchandise: { id: 1, category:{id: 10, parentId: 1, name: "test model 1"}, cost: 10.0, price: 20.0, imei:"1", sold: false, createTime: new Date() }, sellingPrice: 20.0, remark: "", sellingTime: new Date(), returned: false },
              { id: -1, merchandise: { id: 2, category:{id: 10, parentId: 1, name: "test model 1"}, cost: 20.0, price: 50.0, imei:"2", sold: false, createTime: new Date() }, sellingPrice: 50.0, remark: "", sellingTime: new Date(), returned: false },
              { id: -1, merchandise: { id: 3, category:{id: 11, parentId: 1, name: "test model 2"}, cost: 30.0, price: 50.0, imei:"3", sold: false, createTime: new Date() }, sellingPrice: 50.0, remark: "", sellingTime: new Date(), returned: false },
            ]}},
        { provide: OrderService, useValue: orderServiceMock },
        { provide: ToastService, useValue: toastServiceMock },
        provideAnimations(),
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OrderConfirmComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should update loading and call services(async)',  () => {
    const receiptMock = jasmine.createSpyObj("ReceiptPrintComponent", ["print"]);
    component.receipt = receiptMock;
    component.orderConfirmForm.markAsTouched();

    // 正常数据流
    orderServiceMock.batchOrder.and.returnValue(cold('---x|', {x: "success"}));
    component.order();
    expect(component.loading).toBe(true);
    getTestScheduler().flush();
    fixture.detectChanges();

    expect(component.loading).toBe(false);
    expect(receiptMock.print).toHaveBeenCalled();
    expect(toastServiceMock.push).toHaveBeenCalled();
  });


  const convertDate = (date: Date) => {
    return (date.getMonth() + 1)  + "/" + date.getDate() + "/" + date.getFullYear();
  }
});
