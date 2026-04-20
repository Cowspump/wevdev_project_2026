import { TestBed } from '@angular/core/testing';

import { WeekPageComponent } from './week';

describe('WeekPageComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WeekPageComponent]
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(WeekPageComponent);
    const component = fixture.componentInstance;

    expect(component).toBeTruthy();
  });
});