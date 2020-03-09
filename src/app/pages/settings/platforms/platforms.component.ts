import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../../services/auth.service';
import { ApiService } from '../../../services/api.service';
import { Router } from '@angular/router';
import { ModalService } from '../../../services/modal.service';
import { ConsoleComponent } from '../../console/console.component';

@Component({
  selector: 'platforms',
  templateUrl: './platforms.component.html',
  styleUrls: ['./platforms.component.css']
})
export class PlatformsComponent implements OnInit {

  newPlatform: {
    platform_name:"",
    variables: [{
      key: "",
      value: ""
    }],
    doc_string: "", 
    jsonValidationMessage: ""
    };

  settingsModel: any = {
    platform: {
      platform_name:"",
      variables: [{
        key: "",
        value: ""
      }],
      doc_string: "", 
      jsonValidationMessage: ""
    } as any
  };

  isNewPlatform: boolean = true;

  constructor (
    private api: ApiService,
    private modal: ModalService
  ) { 
  };

  ngOnInit() {
    this.updatePlatformList();
  }

  platformSelected(platform) {
    if (platform) {
      this.isNewPlatform = false;
      this.settingsModel.doc_string = JSON.stringify(platform.doc, undefined, 2);    
    } else {
      this.isNewPlatform = true;
      this.settingsModel.platform = {
        platform_name:"",
        variables: [{
          key: "",
          value: ""
        }],
        doc_string: "", 
        jsonValidationMessage: ""
      };
      this.cleanPlatformFields();
    }
  }

  updatePlatformFields(data) {
    this.settingsModel.platform = data;
    this.updatePlatformList();
  }

  cleanPlatformFields() {
    this.isNewPlatform = true;
    this.settingsModel.new_platform_name = "";
    this.settingsModel.doc_string = "";
    this.settingsModel.platform = {
      platform_name:"",
      variables: [{
        key: "",
        value: ""
      }],
      doc_string: "", 
      jsonValidationMessage: ""
      };
    this.updatePlatformList();
  }

  updatePlatformList() {
    this.api.get(`platforms`).then((resp) => {
      this.settingsModel.platform_list = resp;
    });  
  }

  saveDocJson() {
    if (this.settingsModel.doc_string.length) {
      this.settingsModel.platform.doc = JSON.parse(this.settingsModel.doc_string);
    }
  }

  updatePlatform() {
    if (!this.settingsModel.platform.platform_name) {
      this.modal.alert("You can't update platform with no name");
      return;
    }
    this.modal.confirm(
      `Confirm saving of updates of "${this.settingsModel.platform.platform_name}" script`,
      "Do you really want to save changes of script?<br>If yes, please input template name.",
      (value) => {
        if(value !== this.settingsModel.platform.platform_name )
          return 'Template name is incorrect!';
      },
      'Yes, please save!',
      'Don`t save'
  ).then((res) => {
    this.saveDocJson();
    this.api.update(`platforms/${this.settingsModel.platform.id}`, this.settingsModel.platform).then((resp) => {
    });

    }, (err) => {
      this.modal.alert(err);
    })
  }

  deletePlatform() {
    if (!this.settingsModel.platform.platform_name) {
      this.modal.alert("You can't delete platform with no name");
      return;
    }
    this.modal.confirm(
      `Confirm deletion of "${this.settingsModel.platform.platform_name}" template`,
      "Do you really want to delete this template?<br>If yes, please input template name.",
      (value) => {
        if(value !== this.settingsModel.platform.platform_name)
          return 'Template name is incorrect!';
      },
      'Yes, please remove!',
      'Don`t remove'
  ).then((res) => {
    this.api.remove(`platforms/${this.settingsModel.platform.id}`).then((resp) => {
      this.cleanPlatformFields();
    });
    }, (err) => {
      this.modal.alert(err);
    })
  }

  createPlatform() {
    if (!this.settingsModel.platform.platform_name) {
      this.modal.alert("You can't create platform with no name");
      return;
    }
    this.modal.confirm(
      `Confirm creating of "${this.settingsModel.platform.platform_name}" script`,
      "Do you really want to save changes of script?<br>If yes, please input template name.",
      (value) => {
        if(value !== this.settingsModel.platform.platform_name )
          return 'Template name is incorrect!';
      },
      'Yes, please save!',
      'Don`t save'
  ).then((res) => {
    this.saveDocJson();
    this.api.create(`platforms`, this.settingsModel.platform).then((resp) => {
      this.updatePlatformFields(resp);
      this.cleanPlatformFields();
    });  

    }, (err) => {
      this.modal.alert(err);
    })
  }

  docUpdated() {
    this.settingsModel.jsonValidationMessage = "";

    try {
      JSON.parse(this.settingsModel.doc_string)
    } catch (e) {
      this.settingsModel.jsonValidationMessage = "Json is invalid";
    }
  }

  addRepeatField(arr){
  arr.push({value: null});
  }

  removeRepeatField(arr, key){
    arr.splice(key, 1);
  }

  cleanFields(arr){
    arr[0].value = null;
  }

}