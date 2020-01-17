import { Component, OnInit } from '@angular/core';
import {Router} from '@angular/router';
import {AuthService} from '../../services/auth.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  constructor(
      private route: Router,
      private auth: AuthService
  ){

  }

  ngOnInit(){
    this.auth.getUser().then((user) => {
      this.route.navigate(['/projects']);
    }, (err) => {
      this.route.navigate(['/signin']);
    });
  }

}
