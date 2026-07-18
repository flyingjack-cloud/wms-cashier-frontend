import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ReceiptService } from './receipt.service';

describe('ReceiptService', () => {
  let service: ReceiptService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    service = TestBed.inject(ReceiptService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('loads enabled extra templates', () => {
    service.getExtraTemplates().subscribe(result => expect(result[0].code).toBe('invoice'));
    const req = http.expectOne(request => request.url === 'order-extra/templates' && request.params.get('includeDisabled') === 'false');
    expect(req.request.method).toBe('GET');
    req.flush({ code: 200, message: 'Success', timestamp: '', data: [{
      id: 1, code: 'invoice', name: '发票', version: 1, schema: { fields: [] }, enabled: true,
    }] });
  });

  it('saves an order extra payload on the encoded template path', () => {
    service.saveOrderExtra(101, 'invoice cn', { title: '测试' }).subscribe();
    const req = http.expectOne('order/101/extra/invoice%20cn');
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual({ title: '测试' });
    req.flush({ code: 200, message: 'Success', timestamp: '', data: null });
  });

  it('loads extras for multiple orders into an id map', () => {
    let result: Map<number, unknown[]> | undefined;
    service.getExtrasForOrders([101, 102, 101]).subscribe(value => result = value);
    http.expectOne('order/101/extra').flush({ code: 200, message: 'Success', timestamp: '', data: [] });
    http.expectOne('order/102/extra').flush({ code: 200, message: 'Success', timestamp: '', data: [] });
    expect(result?.size).toBe(2);
  });
});
