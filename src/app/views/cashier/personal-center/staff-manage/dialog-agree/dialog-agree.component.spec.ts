import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogAgreeComponent } from './dialog-agree.component';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

describe('DialogAgreeComponent', () => {
  let component: DialogAgreeComponent;
  let fixture: ComponentFixture<DialogAgreeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DialogAgreeComponent],
      providers: [
        { provide: MAT_DIALOG_DATA, useValue: { user: {} } },
        { provide: MatDialogRef, useValue: {} },
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DialogAgreeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
