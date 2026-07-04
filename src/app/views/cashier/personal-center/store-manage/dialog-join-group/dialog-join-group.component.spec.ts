import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogJoinGroupComponent } from './dialog-join-group.component';
import { MatDialogRef } from '@angular/material/dialog';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

describe('DialogJoinGroupComponent', () => {
  let component: DialogJoinGroupComponent;
  let fixture: ComponentFixture<DialogJoinGroupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DialogJoinGroupComponent],
      providers: [
        { provide: MatDialogRef, useValue: {} },
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DialogJoinGroupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
