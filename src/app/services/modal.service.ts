import { Injectable } from '@angular/core';
import Swal from 'ngx-angular8-sweetalert2';

import guideIntro from './guide/guide-intro.html';

@Injectable({
  providedIn: 'root'
})
export class ModalService {

  index: any;
  lastIndex: any;

  constructor() { 
    this.index = 0;
    this.lastIndex = 5;
  }

  /**
   * Alert modal
   *
   * @param html
   * @param title
   * @param buttonTitle
   * @param icon
   */
  alert(html, title = 'Alert!', buttonTitle = 'Okey', icon = 'warning'): Promise<void>{
    const params = {
      title: title,
      html: html,
      icon: icon,
      confirmButtonText: buttonTitle
    } as any;

    return new Promise((rs, rj) => {
      Swal.fire(params).then((res) => {
        if(res.dismiss){
          rj(res.dismiss)
        }else{
          rs();
        }
      });
    });
  }

  guide(): Promise<void>{
    console.log(this.index);
    var params;
    if (this.index === 0) {
      params = {
        confirmButtonText: 'Next',
        html: guideIntro
      } as any;  
    } else {
      params = {
        confirmButtonText: 'Finish',
        html: guideIntro
      } as any;  
    }

    return new Promise((rs, rj) => {
      Swal.fire(params).then((res) => {
        this.index++;

        if(res.dismiss){
          rj(res.dismiss)
        } else {
          rs();
        } 

        if (this.index <= this.lastIndex) {
          this.guide();
        } else {
          this.index = 0;
        }
      });
    });
  }

  /**
   * Confirm modal
   * @param title
   * @param html
   * @param validationFunc
   * @param confirmText
   * @param cancelText
   *
   * @return Promise<void>
   */
  confirm(title, html, validationFunc = null, confirmText = 'Yes, please delete!', cancelText = 'Don`t delete!'): Promise<void>{
    const params = {
      title: title,
      html: html,
      icon: 'question',
      confirmButtonText: confirmText,
      input: 'text',
      showCancelButton: true,
      cancelButtonText: cancelText
    } as any;

    if(typeof validationFunc === typeof function(){})
      params.inputValidator = validationFunc;

    return new Promise((rs, rj) => {
      Swal.fire(params).then((res) => {
        if(res.dismiss){
          rj(res.dismiss)
        }else{
          rs(res.value || res);
        }
      });
    });
  }
}
