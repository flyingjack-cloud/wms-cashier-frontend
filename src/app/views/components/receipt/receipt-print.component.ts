import { ChangeDetectorRef, Component, DOCUMENT, Inject, Input, OnChanges } from '@angular/core';
import { NgClass, NgStyle } from '@angular/common';
import { firstValueFrom } from 'rxjs';
import { Order } from '../../../models/order';
import { GroupService } from '../../../services/group.service';
import { UserService } from '../../../services/user.service';
import { CategoryService } from '../../../services/category.service';
import { ReceiptService } from '../../../services/receipt.service';
import {
  DEFAULT_RECEIPT_LAYOUT,
  OrderExtra,
  PrinterType,
  ReceiptLayout,
  ReceiptLayoutColumn,
  ReceiptStyle,
  ReceiptTableColumn,
  ReceiptTableDetailColumn,
} from '../../../models/receipt';

@Component({
  selector: 'app-receipt',
  standalone: true,
  imports: [NgClass, NgStyle],
  templateUrl: './receipt-print.component.html',
  styleUrl: './receipt-print.component.scss',
})
export class ReceiptPrintComponent implements OnChanges {
  readonly Math = Math;
  @Input() data: Order[] = [];
  @Input() printerType: PrinterType = 'A4';
  @Input() preview = false;
  @Input() previewValues: Record<string, unknown> = {};
  @Input() layout?: ReceiptLayout;
  @Input() extrasByOrder = new Map<number, OrderExtra[]>();

  resolvedLayout: ReceiptLayout = DEFAULT_RECEIPT_LAYOUT;
  private brands = new Map<Order, string>();

  constructor(
    @Inject(DOCUMENT) private document: Document,
    private changeDetectorRef: ChangeDetectorRef,
    private userService: UserService,
    private groupService: GroupService,
    private categoryService: CategoryService,
    private receiptService: ReceiptService,
  ) {}

  ngOnChanges(): void {
    if (this.layout) this.resolvedLayout = this.layout;
  }

  async prepare(): Promise<void> {
    if (this.layout) {
      this.resolvedLayout = this.layout;
    } else {
      try {
        const templates = await firstValueFrom(this.receiptService.getReceiptTemplates());
        this.resolvedLayout = templates.find(template => template.printerType === this.printerType)?.layout ?? DEFAULT_RECEIPT_LAYOUT;
      } catch {
        this.resolvedLayout = DEFAULT_RECEIPT_LAYOUT;
      }
    }

    const missingExtras = this.data.some(order => order.id >= 0 && !this.extrasByOrder.has(order.id));
    if (missingExtras) {
      try {
        this.extrasByOrder = await firstValueFrom(this.receiptService.getExtrasForOrders(this.data.map(order => order.id)));
      } catch {
        this.extrasByOrder = new Map();
      }
    }

    await Promise.all(this.data.map(async order => {
      const parentId = order.merchandise.category.parentId;
      if (parentId == null || parentId < 0) {
        this.brands.set(order, '');
        return;
      }
      try {
        const category = await firstValueFrom(this.categoryService.getCategoryDetailById(parentId));
        this.brands.set(order, category.name);
      } catch {
        this.brands.set(order, '');
      }
    }));
    this.changeDetectorRef.detectChanges();
  }

  async print(): Promise<void> {
    await this.prepare();
    const printSection = this.document.getElementById('print-section');
    if (!printSection) return;

    const printFrame = this.document.createElement('iframe');
    Object.assign(printFrame.style, {
      position: 'fixed', left: '-9999px', top: '0', width: '1px', height: '1px', border: '0',
    });
    this.document.body.appendChild(printFrame);
    const frameDocument = printFrame.contentDocument ?? printFrame.contentWindow?.document;
    if (!frameDocument || !printFrame.contentWindow) {
      printFrame.remove();
      return;
    }

    const orientation = this.resolvedLayout.page?.orientation ?? 'portrait';
    const margin = this.resolvedLayout.page?.margin ?? 16;
    const fontSize = this.pageFontSize();
    const width = this.printerType === 'A4' ? '210mm' : this.printerType === 'THERMAL_58' ? '58mm' : '80mm';
    frameDocument.open();
    frameDocument.write(`<!doctype html><html><head><meta charset="utf-8"><style>
      @page { size: ${this.printerType === 'A4' ? `A4 ${orientation}` : width + ' auto'}; margin: ${margin}mm; }
      * { box-sizing: border-box; }
      body { margin: 0; color: #111; font-size: ${fontSize}px; font-family: Arial, "Microsoft YaHei", sans-serif; }
      .receipt-page { width: 100%; }
      .receipt-row { display: grid; grid-template-columns: repeat(12, minmax(0, 1fr)); align-items: stretch; }
      .receipt-cell { min-width: 0; }
      .receipt-divider { width: 100%; border: 0; border-top: 1px solid #222; }
      table { width: 100%; border-collapse: collapse; table-layout: fixed; }
      th, td { padding: 4px; overflow-wrap: anywhere; }
      .with-border th, .with-border td { border: 1px solid #333; }
      .summary-label { text-align: right; font-weight: 700; }
      .receipt-detail-grid { display: grid; grid-template-columns: repeat(12, minmax(0, 1fr)); width: 100%; }
      .receipt-detail-row > td { padding: 0; }
    </style></head><body>${printSection.innerHTML}</body></html>`);
    frameDocument.close();
    setTimeout(() => {
      printFrame.contentWindow?.focus();
      printFrame.contentWindow?.print();
      setTimeout(() => printFrame.remove(), 1000);
    }, 50);
  }

