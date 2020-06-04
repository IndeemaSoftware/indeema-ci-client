import { Injectable } from '@angular/core';
import { Restangular } from 'ngx-restangular';
import { StorageService } from './storage.service';
import {environment} from '../../environments/environment';
import { Router } from '@angular/router';
import {ApiService} from './api.service';
import {ModalService} from './modal.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  //Handle loading profile to attempt few request in one time
  isLoading = false;

  //User object
  user: any;

  constructor(
      private rest: Restangular,
      private storage: StorageService,
      private router: Router,
      private api: ApiService,
      private modal: ModalService
  ) {}

  getJWT(){
    return this.storage.get(environment.AUTH_KEY);
  }

  /**
   * Get user account
   *
   * @param force boolean - if true - script update user anyway
   * @return {Promise}
   */
  getUser(force = false): Promise<any> {
    return new Promise((resolve, reject) => {
      if(this.user && this.user._id && !force){
        resolve(this.user);
        return;
      }

      if(this.isLoading){
        setTimeout(() => {
          this.getUser().then((user) => resolve(user), (err) => reject(err));
        }, 1000);
        return;
      }
      if (this.storage.isExists(environment.AUTH_KEY)){

        //User JWT
        const userJWT = this.storage.get(environment.AUTH_KEY);

        //Setup rest angular header
        this.rest = this.rest.withConfig((RestangularConfigurer) => {
          RestangularConfigurer.setDefaultHeaders({ 'Authorization': 'Bearer ' + userJWT });
        });

        //Update API service JWT
        this.api.setJWT(userJWT);

        //Block any requests to get user
        this.isLoading = true;

        //Get user
        this.rest.all("users/me").customGET().toPromise().then(
          (user) => {

            //Setup user
            this.user = user;

            //Unblock
            this.isLoading = false;

            resolve(user);
            return;
          }, (err) => {

            //Unblock
            this.isLoading = false;

            this.modal.alert(err.data.message, 'Auth error!');

            this.logout();
            reject();
          });

      }else{
        reject();
      }
    });
  }

  /**
   * Logout current user
   *
   * @return void
   */
  logout(){
    this.user = null;

    this.storage.destroy(environment.AUTH_KEY);

    //Setup rest angular header
    this.rest = this.rest.withConfig((RestangularConfigurer) => {
      RestangularConfigurer.setDefaultHeaders({ 'Authorization': undefined });
    });

    //Update API service JWT
    this.api.setJWT();

    this.router.navigate(['/signin']);
  }

  /**
   * Authorize account
   *
   * @param jwt string
   * @param user object or null
   * @return void
   */
  auth(jwt, user = null){
    //Save JWT Token
    this.storage.createOrUpdate(environment.AUTH_KEY, jwt);

    //Setup rest angular header
    this.rest = this.rest.withConfig((RestangularConfigurer) => {
      RestangularConfigurer.setDefaultHeaders({ 'Authorization': 'Bearer ' + jwt });
    });

    //Update API service JWT
    this.api.setJWT(jwt);

    //Set profile account
    if(user){
      this.user = user;

      if (!this.user.confirmed) {
        this.modal.alert('You need to confirm your email address.', 'Alert!');
      }

    }else{
      this.rest.all("users/me").customGET().toPromise(
        (user) => {
          //Setup user
          this.user = user;

          if (!this.user.confirmed){
            this.modal.alert('You need to confirm your email address.', 'Alert!');
          }
        },
        (err) => {
          this.modal.alert(err.data.message , 'Auth failed!');
        });
    }
  }

  /**
   * Sign in action
   *
   * @param credentials Object with identifier string - email or username and password string
   * @return Promise
   */
  signin(credentials) : Promise<Object> {
    return new Promise((resolve, reject) => {
      this.rest.all('auth/local').customPOST(credentials).toPromise()
        .then((result) => {
          //Make
          this.auth(result.jwt, result.user);

          resolve(result.user);
        },
        (err) => {
          console.error('ERROR', err);

          //Parse errors
          if (err.data.statusCode === 400) {
            reject(err.data.message[0].messages[0].message || err.data.message);
          }
        })
    });
  }

  /**
   * Sign up action
   *
   * @param credentials Object with identifier string - email, password and passwordConfirmation string
   * @return Promise
   */
  signup(credentials) : Promise<Object> {
    return new Promise((resolve, reject) => {
      credentials.username = credentials.email.split('@')[0];

      this.rest.all('auth/local/register').customPOST(credentials).toPromise()
        .then((result) => {
            //Make
            this.auth(result.jwt, result.user);

            resolve(result.user);
          },
          (err) => {
            console.error('ERROR', err);

            //Parse errors
            if (err.data.statusCode === 400) {
              reject(err.data.message[0].messages[0].message || err.data.message);
            }
          });
    });
  }

  /**
   * Forgot password action
   *
   * @param credentials Object with email string
   * @return Promise
   */
  forgot(credentials) : Promise<Object> {
    return new Promise((resolve, reject) => {
      credentials.url = `${window.location.origin}/reset-password`;


      this.rest.all('auth/forgot-password').customPOST(credentials).toPromise()
        .then((result) => {
            resolve(result);
          },
          (err) => {
            console.error('ERROR', err);

            //Parse errors
            if (err.data.statusCode === 400) {
              reject(err.data.message[0].messages[0].message || err.data.message);
            }
          });
    });
  }

  /**
   * Reset password action
   *
   * @param credentials Object with password and passwordConfiration string
   * @param code string
   * @return Promise
   */
  reset(credentials, code) : Promise<Object> {
    return new Promise((resolve, reject) => {
      credentials.code = code;

      this.rest.all('auth/reset-password').customPOST(credentials).toPromise()
          .then((result) => {
                resolve(result);
              },
              (err) => {
                console.error('ERROR', err);

                //Parse errors
                if (err.data.statusCode === 400) {
                  reject(err.data.message[0].messages[0].message || err.data.message);
                }
              });
    });
  }
}
