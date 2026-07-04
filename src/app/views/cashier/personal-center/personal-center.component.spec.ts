import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PersonalCenterComponent } from './personal-center.component';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';

describe('PersonalCenterComponent', () => {
  let component: PersonalCenterComponent;
  let fixture: ComponentFixture<PersonalCenterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PersonalCenterComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([])
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PersonalCenterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
