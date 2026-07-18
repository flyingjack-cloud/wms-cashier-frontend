import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BehaviorSubject, of } from 'rxjs';
import { ReceiptPrintComponent } from './receipt-print.component';
import { ReceiptService } from '../../../services/receipt.service';
import { CategoryService } from '../../../services/category.service';
import { GroupService } from '../../../services/group.service';
import { UserService } from '../../../services/user.service';
import { DEFAULT_AVATAR } from '../../../models/profile';
import { Order } from '../../../models/order';
import { ReceiptLayout } from '../../../models/receipt';

describe('ReceiptPrintComponent', () => {
  let fixture: ComponentFixture<ReceiptPrintComponent>;
  let component: ReceiptPrintComponent;

  const order: Order = {
    id: 101,
    merchandise: {
      id: 1,
      category: { id: 10, parentId: 2, name: '示例型号' },
      cost: 2000,
      price: 3000,
      imei: '86001',
      sold: true,
      createTime: new Date(),
    },
    sellingPrice: 2888,
    remark: '',
    sellingTime: new Date('2026-07-18T06:00:00Z'),
    returned: false,
  };

  beforeEach(async () => {
    const receipts = jasmine.createSpyObj('ReceiptService', ['getReceiptTemplates', 'getExtrasForOrders']);
    receipts.getReceiptTemplates.and.returnValue(of([]));
    receipts.getExtrasForOrders.and.returnValue(of(new Map()));
    const categories = jasmine.createSpyObj('CategoryService', ['getCategoryDetailById']);
    categories.getCategoryDetailById.and.returnValue(of({ id: 2, parentId: 0, name: '示例品牌' }));
    const groups = {
      groupSubject$: new BehaviorSubject({ id: 1, storeName: '测试店铺', address: '测试地址', contact: '', createTime: new Date() }),
    };
    const users = {
      profile: new BehaviorSubject({ userId: 1, nickname: '打印员', email: '', phoneNumber: '', avatar: DEFAULT_AVATAR }),
    };

    await TestBed.configureTestingModule({
      imports: [ReceiptPrintComponent],
      providers: [
        { provide: ReceiptService, useValue: receipts },
        { provide: CategoryService, useValue: categories },
        { provide: GroupService, useValue: groups },
        { provide: UserService, useValue: users },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(ReceiptPrintComponent);
    component = fixture.componentInstance;
    component.data = [order];
    component.extrasByOrder = new Map([[101, [{
      orderId: 101, templateCode: 'invoice', templateName: '发票', templateVersion: 1,
      payload: { title: '测试公司' },
    }]]]);
  });

  it('resolves fixed, calculated and extra fields', async () => {
    await component.prepare();
    expect(component.value('store.storeName')).toBe('测试店铺');
    expect(component.value('cashier.printedBy')).toBe('打印员');
    expect(component.value('order.brand')).toBe('示例品牌');
    expect(component.value('extra.invoice.title')).toBe('测试公司');
    expect(component.format(2888, 'currency')).toBe('2,888.00');
  });

  it('treats table widths as relative weights', () => {
    const columns = [
      { type: 'index' as const, label: '序号', width: 1 },
      { type: 'field' as const, label: '型号', field: 'order.model', width: 3 },
    ];
    expect(component.tableColumnWidth(columns, columns[0])).toBe(25);
    expect(component.tableColumnWidth(columns, columns[1])).toBe(75);
  });

  it('uses isolated test values and paper dimensions in preview mode', () => {
    component.preview = true;
    component.previewValues = { 'store.storeName': '预览测试门店', 'extra.invoice.title': '预览发票抬头' };
    component.printerType = 'THERMAL_58';
    expect(component.value('store.storeName')).toBe('预览测试门店');
    expect(component.value('extra.invoice.title')).toBe('预览发票抬头');
    expect(component.previewPageStyle()['width']).toBe('230px');
  });

  it('renders detail rows and spans the sequence cell across them', () => {
    const layout: ReceiptLayout = { rows: [{ columns: [{
      span: 12,
      type: 'table',
      style: { border: true },
      table: {
        source: 'orders',
        columns: [
          { type: 'index', label: '序号', width: 1 },
          { type: 'field', label: '型号', field: 'order.model', width: 3 },
        ],
        detailRows: [{ columns: [
          { span: 3, type: 'label', field: '发票抬头：' },
          { span: 9, type: 'text', field: 'extra.invoice.title' },
        ] }],
      },
    }] }] };
    component.resolvedLayout = layout;
    fixture.detectChanges();

    const sequenceCell = fixture.nativeElement.querySelector('tbody tr td');
    expect(sequenceCell.getAttribute('rowspan')).toBe('2');
    expect(fixture.nativeElement.querySelectorAll('.receipt-detail-row').length).toBe(1);
    expect(fixture.nativeElement.textContent).toContain('测试公司');
  });

  it('uses page font size as the default and lets cell style override it', () => {
    component.resolvedLayout = { page: { fontSize: 10 }, rows: [{ columns: [] }] };
    expect(component.pageFontSize()).toBe(10);
    expect(component.cellStyle({ type: 'label', field: '默认' })['font-size.px']).toBe(10);
    expect(component.cellStyle({ type: 'label', field: '覆盖', style: { fontSize: 16 } })['font-size.px']).toBe(16);
  });
});
