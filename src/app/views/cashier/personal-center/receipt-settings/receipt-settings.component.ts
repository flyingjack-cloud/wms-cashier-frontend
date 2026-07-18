import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTabsModule } from '@angular/material/tabs';
import { firstValueFrom, forkJoin } from 'rxjs';
import { ReceiptService } from '../../../../services/receipt.service';
import { ToastService } from '../../../../services/toast.service';
import { Order } from '../../../../models/order';
import {
  AvailableReceiptField,
  DEFAULT_RECEIPT_LAYOUT,
  ExtraFieldType,
  OrderExtraField,
  OrderExtraTemplate,
  PrinterType,
  ReceiptColumnType,
  ReceiptLayout,
  ReceiptLayoutColumn,
  ReceiptTableColumn,
  ReceiptTableDetailColumn,
  ReceiptTemplate,
} from '../../../../models/receipt';
import { ReceiptPrintComponent } from '../../../components/receipt/receipt-print.component';
import {
  SUBSIDY_A4_LAYOUT_PRESET,
  SUBSIDY_TEMPLATE_PRESET,
  SUBSIDY_THERMAL_58_LAYOUT_PRESET,
  SUBSIDY_THERMAL_80_LAYOUT_PRESET,
} from '../../../../models/receipt-presets';

@Component({
  selector: 'app-receipt-settings',
  standalone: true,
  imports: [
    FormsModule, MatButtonModule, MatCheckboxModule, MatFormFieldModule, MatIconModule,
    MatInputModule, MatSelectModule, MatSlideToggleModule, MatTabsModule, ReceiptPrintComponent,
  ],
  templateUrl: './receipt-settings.component.html',
  styleUrl: './receipt-settings.component.scss',
})
export class ReceiptSettingsComponent implements OnInit {
  readonly printerTypes: { value: PrinterType; label: string }[] = [
    { value: 'A4', label: 'A4' },
    { value: 'THERMAL_58', label: '58mm 热敏纸' },
    { value: 'THERMAL_80', label: '80mm 热敏纸' },
  ];
  readonly fieldTypes: { value: ExtraFieldType; label: string }[] = [
    { value: 'text', label: '单行文本' }, { value: 'textarea', label: '多行文本' },
    { value: 'number', label: '数字' }, { value: 'boolean', label: '开关' },
    { value: 'date', label: '日期' }, { value: 'datetime', label: '日期时间' },
    { value: 'select', label: '下拉选择' },
  ];
  readonly columnTypes: { value: ReceiptColumnType; label: string }[] = [
    { value: 'label', label: '固定文字' }, { value: 'text', label: '绑定字段' },
    { value: 'divider', label: '分隔线' }, { value: 'table', label: '商品表格' },
  ];

  extraTemplates: OrderExtraTemplate[] = [];
  editingExtra: { code: string; name: string; schema: { fields: OrderExtraField[] } } | null = null;
  editingExistingCode: string | null = null;
  receiptTemplates: ReceiptTemplate[] = [];
  availableFields: AvailableReceiptField[] = [];
  printerType: PrinterType = 'A4';
  layout: ReceiptLayout = this.clone(DEFAULT_RECEIPT_LAYOUT);
  loading = false;
  previewValues: Record<string, unknown> = {};

  sampleOrders: Order[] = [];

  constructor(private receipts: ReceiptService, private toast: ToastService) {}

  ngOnInit(): void { this.reload(); }

  canInstallSubsidyPreset(): boolean {
    const hasSubsidy = this.extraTemplates.some(template => template.code === 'subsidy');
    const configuredPrinters = new Set(this.receiptTemplates.map(template => template.printerType));
    return !hasSubsidy || this.printerTypes.some(type => !configuredPrinters.has(type.value));
  }

