import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ImageAnalyzer } from './image-analyzer';

describe('ImageAnalyzer', () => {
  let component: ImageAnalyzer;
  let fixture: ComponentFixture<ImageAnalyzer>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ImageAnalyzer]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ImageAnalyzer);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
