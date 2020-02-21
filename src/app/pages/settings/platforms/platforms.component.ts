import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../../services/auth.service';
import { ApiService } from '../../../services/api.service';
import { Router } from '@angular/router';
import { ModalService } from '../../../services/modal.service';

@Component({
  selector: 'platforms',
  templateUrl: './platforms.component.html',
  styleUrls: ['./platforms.component.css']
})
export class PlatformsComponent implements OnInit {

  settingsModel: any = {
    platform: {
      variables: [{
        key: "",
        value: ""
      }],
      setup_script: false,
      cleanup_script: false     
    } as any
  };

  constructor(
    private api: ApiService,
    private auth: AuthService,
    private route: Router,
    private modal: ModalService
  ) { };

  ngOnInit() {
    this.auth.getUser().then((user) => {
      this.updatePlatformList();
    }, (err) => {
      this.route.navigate(['signin']);
    });
  }

  updatePlatformFields(data) {
    this.settingsModel.new_platform_name = "";
    this.settingsModel.platform = data;
    this.updatePlatformList();
    this.platformSelected();
  }

  cleanPlatfomFields() {
    this.settingsModel.new_platform_name = "";
    this.settingsModel.platform_setup_script = "";
    this.settingsModel.platform_cleanup_script = "";
    this.settingsModel.doc = "";
    this.settingsModel.platform = {
      setup_script: false,
      cleanup_script: false  
    };
    this.updatePlatformList();
  }

  updatePlatformList() {
    this.api.get(`platform/listAll`).then((resp) => {
      if (resp.status === "bad") {
        console.log(resp);
        this.modal.alert(resp.data);
      } else {
        this.settingsModel.platform_list = resp.data;
      }
    });  
  }

  platformSelected(){
    this.api.get(`platform/download/${this.settingsModel.platform.platform_name}`).then((resp) => {
      if (resp.status === "bad") {
        this.modal.alert(resp.data);
      } else {
        this.settingsModel.platform_setup_script = resp.data;
      }
    });  

    this.api.get(`platform/cleanup/download/${this.settingsModel.platform.platform_name}`).then((resp) => {
      if (resp.status === "bad") {
        this.modal.alert(resp.data);
      } else {
        this.settingsModel.platform_cleanup_script = resp.data;
      }
    });  
  }

  duplicatePlatform(){
    this.settingsModel.platform_list.forEach(item => {
      if (item == this.settingsModel.new_platform_name){
        this.modal.alert(`Template with this name already exist, please change the name`);
        return;
      }
    });

    this.api.create(`platform/${this.settingsModel.new_platform_name}`, {"data":this.settingsModel.platform_setup_script, "platform":this.settingsModel.platform}).then((resp) => {
      if (resp.status == "ok")  {
        this.api.create(`platform/cleanup/${this.settingsModel.new_platform_name}`, {"data":this.settingsModel.platform_cleanup_script, "platform":this.settingsModel.platform}).then((resp) => {
          if (resp.status == "ok")  {
            this.updatePlatformFields(resp.data);
          } else {
            this.modal.alert(resp.data);
          }
        });
      } else {
        this.modal.alert(resp.data);
      }
    });
  }

  deletePlatform() {
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
    this.api.remove(`platform/${this.settingsModel.platform.platform_name}`).then((resp) => {
      if (resp.status == "ok")  {
        this.api.remove(`platform/cleanup/${this.settingsModel.platform.platform_name}`).then((resp) => {
          if (resp.status == "ok")  {
            this.cleanPlatfomFields();
          } else {
            this.modal.alert(resp.data);
          }
        });
      } else {
        this.modal.alert(resp.data);
      }
    });
    }, (err) => {
      this.modal.alert(err);
    })
  }

  savePlatformScript() {
    var name = this.settingsModel.platform.platform_name
    var newPlatform = false;
    if (!name) {
      name = this.settingsModel.new_platform_name;
      newPlatform = true;
    }

    this.modal.confirm(
      `Confirm saving of updates of "${name}" script`,
      "Do you really want to save changes of script?<br>If yes, please input template name.",
      (value) => {
        if(value !== name)
          return 'Template name is incorrect!';
      },
      'Yes, please save!',
      'Don`t save'
  ).then((res) => {
    this.api.create(`platform/${name}`, {"data":this.settingsModel.platform_setup_script, "platform":this.settingsModel.platform}).then((resp) => {
      if (resp.status == "ok")  {
        this.api.create(`platform/cleanup/${name}`, {"data":this.settingsModel.platform_cleanup_script, "platform":this.settingsModel.platform}).then((resp) => {
          if (resp.status == "ok")  {
            this.updatePlatformFields(resp.data);
          } else {
            this.modal.alert(resp.data);
          }
        });
      } else {
        this.modal.alert(resp.data);
      }
    });

    }, (err) => {
      this.modal.alert(err);
    })
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