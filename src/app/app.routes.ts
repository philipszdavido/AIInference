import { Routes } from '@angular/router';
import { SpamClassifier } from './pages/spam-classifier/spam-classifier';
import { ImageAnalyzer } from './pages/image-analyzer/image-analyzer';
import {Home} from './pages/home/home';
import {GraphInspectorProfiler} from "./pages/graph-inspector-profiler/graph-inspector-profiler";
import {EdgeTrainingPipeline} from "./pages/edge-training-pipeline/edge-training-pipeline";
import {DatasetPlayground} from "./pages/dataset-playground/dataset-playground";
import {ModelsManager} from "./pages/models-manager/models-manager";

export const routes: Routes = [
  {
    path: '',
    component: Home,
  },

  {
    path: 'image',
    component: ImageAnalyzer
  },

  { path: 'spam', component: SpamClassifier },
  {
    path: 'models',
    loadComponent: () => import('./pages/models-manager/models-manager').then(m => m.ModelsManager)
  },
  {
    path: 'benchmarks',
    loadComponent: () => import('./pages/benchmarks/benchmarks').then(m => m.Benchmarks)
  },
  {
    path: 'datasets',
    loadComponent: () => import('./pages/dataset-playground/dataset-playground').then(m => m.DatasetPlayground)
  },
  {
    path: 'training',
    loadComponent: () => import('./pages/edge-training-pipeline/edge-training-pipeline').then(m => m.EdgeTrainingPipeline)
  },
  {
    path: 'profiler',
    loadComponent: () => import('./pages/graph-inspector-profiler/graph-inspector-profiler').then(m => m.GraphInspectorProfiler)
  },
  {
    path: 'settings',
    loadComponent: () => import('./pages/settings/settings').then(m => m.Settings)
  },
  {
    path: 'about',
    loadComponent: () => import('./pages/about/about').then(m => m.About)
  },
  {
    path: '**',
    redirectTo: ''
  }
];
