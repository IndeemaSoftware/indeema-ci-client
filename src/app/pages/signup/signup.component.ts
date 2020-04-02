import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, FormControl, Validators, AbstractControl } from '@angular/forms';
import {AuthService} from '../../services/auth.service';
import {Router} from '@angular/router';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent implements OnInit {
  isLoading = false;

  //Signup form
  signupForm: FormGroup;

  //Errors
  signupError = '';


  constructor(
      private formBuilder: FormBuilder,
      private auth: AuthService,
      private route: Router
  ) { }

  ngOnInit() {

    //Prepare signup form validation
    this.signupForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: new FormControl('',
          Validators.compose([
            Validators.required
          ])
      ),
      passwordConfirmation: new FormControl('',
          Validators.compose([
            Validators.required
          ])
      ),
      terms: [true, Validators.requiredTrue]
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

  signup() {
    if (this.signupForm.invalid)
      return;

    //Refresh error
    this.signupError = "";

    this.isLoading = true;

    //Try to auth
    this.auth.signup(this.signupForm.value).then((user) => {
      this.isLoading = false;

      this.route.navigate(['/projects']);
    }, (err) => {
      this.isLoading = false;

      this.signupError = err;
    })

    //Stop form submit
    return false;
  }

}
