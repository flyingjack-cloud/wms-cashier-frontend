import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { forkJoin, map, Observable, of } from 'rxjs';
import { RESTfulResponse } from '../models/response';
import {
  AvailableReceiptFields,
  OrderExtra,
  OrderExtraTemplate,
  PrinterType,
  ReceiptLayout,
  ReceiptTemplate,
} from '../models/receipt';

@Injectable({ providedIn: 'root' })
export class ReceiptService {
  constructor(private http: HttpClient) {}

  getExtraTemplates(includeDisabled = false): Observable<OrderExtraTemplate[]> {
    const params = new HttpParams().set('includeDisabled', includeDisabled);
    return this.http.get<RESTfulResponse<OrderExtraTemplate[]>>('order-extra/templates', { params }).pipe(map(res => res.data));
  }

  createExtraTemplate(body: Pick<OrderExtraTemplate, 'code' | 'name' | 'schema'>) {
    return this.http.post<RESTfulResponse<OrderExtraTemplate>>('order-extra/templates', body).pipe(map(res => res.data));
  }

  updateExtraTemplate(code: string, body: Pick<OrderExtraTemplate, 'name' | 'schema'>) {
    return this.http.put<RESTfulResponse<OrderExtraTemplate>>(`order-extra/templates/${encodeURIComponent(code)}`, body).pipe(map(res => res.data));
  }

  setExtraTemplateEnabled(code: string, enabled: boolean) {
    return this.http.put<RESTfulResponse<OrderExtraTemplate>>(
      `order-extra/templates/${encodeURIComponent(code)}/enabled`, { enabled },
    ).pipe(map(res => res.data));
  }

  saveOrderExtra(orderId: number, templateCode: string, payload: Record<string, unknown>) {
    return this.http.put(`order/${orderId}/extra/${encodeURIComponent(templateCode)}`, payload);
  }

  getOrderExtras(orderId: number): Observable<OrderExtra[]> {
    if (orderId < 0) return of([]);
    return this.http.get<RESTfulResponse<OrderExtra[]>>(`order/${orderId}/extra`).pipe(map(res => res.data));
  }

  getExtrasForOrders(orderIds: number[]): Observable<Map<number, OrderExtra[]>> {
    const uniqueIds = [...new Set(orderIds.filter(id => id >= 0))];
    if (!uniqueIds.length) return of(new Map());
    return forkJoin(uniqueIds.map(id => this.getOrderExtras(id))).pipe(
      map(results => new Map(uniqueIds.map((id, index) => [id, results[index]]))),
    );
  }

  getReceiptTemplates(includeDisabled = false): Observable<ReceiptTemplate[]> {
    const params = new HttpParams().set('includeDisabled', includeDisabled);
    return this.http.get<RESTfulResponse<ReceiptTemplate[]>>('receipt-templates', { params }).pipe(map(res => res.data));
  }

  getReceiptTemplate(printerType: PrinterType): Observable<ReceiptTemplate> {
    return this.http.get<RESTfulResponse<ReceiptTemplate>>(`receipt-templates/${printerType}`).pipe(map(res => res.data));
  }

  getAvailableFields(): Observable<AvailableReceiptFields> {
    return this.http.get<RESTfulResponse<AvailableReceiptFields>>('receipt-templates/fields').pipe(map(res => res.data));
  }

  createReceiptTemplate(printerType: PrinterType, layout: ReceiptLayout) {
    return this.http.post<RESTfulResponse<ReceiptTemplate>>('receipt-templates', { printerType, layout }).pipe(map(res => res.data));
  }

  updateReceiptTemplate(printerType: PrinterType, layout: ReceiptLayout) {
    return this.http.put<RESTfulResponse<ReceiptTemplate>>(`receipt-templates/${printerType}`, { layout }).pipe(map(res => res.data));
  }

  setReceiptTemplateEnabled(printerType: PrinterType, enabled: boolean) {
    return this.http.put<RESTfulResponse<ReceiptTemplate>>(`receipt-templates/${printerType}/enabled`, { enabled }).pipe(map(res => res.data));
  }
}
