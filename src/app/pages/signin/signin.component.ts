import { Component, OnInit } from '@angular/core';
import {AuthService} from '../../services/auth.service';
import {Router} from '@angular/router';
import { ApiService } from '../../services/api.service';


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

  isForgot = false;
  isRegister = false;
  isLogin = true;

  //Errors
  errors = {
    required: false,
    incorrect: false
  };

  constructor(
      private auth: AuthService,
      private route: Router,
      private api: ApiService,
  ) { }

  ngOnInit() {
    this.auth.getUser().then((user) => {
      this.route.navigate(['/projects']);
    })
    .catch(e => {
      console.log(e);
    });
  }

  cleanErrors(){
    this.errors.required = false;
    this.errors.incorrect = false;
  }

  reset() {
    console.log("reset");
    this.api.create(`/auth/forgot-password`,
    {
      email: `${this.credentials.identifier}`,
      url: 'http://198.199.125.240:1338/admin/plugins/users-permissions/auth/reset-password'
  })
  .then(response => {
    // Handle success.
    console.log('Your user received an email');
  })
  .catch(error => {
    // Handle error.
    console.log('An error occurred:', error);
  });
  }

  forgotPressed() {
    this.isForgot = true;
    this.isRegister = false;
    this.isLogin = false;
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
      console.log(user);
      this.route.navigate(['/projects']);
    }, (err) => {
      console.log(err);
      this.errors.incorrect = true;
    })

    //Stop form submit
    return false;
  }
}
