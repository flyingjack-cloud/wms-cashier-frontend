import { Component, Inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MAT_DIALOG_DATA, MatDialogActions, MatDialogContent, MatDialogRef, MatDialogTitle } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { forkJoin } from 'rxjs';
import { Order } from '../../../../models/order';
import { OrderExtraField, OrderExtraTemplate } from '../../../../models/receipt';
import { ReceiptService } from '../../../../services/receipt.service';
import { ToastService } from '../../../../services/toast.service';

@Component({
  selector: 'app-order-extra-dialog',
  standalone: true,
  imports: [
    FormsModule, MatButtonModule, MatCheckboxModule, MatDialogActions, MatDialogContent,
    MatDialogTitle, MatFormFieldModule, MatInputModule, MatProgressBarModule,
    MatSelectModule, MatSlideToggleModule,
  ],
  templateUrl: './order-extra-dialog.component.html',
  styleUrl: './order-extra-dialog.component.scss',
})
export class OrderExtraDialogComponent implements OnInit {
  templates: OrderExtraTemplate[] = [];
  existingCodes = new Set<string>();
  selectedTemplates: Record<string, boolean> = {};
  payloads: Record<string, Record<string, unknown>> = {};
  loading = true;
  saving = false;

  constructor(
    @Inject(MAT_DIALOG_DATA) public order: Order,
    private dialogRef: MatDialogRef<OrderExtraDialogComponent>,
    private receipts: ReceiptService,
    private toast: ToastService,
  ) {}

  ngOnInit(): void {
    forkJoin({
      templates: this.receipts.getExtraTemplates(),
      extras: this.receipts.getOrderExtras(this.order.id),
    }).subscribe({
      next: ({ templates, extras }) => {
        this.templates = templates;
        for (const template of templates) {
          const existing = extras.find(extra => extra.templateCode === template.code);
          if (existing) this.existingCodes.add(template.code);
          this.selectedTemplates[template.code] = !!existing;
          this.payloads[template.code] = { ...(existing?.payload ?? {}) };
          for (const field of template.schema.fields) {
            if (!(field.key in this.payloads[template.code])) {
              this.payloads[template.code][field.key] = field.type === 'boolean' ? false : '';
            }
          }
        }
        this.loading = false;
      },
      error: () => this.loading = false,
    });
  }

  fieldLabel(field: OrderExtraField): string { return field.label || field.key; }
  isExisting(code: string): boolean { return this.existingCodes.has(code); }

  save(): void {
    if (this.saving || !this.validate()) return;
    const targets = this.templates.filter(template => this.isExisting(template.code) || this.selectedTemplates[template.code]);
    if (!targets.length) {
      this.toast.push('请选择要添加的附加信息', 'warning');
      return;
    }
    this.saving = true;
    forkJoin(targets.map(template =>
      this.receipts.saveOrderExtra(this.order.id, template.code, this.payloadFor(template)),
    )).subscribe({
      next: () => {
        this.toast.push('订单附加信息已保存', 'success');
        this.dialogRef.close({ updated: true });
      },
      error: () => this.saving = false,
    });
  }

  close(): void { this.dialogRef.close(); }

  private validate(): boolean {
    for (const template of this.templates.filter(item => this.isExisting(item.code) || this.selectedTemplates[item.code])) {
      for (const field of template.schema.fields) {
        const value = this.payloads[template.code][field.key];
        if (field.required && (value == null || value === '')) {
          this.toast.push(`${template.name}：${this.fieldLabel(field)}为必填项`, 'warning');
          return false;
        }
      }
    }
    return true;
  }

  private payloadFor(template: OrderExtraTemplate): Record<string, unknown> {
    return Object.fromEntries(Object.entries(this.payloads[template.code])
      .filter(([, value]) => value !== '' && value != null));
  }
}
