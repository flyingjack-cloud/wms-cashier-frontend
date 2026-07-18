import {ComponentFixture, TestBed} from '@angular/core/testing';

import {OrderConfirmComponent} from './order-confirm.component';
import {ToastService} from "../../../../services/toast.service";
import {OrderService} from "../../../../services/order.service";
import {MatDialogRef} from "@angular/material/dialog";
import {MAT_DIALOG_DATA} from "@angular/material/dialog";
import {provideAnimations} from "@angular/platform-browser/animations";
import {By} from "@angular/platform-browser";
import {of} from "rxjs";
import {provideHttpClient} from "@angular/common/http";
import {provideHttpClientTesting} from "@angular/common/http/testing";
import {ReceiptService} from "../../../../services/receipt.service";

describe('OrderConfirmComponent', () => {
  let component: OrderConfirmComponent;
  let fixture: ComponentFixture<OrderConfirmComponent>;
  let orderServiceMock: jasmine.SpyObj<OrderService>;
  let toastServiceMock: jasmine.SpyObj<ToastService>;
  let receiptServiceMock: jasmine.SpyObj<ReceiptService>;

  beforeEach(async () => {
    orderServiceMock = jasmine.createSpyObj("orderServiceMock", ["batchOrder"]);
    toastServiceMock = jasmine.createSpyObj("ToastService", ["push"]);
    receiptServiceMock = jasmine.createSpyObj("ReceiptService", ["getExtraTemplates", "saveOrderExtra"]);
    receiptServiceMock.getExtraTemplates.and.returnValue(of([]));
    receiptServiceMock.saveOrderExtra.and.returnValue(of({}));

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
        { provide: ReceiptService, useValue: receiptServiceMock },
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

  it('should omit empty optional extra fields before saving', async () => {
    component.extraTemplates = [{
      id: 1,
      code: 'invoice',
      name: '发票信息',
      version: 1,
      enabled: true,
      schema: { fields: [
        { key: 'title', label: '抬头', type: 'text', required: true },
        { key: 'taxNo', label: '税号', type: 'text' },
        { key: 'payMethod', label: '支付方式', type: 'select', options: ['现金'] },
        { key: 'amount', label: '金额', type: 'number' },
      ] },
    }];
    component.selectedTemplates = { invoice: true };
    component.extraPayloads = { invoice: { title: '测试公司', taxNo: '', payMethod: '', amount: '' } };
    orderServiceMock.batchOrder.and.returnValue(of([101, 102, 103]));
    const receiptMock = jasmine.createSpyObj('ReceiptPrintComponent', ['print']);
    receiptMock.print.and.returnValue(Promise.resolve());
    component.receipt = receiptMock;

    await component.order();

    expect(receiptServiceMock.saveOrderExtra).toHaveBeenCalledTimes(3);
    expect(receiptServiceMock.saveOrderExtra.calls.first().args).toEqual([101, 'invoice', { title: '测试公司' }]);
  });

  it('should update loading and call services(async)',  async () => {
    const receiptMock = jasmine.createSpyObj("ReceiptPrintComponent", ["print"]);
    receiptMock.print.and.returnValue(Promise.resolve());
    component.receipt = receiptMock;
    component.orderConfirmForm.markAsTouched();

    // 正常数据流
    orderServiceMock.batchOrder.and.returnValue(of([101, 102, 103]));
    await component.order();
    fixture.detectChanges();

    expect(component.loading).toBe(false);
    expect(receiptMock.print).toHaveBeenCalled();
    expect(toastServiceMock.push).toHaveBeenCalled();
  });


  const convertDate = (date: Date) => {
    return (date.getMonth() + 1)  + "/" + date.getDate() + "/" + date.getFullYear();
  }
});
