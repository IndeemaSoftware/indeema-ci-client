import { Component, OnInit } from '@angular/core';
import {AuthService} from '../../services/auth.service';
import {Router} from '@angular/router';
import { ApiService } from '../../services/api.service';
import { ModalService } from '../../services/modal.service';


@Component({
  selector: 'app-signin',
  templateUrl: './signin.component.html',
  styleUrls: ['./signin.component.css']
})
export class SigninComponent implements OnInit {
  //Signin credentials
  credentials = {
    identifier: null,
    password: null,
    password_rep: null
  }

  isForgot = false;
  isRegister = false;
  isLogin = true;

  isLoading = false;

  //Errors
  errors = {
    required: false,
    incorrect: false,
    pass_not_match: false
  };

  constructor(
      private auth: AuthService,
      private route: Router,
      private api: ApiService,
      private modal: ModalService
  ) { }

  ngOnInit() {
    this.auth.getUser().then((user) => {
      this.route.navigate(['/projects']);
    })
    .catch(e => {
    });
  }

  cleanErrors(){
    this.errors.required = false;
    this.errors.incorrect = false;
    this.errors.pass_not_match = false;
  }

  reset() {
    this.isLoading = true;
    this.api.create(`/auth/forgot-password`,
    {
      email: `${this.credentials.identifier}`,
      url: 'http://198.199.125.240:4200/forgot'
      // url: 'http://localhost:4200/forgot'
  })
  .then(response => {
    this.isLoading = false;

    // Handle success.
    this.route.navigate(['/forgot']);
    console.log('Your user received an email');
  })
  .catch(error => {
    this.isLoading = false;
    // Handle error.
    console.log('An error occurred:', error);
  });
  }

  createPressed() {
    console.log("createPressed");
    this.isForgot = false;
    this.isRegister = true;
    this.isLogin = false;
  }

  forgotPressed() {
    this.isForgot = true;
    this.isRegister = false;
    this.isLogin = false;
  }

  signinPressed() {
    this.isForgot = false;
    this.isRegister = false;
    this.isLogin = true;
  }

  validateEmail(mail) {
    if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(mail)) {
      return (true)
    }

    return (false)
  }

  signin() {
    this.cleanErrors();

    //Validate auth object
    if(!this.credentials.identifier || !this.credentials.password){
      this.errors.required = true;
      return false;
    }

    //Try to auth
    this.auth.signin(this.credentials).then((user) => {
      this.route.navigate(['/projects']);
    }, (err) => {
      console.log(err);
      this.errors.incorrect = true;
    })

    //Stop form submit
    return false;
  }

  signup() {
    this.cleanErrors();

    if (!this.validateEmail(this.credentials.identifier)) {
      this.modal.alert("Invalid email format");
      return false;
    }

    if (this.credentials.password !== this.credentials.password_rep) {
      this.errors.pass_not_match = true;
      return false;
    }

    //Validate auth object
    if(!this.credentials.identifier || !this.credentials.password){
      this.errors.required = true;
      return false;
    }

    var nameMatch = this.credentials.identifier.match(/^([^@]*)@/);
    var name = nameMatch ? nameMatch[1] : null;

    if (name !== null) {
      this.api.create(`auth/local/register`, {
        username: name,
        email: this.credentials.identifier,
        password: this.credentials.password
      }).then(() => {
        //Try to auth
        this.auth.signin(this.credentials).then((user) => {
          this.route.navigate(['/projects']);
        }, (err) => {
          this.modal.alert(err);
          this.errors.incorrect = true;
        })
      }, (err) => {
        this.modal.alert(err);
      })
    }

    //Stop form submit
    return false;
  }
}
