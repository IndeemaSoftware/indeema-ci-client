import { Component, OnInit } from '@angular/core';
import {AuthService} from '../../services/auth.service';
import {Router} from '@angular/router';

@Component({
  selector: 'app-signin',
  templateUrl: './signin.component.html',
  styleUrls: ['./signin.component.css']
})
export class SigninComponent implements OnInit {
  //Signin credentials
  credentials = {
    identifier: null,
    password: null
  }

  //Errors
  errors = {
    required: false,
    incorrect: false
  };

  constructor(
      private auth: AuthService,
      private route: Router
  ) { }

  ngOnInit() {
    this.auth.getUser().then((user) => {
      this.route.navigate(['/runner']);
    });
  }

  cleanErrors(){
    this.errors.required = false;
    this.errors.incorrect = false;
  }

  signin(){
    this.cleanErrors();

    //Validate auth object
    if(!this.credentials.identifier || !this.credentials.password){
      this.errors.required = true;
      return false;
    }

    //Try to auth
    this.auth.signin(this.credentials).then((user) => {
      this.route.navigate(['/runner']);
    }, (err) => {
      this.errors.incorrect = true;
    })

    //Stop form submit
    return false;
  }
}
