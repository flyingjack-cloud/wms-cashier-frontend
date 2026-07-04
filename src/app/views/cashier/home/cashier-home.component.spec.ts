import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CashierHomeComponent } from './cashier-home.component';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

describe('HomeComponent', () => {
  let component: CashierHomeComponent;
  let fixture: ComponentFixture<CashierHomeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CashierHomeComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CashierHomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
