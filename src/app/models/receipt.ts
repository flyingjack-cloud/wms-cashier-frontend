export type ExtraFieldType = 'text' | 'textarea' | 'number' | 'boolean' | 'date' | 'datetime' | 'select';

export interface OrderExtraField {
  key: string;
  label?: string;
  type: ExtraFieldType;
  required?: boolean;
  options?: string[];
}

export interface OrderExtraTemplate {
  id: number;
  code: string;
  name: string;
  version: number;
  schema: { fields: OrderExtraField[] };
  enabled: boolean;
}

export interface OrderExtra {
  orderId: number;
  templateCode: string;
  templateName: string;
  templateVersion: number;
  payload: Record<string, unknown>;
}

export type PrinterType = 'A4' | 'THERMAL_58' | 'THERMAL_80';
export type ReceiptColumnType = 'text' | 'label' | 'divider' | 'table';

export interface ReceiptStyle {
  bold?: boolean;
  fontSize?: number;
  align?: 'left' | 'center' | 'right';
  verticalAlign?: 'top' | 'middle' | 'bottom';
  padding?: number;
  border?: boolean;
  lineWidth?: number;
  lineStyle?: 'solid' | 'dashed' | 'dotted';
}

export interface ReceiptTableColumn {
  type: 'index' | 'field';
  label: string;
  field?: string;
  width?: number;
  format?: 'text' | 'number' | 'currency' | 'date' | 'datetime';
  align?: 'left' | 'center' | 'right';
}

export interface ReceiptTableDetailColumn {
  span?: number;
  type: 'text' | 'label';
  field: string;
  format?: ReceiptTableColumn['format'];
  style?: ReceiptStyle;
}

export interface ReceiptTableDetailRow {
  height?: string;
  columns: ReceiptTableDetailColumn[];
}

export interface ReceiptTableConfig {
  source: 'orders';
  showHeader?: boolean;
  columns: ReceiptTableColumn[];
  detailRows?: ReceiptTableDetailRow[];
  summary?: {
    showCount?: boolean;
    showTotal?: boolean;
    totalField?: string;
    label?: string;
  };
}

export interface ReceiptLayoutColumn {
  span?: number;
  type: ReceiptColumnType;
  field?: string;
  style?: ReceiptStyle;
  table?: ReceiptTableConfig;
}

export interface ReceiptLayoutRow {
  height?: string;
  columns: ReceiptLayoutColumn[];
}

export interface ReceiptLayout {
  page?: {
    orientation?: 'portrait' | 'landscape';
    margin?: number;
    fontSize?: number;
  };
  rows: ReceiptLayoutRow[];
}

export interface ReceiptTemplate {
  id: number;
  printerType: PrinterType;
  layout: ReceiptLayout;
  enabled: boolean;
}

export interface AvailableReceiptField {
  field: string;
  label: string;
  templateCode?: string;
  key?: string;
}

export interface AvailableReceiptFields {
  fixed: AvailableReceiptField[];
  extra: AvailableReceiptField[];
}

export const DEFAULT_RECEIPT_LAYOUT: ReceiptLayout = {
  page: { orientation: 'portrait', margin: 16, fontSize: 12 },
  rows: [
    { columns: [{ span: 12, type: 'text', field: 'store.storeName', style: { bold: true, fontSize: 18, align: 'center' } }] },
    { columns: [
      { span: 2, type: 'label', field: '销售时间：', style: { bold: true } },
      { span: 4, type: 'text', field: 'order.sellingTime' },
      { span: 2, type: 'label', field: '打印人：', style: { bold: true } },
      { span: 4, type: 'text', field: 'cashier.printedBy' },
    ] },
    { columns: [{ span: 12, type: 'divider' }] },
    { columns: [{
      span: 12,
      type: 'table',
      table: {
        source: 'orders',
        showHeader: true,
        columns: [
          { type: 'index', label: '序号', width: 1, align: 'center' },
          { type: 'field', label: '品牌', field: 'order.brand', width: 2 },
          { type: 'field', label: '型号', field: 'order.model', width: 2 },
          { type: 'field', label: 'IMEI', field: 'order.imei', width: 3 },
          { type: 'field', label: '销售价格', field: 'order.sellingPrice', format: 'currency', width: 2, align: 'right' },
        ],
        summary: { showCount: true, showTotal: true, totalField: 'order.sellingPrice', label: '合计' },
      },
      style: { border: true, fontSize: 11 },
    }] },
    { columns: [
      { span: 2, type: 'label', field: '店铺地址：', style: { bold: true } },
      { span: 10, type: 'text', field: 'store.address' },
    ] },
  ],
};
