import { Component, OnInit } from '@angular/core';
import {AuthService} from '../../../services/auth.service';
import { ApiService } from '../../../services/api.service';
import { ModalService } from '../../../services/modal.service';
import { ActivatedRoute, Router } from '@angular/router';
import { FormGroup, FormBuilder, FormControl, Validators, AbstractControl } from '@angular/forms';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.css']
})
export class ResetPasswordComponent implements OnInit {
  isLoading = false;

  //Reset form
  resetForm: FormGroup;

  //Errors
  resetError = '';

  //Verification code
  code: "";

  constructor(
      private formBuilder: FormBuilder,
      private auth: AuthService,
      private route: Router,
      private modal: ModalService,
      private activatedRoute: ActivatedRoute,
  ) {
    this.activatedRoute.queryParams.subscribe(params => {
      this.code = params['code']
    });
  }

  ngOnInit() {

    //Prepare reset form validation
    this.resetForm = this.formBuilder.group({
      password: new FormControl('',
          Validators.compose([
            Validators.required
          ])
      ),
      passwordConfirmation: new FormControl('',
          Validators.compose([
            Validators.required
          ])
      )
    }, {
      validator: this.matchPassword
    });
  }

  /**
   * Match password validation
   */
  matchPassword(AC: AbstractControl){
    let password = AC.get('password').value;
    let confirmPassword = AC.get('passwordConfirmation').value;
    if (password != confirmPassword) {
      AC.get('passwordConfirmation').setErrors({ matchPassword: true })
    } else {
      AC.get('passwordConfirmation').setErrors(null)
    }
  }

  reset() {
    if (this.resetForm.invalid)
      return;

    if(!this.code){
      this.resetError = "Verification code are missing";
      return;
    }

    this.isLoading = true;

    //Refresh error
    this.resetError = "";

    //Try to auth
    this.auth.reset(this.resetForm.value, this.code).then((user) => {
      this.isLoading = false;

      // Handle success.
      this.modal.alert("You password has been succesfully reset. Go to signin page and continue using the platform", "Your password is changed!");
      this.route.navigate(['/signin']);
    }, (err) => {
      this.isLoading = false;

      this.resetError = err;
    })

    //Stop form submit
    return false;
  }
}
