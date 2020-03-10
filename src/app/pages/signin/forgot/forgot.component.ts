import { Component, OnInit } from '@angular/core';
import {AuthService} from '../../../services/auth.service';
import {Router} from '@angular/router';
import { ApiService } from '../../../services/api.service';
import { ModalService } from '../../../services/modal.service';


@Component({
  selector: 'forgot',
  templateUrl: './forgot.component.html',
  styleUrls: ['./forgot.component.css']
})
export class ForgotComponent implements OnInit {
  //Signin credentials
  credentials = {
    identifier: null,
    password: null,
    password_rep: null
  }

  isForgot = false;
  isRegister = false;
  isLogin = true;

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
  }

  reset() {
    this.api.create(`/auth/reset-password`,
    {
      email: `${this.credentials.identifier}`,
      // url: 'http://198.199.125.240:1338/admin/plugins/users-permissions/auth/reset-password'
      url: 'http://localhost:1338/admin/plugins/users-permissions/auth/reset-password'
  })
  .then(response => {
    // Handle success.
    console.log('Your user received an email',  response);
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