  async installSubsidyPreset(): Promise<void> {
    if (this.loading || !this.canInstallSubsidyPreset()) return;
    this.loading = true;
    try {
      if (!this.extraTemplates.some(template => template.code === 'subsidy')) {
        await firstValueFrom(this.receipts.createExtraTemplate(this.clone(SUBSIDY_TEMPLATE_PRESET)));
      }
      const presets: { printerType: PrinterType; layout: ReceiptLayout }[] = [
        { printerType: 'A4', layout: SUBSIDY_A4_LAYOUT_PRESET },
        { printerType: 'THERMAL_58', layout: SUBSIDY_THERMAL_58_LAYOUT_PRESET },
        { printerType: 'THERMAL_80', layout: SUBSIDY_THERMAL_80_LAYOUT_PRESET },
      ];
      for (const preset of presets) {
        if (!this.receiptTemplates.some(template => template.printerType === preset.printerType)) {
          await firstValueFrom(this.receipts.createReceiptTemplate(preset.printerType, this.clone(preset.layout)));
        }
      }
      this.toast.push('国补模板和 A4、58mm、80mm 打印布局已补齐', 'success');
    } catch {
      this.toast.push('初始化未全部完成，已保留成功创建的部分', 'warning');
    } finally {
      this.reload();
    }
  }

  reload(): void {
    this.loading = true;
    forkJoin({
      extras: this.receipts.getExtraTemplates(true),
      receipts: this.receipts.getReceiptTemplates(true),
      fields: this.receipts.getAvailableFields(),
    }).subscribe({
      next: result => {
        this.extraTemplates = result.extras;
        this.receiptTemplates = result.receipts;
        this.availableFields = [...result.fields.fixed, ...result.fields.extra];
        this.refreshPreviewData();
        this.selectPrinter(this.printerType);
        this.loading = false;
      },
      error: () => this.loading = false,
    });
  }

  newExtra(): void {
    this.editingExistingCode = null;
    this.editingExtra = { code: '', name: '', schema: { fields: [] } };
  }

  editExtra(template: OrderExtraTemplate): void {
    this.editingExistingCode = template.code;
    this.editingExtra = this.clone({ code: template.code, name: template.name, schema: template.schema });
  }

  addExtraField(): void {
    this.editingExtra?.schema.fields.push({ key: '', label: '', type: 'text', required: false });
  }

  removeExtraField(index: number): void { this.editingExtra?.schema.fields.splice(index, 1); }

  optionsText(field: OrderExtraField): string { return (field.options ?? []).join(','); }
  setOptions(field: OrderExtraField, value: string): void {
    field.options = value.split(',').map(item => item.trim()).filter(Boolean);
  }

  saveExtra(): void {
    if (!this.editingExtra?.code.trim() || !this.editingExtra.name.trim() || !this.editingExtra.schema.fields.length) {
      this.toast.push('请填写模板名称、编码并至少添加一个字段', 'warning');
      return;
    }
    const keys = this.editingExtra.schema.fields.map(field => field.key.trim());
    if (keys.some(key => !key) || new Set(keys).size !== keys.length) {
      this.toast.push('字段 key 不能为空且不能重复', 'warning');
      return;
    }
    if (this.editingExtra.schema.fields.some(field => field.type === 'select' && !field.options?.length)) {
      this.toast.push('下拉选择字段至少需要一个选项', 'warning');
      return;
    }
    const request = this.editingExistingCode
      ? this.receipts.updateExtraTemplate(this.editingExistingCode, { name: this.editingExtra.name, schema: this.editingExtra.schema })
      : this.receipts.createExtraTemplate(this.editingExtra);
    request.subscribe({ next: () => { this.toast.push('附加信息模板已保存', 'success'); this.editingExtra = null; this.reload(); } });
  }

  toggleExtra(template: OrderExtraTemplate): void {
    this.receipts.setExtraTemplateEnabled(template.code, !template.enabled).subscribe({ next: () => this.reload() });
  }

  selectPrinter(type: PrinterType): void {
    this.printerType = type;
    this.layout = this.clone(this.receiptTemplates.find(item => item.printerType === type)?.layout ?? DEFAULT_RECEIPT_LAYOUT);
    this.layout.page ??= { orientation: 'portrait', margin: 16, fontSize: 12 };
    this.layout.page.fontSize ??= 12;
    for (const row of this.layout.rows) {
      for (const column of row.columns) {
        column.style ??= {};
        for (const detailRow of column.table?.detailRows ?? []) {
          for (const detailColumn of detailRow.columns) detailColumn.style ??= {};
        }
      }
    }
  }

