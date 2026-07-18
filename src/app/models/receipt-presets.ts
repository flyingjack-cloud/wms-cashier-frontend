import { OrderExtraTemplate, ReceiptLayout } from './receipt';

export const SUBSIDY_TEMPLATE_PRESET: Pick<OrderExtraTemplate, 'code' | 'name' | 'schema'> = {
  code: 'subsidy',
  name: '国补',
  schema: {
    fields: [
      { key: 'customerName', label: '客户姓名', type: 'text', required: false },
      { key: 'customerAddress', label: '客户地址', type: 'textarea', required: false },
      { key: 'customerPhone', label: '客户电话', type: 'text', required: false },
      { key: 'imei2', label: '串号2', type: 'text', required: false },
      { key: 'sn', label: 'SN序列号', type: 'text', required: false },
      { key: '69', label: '69码', type: 'text', required: false },
    ],
  },
};

export const SUBSIDY_A4_LAYOUT_PRESET: ReceiptLayout = {
  page: { margin: 16, fontSize: 14, orientation: 'portrait' },
  rows: [
    { columns: [
      { span: 12, type: 'text', field: 'store.storeName', style: { bold: true, align: 'center', fontSize: 18 } },
    ] },
    { columns: [{ span: 12, type: 'divider', style: {} }] },
    { columns: [
      { span: 2, type: 'label', field: '客户姓名：', style: { bold: true, align: 'left' } },
      { span: 4, type: 'text', field: 'extra.subsidy.customerName', style: { align: 'left' } },
      { span: 2, type: 'label', field: '销售时间：', style: { bold: true, align: 'left' } },
      { span: 4, type: 'text', field: 'order.sellingTime', style: {} },
    ] },
    { columns: [
      { span: 2, type: 'label', field: '收货地址', style: { bold: true } },
      { span: 10, type: 'text', field: 'extra.subsidy.customerAddress', style: { align: 'left' } },
    ] },
    { columns: [{
      span: 12,
      type: 'table',
      style: {},
      table: {
        source: 'orders',
        showHeader: true,
        columns: [
          { type: 'index', align: 'center', label: '序号', width: 1 },
          { type: 'field', field: 'order.brand', label: '品牌', width: 2 },
          { type: 'field', field: 'order.model', label: '型号', width: 2 },
          { type: 'field', field: 'order.imei', label: 'IMEI', width: 3 },
          { type: 'field', align: 'right', field: 'order.sellingPrice', label: '销售价格', width: 2, format: 'currency' },
        ],
        detailRows: [
          { columns: [
            { span: 2, type: 'label', field: '串号2：', style: { bold: true } },
            { span: 10, type: 'text', field: 'extra.subsidy.imei2', style: {} },
          ] },
          { columns: [
            { span: 2, type: 'label', field: 'SN：', style: { bold: true } },
            { span: 4, type: 'text', field: 'extra.subsidy.sn', style: {} },
            { span: 2, type: 'label', field: '69码：', style: { bold: true } },
            { span: 4, type: 'text', field: 'extra.subsidy.69', style: {} },
          ] },
        ],
        summary: { label: '合计', showCount: true, showTotal: true, totalField: 'order.sellingPrice' },
      },
    }] },
    { columns: [
      { span: 2, type: 'label', field: '店铺地址：', style: { bold: true } },
      { span: 4, type: 'text', field: 'store.address', style: {} },
      { span: 2, type: 'label', field: '销售员：', style: { bold: true } },
      { span: 4, type: 'text', field: 'cashier.printedBy', style: {} },
    ] },
    { height: '80px', columns: [
      { span: 12, type: 'label', field: '客户签名：', style: { bold: true } },
    ] },
    { columns: [
      { span: 12, type: 'label', field: '谢谢惠顾，欢迎下次光临！', style: { bold: true, align: 'center' } },
    ] },
  ],
};

