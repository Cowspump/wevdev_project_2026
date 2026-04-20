import { TestBed } from '@angular/core/testing';

import { HomePageComponent } from './home';

describe('HomePageComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HomePageComponent]
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(HomePageComponent);
    const component = fixture.componentInstance;

    expect(component).toBeTruthy();
  });
});