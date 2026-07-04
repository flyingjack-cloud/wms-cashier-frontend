import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MerchandiseAccountComponent } from './merchandise-account.component';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

describe('MechandiseAccountComponent', () => {
  let component: MerchandiseAccountComponent;
  let fixture: ComponentFixture<MerchandiseAccountComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MerchandiseAccountComponent],
      providers: [
        { provide: MAT_DIALOG_DATA, useValue: [] },
        { provide: MatDialogRef, useValue: {} }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MerchandiseAccountComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
