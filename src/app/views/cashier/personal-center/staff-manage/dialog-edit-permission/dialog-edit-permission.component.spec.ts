import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogEditPermissionComponent } from './dialog-edit-permission.component';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

describe('DialogEditPermissionComponent', () => {
  let component: DialogEditPermissionComponent;
  let fixture: ComponentFixture<DialogEditPermissionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DialogEditPermissionComponent],
      providers: [
        { provide: MAT_DIALOG_DATA, useValue: { user: {} } },
        { provide: MatDialogRef, useValue: {} },
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DialogEditPermissionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
