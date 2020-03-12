import { Component, OnInit } from '@angular/core';
import {AuthService} from '../../../services/auth.service';
import { ApiService } from '../../../services/api.service';
import { ModalService } from '../../../services/modal.service';
import { ActivatedRoute, Router } from '@angular/router';


@Component({
  selector: 'forgot',
  templateUrl: './forgot.component.html',
  styleUrls: ['./forgot.component.css']
})
export class ForgotComponent implements OnInit {
  //Signin credentials
  credentials = {
    password: null,
    password_rep: null
  }

  isForgot = false;
  isRegister = false;
  isLogin = true;

  code: "";

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
      private modal: ModalService,
      private activatedRoute: ActivatedRoute,
  ) { 
    this.activatedRoute.queryParams.subscribe(params => {
      this.code = params['code']
    });   
  }

  ngOnInit() {
  }

  reset() {
    this.api.create(`/auth/reset-password`, {
      password: this.credentials.password,
      passwordConfirmation: this.credentials.password,
      code:this.code
  })
  .then(response => {
    // Handle success.
    this.modal.alert("You password has been succesfully reset. Go to signin page and continue using the platform");
  })
  .catch(error => {
    // Handle error.
    console.log('An error occurred:', error);
  });
  }

  signinPressed() {
    this.route.navigate(['/signin']);
  }
}