export const SUBSIDY_THERMAL_58_LAYOUT_PRESET: ReceiptLayout = {
  page: { margin: 2, fontSize: 9, orientation: 'portrait' },
  rows: [
    { columns: [{ span: 12, type: 'text', field: 'store.storeName', style: { bold: true, align: 'center', fontSize: 13 } }] },
    { columns: [
      { span: 3, type: 'label', field: '地址：', style: { bold: true } },
      { span: 9, type: 'text', field: 'store.address', style: { fontSize: 8 } },
    ] },
    { columns: [
      { span: 3, type: 'label', field: '时间：', style: { bold: true } },
      { span: 9, type: 'text', field: 'order.sellingTime', style: { fontSize: 8 } },
    ] },
    { columns: [
      { span: 3, type: 'label', field: '打印人：', style: { bold: true } },
      { span: 9, type: 'text', field: 'cashier.printedBy', style: {} },
    ] },
    { columns: [{ span: 12, type: 'divider', style: {} }] },
    { columns: [
      { span: 3, type: 'label', field: '客户：', style: { bold: true } },
      { span: 9, type: 'text', field: 'extra.subsidy.customerName', style: {} },
    ] },
    { columns: [
      { span: 3, type: 'label', field: '电话：', style: { bold: true } },
      { span: 9, type: 'text', field: 'extra.subsidy.customerPhone', style: {} },
    ] },
    { columns: [
      { span: 3, type: 'label', field: '收货：', style: { bold: true } },
      { span: 9, type: 'text', field: 'extra.subsidy.customerAddress', style: { fontSize: 8 } },
    ] },
    { columns: [{ span: 12, type: 'divider', style: {} }] },
    { columns: [{
      span: 12,
      type: 'table',
      style: { fontSize: 9 },
      table: {
        source: 'orders',
        showHeader: true,
        columns: [
          { type: 'index', align: 'center', label: '#', width: 1 },
          { type: 'field', field: 'order.model', label: '型号', width: 6 },
          { type: 'field', align: 'right', field: 'order.sellingPrice', label: '售价', width: 5, format: 'currency' },
        ],
        detailRows: [
          { columns: [
            { span: 3, type: 'label', field: '品牌：', style: { bold: true, fontSize: 8 } },
            { span: 9, type: 'text', field: 'order.brand', style: { fontSize: 8 } },
          ] },
          { columns: [
            { span: 3, type: 'label', field: 'IMEI：', style: { bold: true, fontSize: 8 } },
            { span: 9, type: 'text', field: 'order.imei', style: { fontSize: 8 } },
          ] },
          { columns: [
            { span: 3, type: 'label', field: '成本：', style: { bold: true, fontSize: 8 } },
            { span: 9, type: 'text', field: 'order.cost', format: 'currency', style: { fontSize: 8 } },
          ] },
          { columns: [
            { span: 3, type: 'label', field: '串号2：', style: { bold: true, fontSize: 8 } },
            { span: 9, type: 'text', field: 'extra.subsidy.imei2', style: { fontSize: 8 } },
          ] },
          { columns: [
            { span: 3, type: 'label', field: 'SN：', style: { bold: true, fontSize: 8 } },
            { span: 9, type: 'text', field: 'extra.subsidy.sn', style: { fontSize: 8 } },
          ] },
          { columns: [
            { span: 3, type: 'label', field: '69码：', style: { bold: true, fontSize: 8 } },
            { span: 9, type: 'text', field: 'extra.subsidy.69', style: { fontSize: 8 } },
          ] },
        ],
        summary: { label: '合计', showCount: true, showTotal: true, totalField: 'order.sellingPrice' },
      },
    }] },
    { height: '42px', columns: [{ span: 12, type: 'label', field: '客户签名：', style: { bold: true } }] },
    { columns: [{ span: 12, type: 'label', field: '谢谢惠顾，欢迎下次光临！', style: { bold: true, align: 'center' } }] },
  ],
};

export const SUBSIDY_THERMAL_80_LAYOUT_PRESET: ReceiptLayout = {
  page: { margin: 3, fontSize: 10, orientation: 'portrait' },
  rows: [
    { columns: [{ span: 12, type: 'text', field: 'store.storeName', style: { bold: true, align: 'center', fontSize: 15 } }] },
    { columns: [
      { span: 2, type: 'label', field: '地址：', style: { bold: true } },
      { span: 10, type: 'text', field: 'store.address', style: { fontSize: 9 } },
    ] },
    { columns: [
      { span: 2, type: 'label', field: '时间：', style: { bold: true } },
      { span: 6, type: 'text', field: 'order.sellingTime', style: { fontSize: 9 } },
      { span: 2, type: 'label', field: '打印：', style: { bold: true } },
      { span: 2, type: 'text', field: 'cashier.printedBy', style: {} },
    ] },
    { columns: [{ span: 12, type: 'divider', style: {} }] },
    { columns: [
      { span: 2, type: 'label', field: '客户：', style: { bold: true } },
      { span: 4, type: 'text', field: 'extra.subsidy.customerName', style: {} },
      { span: 2, type: 'label', field: '电话：', style: { bold: true } },
      { span: 4, type: 'text', field: 'extra.subsidy.customerPhone', style: {} },
    ] },
    { columns: [
      { span: 2, type: 'label', field: '收货：', style: { bold: true } },
      { span: 10, type: 'text', field: 'extra.subsidy.customerAddress', style: { fontSize: 9 } },
    ] },
    { columns: [{ span: 12, type: 'divider', style: {} }] },
    { columns: [{
      span: 12,
      type: 'table',
      style: { fontSize: 10 },
      table: {
        source: 'orders',
        showHeader: true,
        columns: [
          { type: 'index', align: 'center', label: '#', width: 1 },
          { type: 'field', field: 'order.brand', label: '品牌', width: 3 },
          { type: 'field', field: 'order.model', label: '型号', width: 4 },
          { type: 'field', align: 'right', field: 'order.sellingPrice', label: '售价', width: 4, format: 'currency' },
        ],
        detailRows: [
          { columns: [
            { span: 2, type: 'label', field: 'IMEI：', style: { bold: true, fontSize: 9 } },
            { span: 6, type: 'text', field: 'order.imei', style: { fontSize: 9 } },
            { span: 2, type: 'label', field: '成本：', style: { bold: true, fontSize: 9 } },
            { span: 2, type: 'text', field: 'order.cost', format: 'currency', style: { fontSize: 9 } },
          ] },
          { columns: [
            { span: 2, type: 'label', field: '串号2：', style: { bold: true, fontSize: 9 } },
            { span: 10, type: 'text', field: 'extra.subsidy.imei2', style: { fontSize: 9 } },
          ] },
          { columns: [
            { span: 2, type: 'label', field: 'SN：', style: { bold: true, fontSize: 9 } },
            { span: 4, type: 'text', field: 'extra.subsidy.sn', style: { fontSize: 9 } },
            { span: 2, type: 'label', field: '69码：', style: { bold: true, fontSize: 9 } },
            { span: 4, type: 'text', field: 'extra.subsidy.69', style: { fontSize: 9 } },
          ] },
        ],
        summary: { label: '合计', showCount: true, showTotal: true, totalField: 'order.sellingPrice' },
      },
    }] },
    { height: '50px', columns: [{ span: 12, type: 'label', field: '客户签名：', style: { bold: true } }] },
    { columns: [{ span: 12, type: 'label', field: '谢谢惠顾，欢迎下次光临！', style: { bold: true, align: 'center' } }] },
  ],
};
