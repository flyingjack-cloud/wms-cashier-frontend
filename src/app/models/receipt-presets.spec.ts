import {
  SUBSIDY_A4_LAYOUT_PRESET,
  SUBSIDY_TEMPLATE_PRESET,
  SUBSIDY_THERMAL_58_LAYOUT_PRESET,
  SUBSIDY_THERMAL_80_LAYOUT_PRESET,
} from './receipt-presets';

describe('receipt presets', () => {
  it('contains the discoverable subsidy fields used by the A4 layout', () => {
    expect(SUBSIDY_TEMPLATE_PRESET.code).toBe('subsidy');
    expect(SUBSIDY_TEMPLATE_PRESET.name).toBe('国补');
    expect(SUBSIDY_TEMPLATE_PRESET.schema.fields.map(field => field.key)).toEqual([
      'customerName', 'customerAddress', 'customerPhone', 'imei2', 'sn', '69',
    ]);
    expect(JSON.stringify(SUBSIDY_A4_LAYOUT_PRESET)).toContain('extra.subsidy.customerName');
    expect(JSON.stringify(SUBSIDY_A4_LAYOUT_PRESET)).toContain('extra.subsidy.69');
  });

  it('stores valid print dimensions and optimized signature height', () => {
    expect(SUBSIDY_A4_LAYOUT_PRESET.page).toEqual({ margin: 16, fontSize: 14, orientation: 'portrait' });
    expect(SUBSIDY_A4_LAYOUT_PRESET.rows.find(row => row.height)?.height).toBe('80px');
    expect(JSON.stringify(SUBSIDY_A4_LAYOUT_PRESET)).not.toContain('"fontSize":null');
  });

  it('covers every fixed and subsidy field in both thermal layouts', () => {
    const requiredFields = [
      'store.storeName', 'store.address', 'order.sellingTime', 'order.brand', 'order.model',
      'order.imei', 'order.sellingPrice', 'order.cost', 'cashier.printedBy',
      'extra.subsidy.customerName', 'extra.subsidy.customerAddress', 'extra.subsidy.customerPhone',
      'extra.subsidy.imei2', 'extra.subsidy.sn', 'extra.subsidy.69',
    ];
    for (const layout of [SUBSIDY_THERMAL_58_LAYOUT_PRESET, SUBSIDY_THERMAL_80_LAYOUT_PRESET]) {
      const json = JSON.stringify(layout);
      for (const field of requiredFields) expect(json).withContext(field).toContain(field);
    }
  });

  it('uses compact, unit-safe thermal page settings', () => {
    expect(SUBSIDY_THERMAL_58_LAYOUT_PRESET.page).toEqual({ margin: 2, fontSize: 9, orientation: 'portrait' });
    expect(SUBSIDY_THERMAL_80_LAYOUT_PRESET.page).toEqual({ margin: 3, fontSize: 10, orientation: 'portrait' });
    expect(JSON.stringify(SUBSIDY_THERMAL_58_LAYOUT_PRESET)).not.toMatch(/"height":"\d+"/);
    expect(JSON.stringify(SUBSIDY_THERMAL_80_LAYOUT_PRESET)).not.toMatch(/"height":"\d+"/);
  });
});
