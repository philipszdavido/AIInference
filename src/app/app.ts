import { Component, signal, ViewEncapsulation } from '@angular/core';
import {RouterLink, RouterLinkActive, RouterOutlet} from '@angular/router';
import {Footer} from "./footer/footer";
import {NgClass} from "@angular/common";

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, NgClass, RouterLink, RouterLinkActive],
  templateUrl: './app.html',
  standalone: true,
  styleUrl: './app.css',
  encapsulation: ViewEncapsulation.None,
})
export class App {

}
