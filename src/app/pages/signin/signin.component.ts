import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, FormControl, Validators, AbstractControl } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';


@Component({
  selector: 'app-signin',
  templateUrl: './signin.component.html',
  styleUrls: ['./signin.component.css']
})
export class SigninComponent implements OnInit {
  isLoading = false;

  //Signin form
  signinForm: FormGroup;

  //Errors
  signinError = '';

  constructor(
      private formBuilder: FormBuilder,
      private auth: AuthService,
      private route: Router
  ) { }

  ngOnInit() {
    //Prepare signin form validation
    this.signinForm = this.formBuilder.group({
      identifier: [null, [Validators.required]],
      password: [null, [Validators.required]]
    });
  }

  /**
   * Sign in submit
   *
   * @return void
   */
  signin() {
    if (this.signinForm.invalid){
      return;
    }

    //Refresh error
    this.signinError = "";

    this.isLoading = true;

    //Try to auth
    this.auth.signin(this.signinForm.value).then((user) => {
      this.isLoading = false;

      this.route.navigate(['/projects']);
    }, (err) => {
      this.isLoading = false;

      this.signinError = 'Username or password is invalid';
    })

    //Stop form submit
    return false;
  }
}