  refreshPreviewData(): void {
    const now = new Date();
    const suffix = String(Math.floor(1000 + Math.random() * 9000));
    this.sampleOrders = [
      this.previewOrder(-1, `测试型号 ${suffix.slice(0, 2)}`, `8600000000${suffix}`, 3699, 2999, now),
      this.previewOrder(-2, `测试型号 ${suffix.slice(2)}`, `8610000000${suffix}`, 4288, 3500, now),
    ];
    this.previewValues = {
      'store.storeName': `测试门店 ${suffix}`,
      'store.address': '测试市示例区幸福路 88 号',
      'cashier.printedBy': '测试收银员',
      'order.sellingTime': now,
      'order.brand': '测试品牌',
    };
    for (const field of this.availableFields.filter(item => item.field.startsWith('extra.'))) {
      this.previewValues[field.field] = `测试${field.label}`;
    }
  }

  addRow(): void { this.layout.rows.push({ columns: [{ span: 12, type: 'label', field: '新内容', style: {} }] }); }
  removeRow(index: number): void { if (this.layout.rows.length > 1) this.layout.rows.splice(index, 1); }
  moveRow(index: number, offset: number): void {
    const target = index + offset;
    if (target < 0 || target >= this.layout.rows.length) return;
    [this.layout.rows[index], this.layout.rows[target]] = [this.layout.rows[target], this.layout.rows[index]];
  }
  addColumn(rowIndex: number): void { this.layout.rows[rowIndex].columns.push({ span: 6, type: 'label', field: '文字', style: {} }); }
  removeColumn(rowIndex: number, columnIndex: number): void {
    if (this.layout.rows[rowIndex].columns.length > 1) this.layout.rows[rowIndex].columns.splice(columnIndex, 1);
  }
  changeColumnType(column: ReceiptLayoutColumn): void {
    if (column.type === 'label') column.field = '文字';
    if (column.type === 'text') column.field = this.availableFields[0]?.field ?? 'store.storeName';
    if (column.type === 'divider') delete column.field;
    if (column.type === 'table') {
      delete column.field;
      column.table = this.clone(DEFAULT_RECEIPT_LAYOUT.rows[3].columns[0].table!);
      column.span = 12;
    } else delete column.table;
  }
  addTableColumn(column: ReceiptLayoutColumn): void {
    column.table?.columns.push({ type: 'field', label: '字段', field: this.availableFields[0]?.field, width: 2 });
  }
  removeTableColumn(column: ReceiptLayoutColumn, index: number): void { column.table?.columns.splice(index, 1); }
  changeTableColumnType(column: ReceiptTableColumn): void {
    if (column.type === 'index') delete column.field;
    else column.field = this.availableFields[0]?.field;
  }
  addTableDetailRow(column: ReceiptLayoutColumn): void {
    if (!column.table) return;
    column.table.detailRows ??= [];
    column.table.detailRows.push({
      columns: [
        { span: 2, type: 'label', field: '附加信息：', style: { bold: true } },
        { span: 10, type: 'text', field: this.availableFields[0]?.field ?? 'store.storeName', style: {} },
      ],
    });
  }
  removeTableDetailRow(column: ReceiptLayoutColumn, rowIndex: number): void {
    column.table?.detailRows?.splice(rowIndex, 1);
  }
  addTableDetailColumn(column: ReceiptLayoutColumn, rowIndex: number): void {
    column.table?.detailRows?.[rowIndex].columns.push({ span: 6, type: 'label', field: '文字', style: {} });
  }
  removeTableDetailColumn(column: ReceiptLayoutColumn, rowIndex: number, columnIndex: number): void {
    const detailRow = column.table?.detailRows?.[rowIndex];
    if (detailRow && detailRow.columns.length > 1) detailRow.columns.splice(columnIndex, 1);
  }
  changeDetailColumnType(column: ReceiptTableDetailColumn): void {
    column.field = column.type === 'label' ? '文字' : this.availableFields[0]?.field ?? 'store.storeName';
  }

  resetLayout(): void { this.layout = this.clone(DEFAULT_RECEIPT_LAYOUT); this.selectPrinterLayoutDefaults(); }

  saveLayout(): void {
    if (!this.validateLayout()) return;
    const existing = this.receiptTemplates.find(item => item.printerType === this.printerType);
    const request = existing
      ? this.receipts.updateReceiptTemplate(this.printerType, this.layout)
      : this.receipts.createReceiptTemplate(this.printerType, this.layout);
    request.subscribe({ next: () => { this.toast.push('打印模板已保存', 'success'); this.reload(); } });
  }

