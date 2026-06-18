import { Routes } from '@angular/router';
import { SpamClassifier } from './spam-classifier/spam-classifier';
import { ImageAnalyzer } from './image-analyzer/image-analyzer';
import {Home} from './home/home';

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
    path: '**',
    redirectTo: ''
  }
];