  cellStyle(column: ReceiptLayoutColumn): Record<string, string | number> {
    const style = column.style ?? {};
    return {
      'grid-column': `span ${this.clamp(column.span ?? 12, 1, 12)}`,
      'font-weight': style.bold ? '700' : '400',
      'font-size.px': this.clamp(style.fontSize ?? this.pageFontSize(), 8, 48),
      'text-align': style.align ?? 'left',
      'vertical-align': style.verticalAlign ?? 'middle',
      'padding.px': this.clamp(style.padding ?? 4, 0, 40),
    };
  }

  dividerStyle(style?: ReceiptStyle): Record<string, string> {
    return {
      'border-top-width.px': String(this.clamp(style?.lineWidth ?? 1, 1, 8)),
      'border-top-style': style?.lineStyle ?? 'solid',
    };
  }

  value(field?: string, order: Order = this.data[0]): unknown {
    if (!field || !order) return '';
    if (this.preview && Object.prototype.hasOwnProperty.call(this.previewValues, field)) {
      return this.previewValues[field];
    }
    const group = this.groupService.groupSubject$.getValue();
    const printedBy = this.userService.profile.getValue().nickname;
    const fixed: Record<string, unknown> = {
      'store.storeName': group.storeName,
      'store.address': group.address,
      'order.sellingTime': order.sellingTime,
      'order.brand': this.brands.get(order) ?? '',
      'order.model': order.merchandise.category.name,
      'order.imei': order.merchandise.imei,
      'order.sellingPrice': order.sellingPrice,
      'order.cost': order.merchandise.cost,
      'cashier.printedBy': printedBy,
    };
    if (field in fixed) return fixed[field];
    const match = /^extra\.([^.]+)\.([^.]+)$/.exec(field);
    if (!match) return '';
    const extra = this.extrasByOrder.get(order.id)?.find(item => item.templateCode === match[1]);
    return extra?.payload[match[2]] ?? '';
  }

  tableValue(column: ReceiptTableColumn, order: Order, index: number): string {
    if (column.type === 'index') return String(index + 1);
    return this.format(this.value(column.field, order), column.format);
  }

  tableColumnWidth(columns: ReceiptTableColumn[], column: ReceiptTableColumn): number {
    const total = columns.reduce((sum, item) => sum + Math.max(1, Number(item.width) || 1), 0);
    return Math.max(1, Number(column.width) || 1) / total * 100;
  }

  detailCellStyle(column: ReceiptTableDetailColumn): Record<string, string | number> {
    return this.cellStyle(column);
  }

  tableRowSpan(detailRowCount = 0): number {
    return Math.max(1, 1 + detailRowCount);
  }

  tableDetailColspan(columns: ReceiptTableColumn[]): number {
    return Math.max(1, columns.length - (columns[0]?.type === 'index' ? 1 : 0));
  }

  previewPageStyle(): Record<string, string> {
    if (!this.preview) return {};
    const landscape = this.resolvedLayout.page?.orientation === 'landscape';
    const margin = this.clamp(this.resolvedLayout.page?.margin ?? 16, 0, 40);
    if (this.printerType === 'A4') {
      return {
        width: landscape ? '100%' : '72%',
        'aspect-ratio': landscape ? '297 / 210' : '210 / 297',
        padding: `${margin * 1.5}px`,
      };
    }
    return {
      width: this.printerType === 'THERMAL_58' ? '230px' : '315px',
      'min-height': '420px',
      padding: `${Math.min(18, margin * 1.5)}px`,
    };
  }

  pageFontSize(): number {
    return this.clamp(this.resolvedLayout.page?.fontSize ?? 12, 8, 48);
  }

  total(field = 'order.sellingPrice'): string {
    const total = this.data.reduce((sum, order) => sum + Number(this.value(field, order) || 0), 0);
    return this.format(total, 'currency');
  }

  format(value: unknown, format: ReceiptTableColumn['format'] = 'text'): string {
    if (value == null || value === '') return '';
    if (format === 'currency') return Number(value).toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    if (format === 'number') return Number(value).toLocaleString('zh-CN');
    if (format === 'date' || format === 'datetime') {
      const date = value instanceof Date ? value : new Date(String(value));
      if (Number.isNaN(date.getTime())) return String(value);
      return new Intl.DateTimeFormat('zh-CN', format === 'date'
        ? { year: 'numeric', month: '2-digit', day: '2-digit' }
        : { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' }
      ).format(date);
    }
    if (value instanceof Date) return this.format(value, 'datetime');
    if (typeof value === 'boolean') return value ? '是' : '否';
    return String(value);
  }

  private clamp(value: number, min: number, max: number): number {
    return Math.min(max, Math.max(min, Number(value) || min));
  }
}
