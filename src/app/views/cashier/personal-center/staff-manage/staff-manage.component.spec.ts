import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StaffManageComponent } from './staff-manage.component';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

describe('StaffManageComponent', () => {
  let component: StaffManageComponent;
  let fixture: ComponentFixture<StaffManageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StaffManageComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StaffManageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