  toggleReceipt(): void {
    const existing = this.receiptTemplates.find(item => item.printerType === this.printerType);
    if (!existing) return;
    this.receipts.setReceiptTemplateEnabled(this.printerType, !existing.enabled).subscribe({ next: () => this.reload() });
  }

  currentReceipt(): ReceiptTemplate | undefined { return this.receiptTemplates.find(item => item.printerType === this.printerType); }
  printerTypeLabel(): string { return this.printerTypes.find(item => item.value === this.printerType)?.label ?? this.printerType; }
  fieldLabel(path?: string): string { return this.availableFields.find(item => item.field === path)?.label ?? path ?? ''; }

  private validateLayout(): boolean {
    const pageFontSize = Number(this.layout.page?.fontSize ?? 12);
    if (pageFontSize < 8 || pageFontSize > 48) {
      this.toast.push('默认字号必须在 8px 到 48px 之间', 'warning');
      return false;
    }
    if (!this.layout.rows.length || this.layout.rows.some(row => !row.columns.length)) {
      this.toast.push('布局至少需要一行且每行至少一个格子', 'warning');
      return false;
    }
    const available = new Set(this.availableFields.map(field => field.field));
    for (const [index, row] of this.layout.rows.entries()) {
      const spans = row.columns.map(column => Number(column.span ?? 12));
      if (spans.some(span => span < 1 || span > 12) || spans.reduce((sum, span) => sum + span, 0) > 12) {
        this.toast.push(`第 ${index + 1} 行的格子总宽度不能超过 12`, 'warning');
        return false;
      }
      for (const column of row.columns) {
        if (column.type === 'text' && !available.has(column.field ?? '')) {
          this.toast.push(`第 ${index + 1} 行存在失效的绑定字段`, 'warning');
          return false;
        }
        if (column.type === 'table') {
          if (!column.table?.columns.length) {
            this.toast.push(`第 ${index + 1} 行的商品表格至少需要一列`, 'warning');
            return false;
          }
          if (column.table.columns.some(item => item.type === 'field' && !available.has(item.field ?? ''))) {
            this.toast.push(`第 ${index + 1} 行的商品表格存在失效字段`, 'warning');
            return false;
          }
          if (column.table.detailRows?.length && column.table.columns[0]?.type !== 'index') {
            this.toast.push(`第 ${index + 1} 行的商品表格使用副行时，第一列必须是序号`, 'warning');
            return false;
          }
          for (const detailRow of column.table.detailRows ?? []) {
            if (!detailRow.columns.length) {
              this.toast.push(`第 ${index + 1} 行的商品副行至少需要一个格子`, 'warning');
              return false;
            }
            const detailSpans = detailRow.columns.map(item => Number(item.span ?? 12));
            if (detailSpans.some(span => span < 1 || span > 12) || detailSpans.reduce((sum, span) => sum + span, 0) > 12) {
              this.toast.push(`第 ${index + 1} 行的商品副行总宽度不能超过 12`, 'warning');
              return false;
            }
            if (detailRow.columns.some(item => item.type === 'text' && !available.has(item.field))) {
              this.toast.push(`第 ${index + 1} 行的商品副行存在失效字段`, 'warning');
              return false;
            }
          }
        }
      }
    }
    return true;
  }

  private clone<T>(value: T): T { return structuredClone(value); }
  private previewOrder(id: number, model: string, imei: string, sellingPrice: number, cost: number, sellingTime: Date): Order {
    return {
      id,
      merchandise: {
        id,
        category: { id, parentId: -1, name: model },
        cost,
        price: sellingPrice,
        imei,
        sold: true,
        createTime: sellingTime,
      },
      sellingPrice,
      remark: '测试订单',
      sellingTime,
      returned: false,
    };
  }
  private selectPrinterLayoutDefaults(): void {
    this.layout.page ??= { orientation: 'portrait', margin: 16, fontSize: 12 };
    this.layout.page.fontSize ??= 12;
    for (const row of this.layout.rows) for (const column of row.columns) {
      column.style ??= {};
      for (const detailRow of column.table?.detailRows ?? []) {
        for (const detailColumn of detailRow.columns) detailColumn.style ??= {};
      }
    }
  }
}
