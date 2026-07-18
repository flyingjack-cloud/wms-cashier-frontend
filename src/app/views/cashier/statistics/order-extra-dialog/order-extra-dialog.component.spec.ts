import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { provideAnimations } from '@angular/platform-browser/animations';
import { of } from 'rxjs';
import { OrderExtraDialogComponent } from './order-extra-dialog.component';
import { ReceiptService } from '../../../../services/receipt.service';
import { ToastService } from '../../../../services/toast.service';
import { Order } from '../../../../models/order';

describe('OrderExtraDialogComponent', () => {
  let fixture: ComponentFixture<OrderExtraDialogComponent>;
  let component: OrderExtraDialogComponent;
  let receipts: jasmine.SpyObj<ReceiptService>;
  let dialogRef: jasmine.SpyObj<MatDialogRef<OrderExtraDialogComponent>>;

  const order: Order = {
    id: 101,
    merchandise: {
      id: 1,
      category: { id: 1, parentId: 0, name: '测试型号' },
      cost: 1000, price: 2000, imei: '86001', sold: true, createTime: new Date(),
    },
    sellingPrice: 1888, remark: '', sellingTime: new Date(), returned: false,
  };

  beforeEach(async () => {
    receipts = jasmine.createSpyObj('ReceiptService', ['getExtraTemplates', 'getOrderExtras', 'saveOrderExtra']);
    receipts.getExtraTemplates.and.returnValue(of([{
      id: 1, code: 'subsidy', name: '国补', version: 1, enabled: true,
      schema: { fields: [
        { key: 'customerName', label: '客户姓名', type: 'text', required: true },
        { key: 'sn', label: 'SN', type: 'text', required: false },
      ] },
    }]));
    receipts.getOrderExtras.and.returnValue(of([{
      orderId: 101, templateCode: 'subsidy', templateName: '国补', templateVersion: 1,
      payload: { customerName: '张三', sn: '' },
    }]));
    receipts.saveOrderExtra.and.returnValue(of({}));
    dialogRef = jasmine.createSpyObj('MatDialogRef', ['close']);

    await TestBed.configureTestingModule({
      imports: [OrderExtraDialogComponent],
      providers: [
        provideAnimations(),
        { provide: MAT_DIALOG_DATA, useValue: order },
        { provide: MatDialogRef, useValue: dialogRef },
        { provide: ReceiptService, useValue: receipts },
        { provide: ToastService, useValue: jasmine.createSpyObj('ToastService', ['push']) },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(OrderExtraDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('prefills and updates an existing extra while omitting empty optional fields', () => {
    expect(component.isExisting('subsidy')).toBeTrue();
    expect(component.payloads['subsidy']['customerName']).toBe('张三');

    component.payloads['subsidy']['customerName'] = '李四';
    component.save();

    expect(receipts.saveOrderExtra).toHaveBeenCalledWith(101, 'subsidy', { customerName: '李四' });
    expect(dialogRef.close).toHaveBeenCalledWith({ updated: true });
  });
});
