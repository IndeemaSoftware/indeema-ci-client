import { Component, OnInit } from '@angular/core';
import {Router} from "@angular/router";
import {AuthService} from './services/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {

  constructor(
    private route: Router,
    private auth: AuthService
  ){

  }

  ngOnInit(){
    this.auth.getUser().then((user) => {
      //this.route.navigate(['/runner']);
    }, (err) => {
      this.route.navigate(['/signin']);
    });
  }

  scrollTop() {
    window.scrollTo(0, 1);
  }
}
