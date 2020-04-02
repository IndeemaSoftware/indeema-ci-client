import { Component, OnInit } from '@angular/core';
import {AuthService} from '../../../services/auth.service';
import {Router} from '@angular/router';
import {ApiService} from '../../../services/api.service';
import {ModalService} from '../../../services/modal.service';
import { FormGroup, FormBuilder, FormControl, Validators, AbstractControl } from '@angular/forms';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.css']
})
export class ForgotPasswordComponent implements OnInit {
  isLoading = false;

  //Forgot form
  forgotForm: FormGroup;

  //Errors
  forgotError = '';

  constructor(
      private auth: AuthService,
      private route: Router,
      private formBuilder: FormBuilder,
      private modal: ModalService
  ) { }

  ngOnInit() {
    //Prepare forgot form validation
    this.forgotForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  reset() {
    if (this.forgotForm.invalid)
      return;

    this.isLoading = true;

    //Refresh error
    this.forgotError= "";

    //Try to auth
    this.auth.forgot(this.forgotForm.value).then((user) => {
      this.isLoading = false;

      // Handle success.
      this.modal.alert("Please check your email with link to reset password", "Link for reset password is sended!");
      this.route.navigate(['/signin']);
    }, (err) => {
      this.isLoading = false;

      this.forgotError = err;
    })

    //Stop form submit
    return false;
  }

}
