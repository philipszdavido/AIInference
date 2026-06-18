import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GraphInspectorProfiler } from './graph-inspector-profiler';

describe('GraphInspectorProfiler', () => {
  let component: GraphInspectorProfiler;
  let fixture: ComponentFixture<GraphInspectorProfiler>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GraphInspectorProfiler]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GraphInspectorProfiler);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
