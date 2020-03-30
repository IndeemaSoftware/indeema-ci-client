import { Injectable } from '@angular/core';
import Swal from 'ngx-angular8-sweetalert2';

import guideIntro from './guide/guide-intro.html';
import guideOverview from './guide/guide-overview.html';
import guideStructureGeneral from './guide/guide-structure-general.html';
import guideStructureSettings from './guide/guide-structure-settings.html';
import guideStructureServers from './guide/guide-structure-servers.html';
import guideStructureProjects from './guide/guide-structure-projects.html';
import guideStructureThanks from './guide/guide-structure-thanks.html';

@Injectable({
  providedIn: 'root'
})
export class ModalService {

  index: any;
  guidePageAmount: any;

  constructor() { 
    this.index = 0;
    this.guidePageAmount = 7;
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
    var params;

    if (this.index === 0) {
      params = {
        showCancelButton: true,
        showConfirmButton: false,
        cancelButtonText: 'Next',
        html: guideIntro
      } as any;  
    } else if (this.index === 1) { 
      params = {
        showCancelButton: true,
        showConfirmButton: true,
        cancelButtonText: 'Next',
        confirmButtonText: 'Back',
        html: guideOverview
      } as any;  
    } else if (this.index === 2) { 
      params = {
        showCancelButton: true,
        showConfirmButton: true,
        cancelButtonText: 'Next',
        confirmButtonText: 'Back',
        html: guideStructureGeneral
      } as any;  
    } else if (this.index === 3) { 
      params = {
        showCancelButton: true,
        showConfirmButton: true,
        cancelButtonText: 'Next',
        confirmButtonText: 'Back',
        html: guideStructureSettings
      } as any;  
    } else if (this.index === 4) { 
      params = {
        showCancelButton: true,
        showConfirmButton: true,
        cancelButtonText: 'Next',
        confirmButtonText: 'Back',
        html: guideStructureServers
      } as any;  
    } else if (this.index === 5) { 
      params = {
        showCancelButton: true,
        showConfirmButton: true,
        cancelButtonText: 'Next',
        confirmButtonText: 'Back',
        html: guideStructureProjects
      } as any;  
    } else {
      params = {
        showCancelButton: true,
        showConfirmButton: false,
        cancelButtonText: 'Finish',
        html: guideStructureThanks
      } as any;  
    }

    return new Promise((rs, rj) => {
      Swal.fire(params).then((res) => {
        if (res.dismiss === "cancel") {
          this.index++;
        } else {
          this.index--;
        }

        if(res.dismiss){
          rj(res.dismiss)
        } else {
          rs();
        } 

        if (this.index < this.guidePageAmount) {
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
