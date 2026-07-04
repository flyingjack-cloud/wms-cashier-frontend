import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogCreateStoreComponent } from './dialog-create-store.component';
import { MatDialogRef } from '@angular/material/dialog';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

describe('DialogCreateStoreComponent', () => {
  let component: DialogCreateStoreComponent;
  let fixture: ComponentFixture<DialogCreateStoreComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DialogCreateStoreComponent],
      providers: [
        { provide: MatDialogRef, useValue: {} },
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DialogCreateStoreComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
