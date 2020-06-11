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

  newPlatform: {
    platform_name: "",
    variables: [{
      key: "",
      value: ""
    }],
    doc_string: "", 
    jsonValidationMessage: ""
  };

  settingsModel: any = {
    platform_list: [],
    platform: {
      platform_name: "",
      variables: [{
        key: "",
        value: ""
      }],
      doc_string: "", 
      jsonValidationMessage: ""
    } as any
  };

  isNewPlatform: boolean = true;
  isVariableUnique: boolean = true;

  constructor (
    private api: ApiService,
    private modal: ModalService,
    private auth: AuthService,
    private route: Router
  ) { }

  ngOnInit() {
    this.isNewPlatform = true;
    this.auth.getUser().then(() => {
      this.cleanPlatformFields();
    });
  }

  /**
   * Update fields after platform selected
   *
   * @param platform
   */
  platformSelected(platform) {
    if (platform) {
      delete platform.servers;//deleting servers from platform is needed for platform updating

      this.isNewPlatform = false;
      this.settingsModel.doc_string = JSON.stringify(platform.doc, undefined, 2);    
    } else {
      this.isNewPlatform = true;
      this.settingsModel.platform = {
        platform_name: "",
        users: [this.auth.user.id],
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

  /**
   * Update platform fields
   *
   * @param data
   */
  updatePlatformFields(data) {
    this.settingsModel.platform = data;
    this.updatePlatformList();
  }

  /**
   * Cleanup platform fields
   */
  cleanPlatformFields() {
    this.isNewPlatform = true;
    this.settingsModel.new_platform_name = "";
    this.settingsModel.doc_string = "";
    this.settingsModel.platform = {
      platform_name: "",
      users: [this.auth.user.id],
      variables: [{
        key: "",
        value: ""
      }],
      doc_string: "", 
      jsonValidationMessage: ""
    };

    this.updatePlatformList();
  }

  /**
   * Update platform list
   */
  updatePlatformList() {
    this.api.get(`platforms`).then((res) => {
      this.settingsModel.platform_list = res;
    });  
  }

  /**
   * Parse JSON documentation to object
   */
  saveDocJson() {
    if (this.settingsModel.doc_string && this.settingsModel.doc_string.length) {
      this.settingsModel.platform.doc = JSON.parse(this.settingsModel.doc_string);
    }
  }

  /**
   * Validate name field
   *
   * @param name
   */
  validateName(name) {
    var res = {
      status: true,
      msg: ""
    };

    if (name) {
      const regex = new RegExp('^[0-9a-zA-Z_-]+$', 'gm');
      if (!regex.test(name)) {
        res.status = false;
        res.msg = 'Platform name is invalid. Please use: letters and numbers only'
      } else {
        res.status = true;
        res.msg = `Let's go`;
      }
    } else {
      res.status = false;
      res.msg = `Platform name can't be empty`;
    }

    return res;
  }

  /**
   * Validate all required fields
   */
  validateRequiredFields() {
    var res = {
      status: true,
      msg: ""
    };

    if (!this.settingsModel.platform.platform_name) {
      res.status = false;
      res.msg = "Platform name is required"
    }
    if (!this.settingsModel.platform.setup_script) {
      res.status = false;
      res.msg = "Setup script is required"
    }
    if (!this.settingsModel.platform.cleanup_script) {
      res.status = false;
      res.msg = "Cleanup script is required"
    }
    if(!this.docUpdated()){
      res.status = false;
      res.msg = "Platform documentation is invalid"
    }

    return res;
  }

  /**
   * Create new platform
   */
  createPlatform() {
    if (!this.isVariableUnique) {
      this.modal.alert(`Variable names should be unique`);
      return;
    }

    if (!this.validateRequiredFields().status) {
      this.modal.alert(this.validateRequiredFields().msg);
      return;
    }

    if (this.validateName(this.settingsModel.platform.platform_name).status) {
      this.modal.confirm(
        `Confirm creating of "${this.settingsModel.platform.platform_name}" platform`,
        "Do you really want to save changes of platform?<br>If yes, please input platform name.",
        (value) => {
          if(value !== this.settingsModel.platform.platform_name )
            return 'Platform name is incorrect!';
        },
        'Yes, please save!',
        'Don`t save'
      ).then(() => {
        this.saveDocJson();
        this.api.create(`platforms`, this.settingsModel.platform).then((res) => {
          this.updatePlatformFields(res);
          this.cleanPlatformFields();

          this.modal.alert(`Platform ${this.settingsModel.platform.platform_name} was successfully created. To proceed working with it, please select it from list in the top of this page.`);
        });

      }, (err) => {
        this.modal.alert(err);
      })
    } else {
      this.modal.alert(this.validateName(this.settingsModel.platform.platform_name).msg);
    }
  }

  /**
   * Update platform
   */
  updatePlatform() {
    if (!this.isVariableUnique) {
      this.modal.alert(`Variable names should be unique`);
      return;
    }

    if (!this.validateRequiredFields().status) {
      this.modal.alert(this.validateRequiredFields().msg);
      return;
    }

    if (this.validateName(this.settingsModel.platform.platform_name ).status) {
      this.modal.confirm(
        `Confirm saving of updates of "${this.settingsModel.platform.platform_name}" platform`,
        "Do you really want to save changes of platform?<br>If yes, please input platform name.",
        (value) => {
          if(value !== this.settingsModel.platform.platform_name )
            return 'Platform name is incorrect!';
        },
        'Yes, please save!',
        'Don`t save'
      ).then((res) => {
        this.saveDocJson();
        this.api.update(`platforms/${this.settingsModel.platform.id}`, this.settingsModel.platform).then(() => this.modal.alert(`Platform ${this.settingsModel.platform.platform_name} was succesfully updated.`));
      }, (err) => {
        this.modal.alert(err);
      })
    } else {
      this.modal.alert(this.validateName(this.settingsModel.platform.platform_name).msg);
    }
  }

  /**
   * Delete platform
   */
  deletePlatform() {
    if (!this.settingsModel.platform.platform_name) {
      this.modal.alert("You can't delete platform with no name");
      return;
    }

    this.modal.confirm(
      `Confirm deletion of "${this.settingsModel.platform.platform_name}" platform`,
      "Do you really want to delete this platform?<br>If yes, please input platform name.",
      (value) => {
        if(value !== this.settingsModel.platform.platform_name)
          return 'Platform name is incorrect!';
      },
      'Yes, please remove!',
      'Don`t remove'
    ).then(() => {
      this.api.remove(`platforms/${this.settingsModel.platform.id}`).then((res) => {
        this.cleanPlatformFields();

        this.modal.alert(`Platform ${this.settingsModel.platform.platform_name} was succesfully removed.`);
      });
    }, (err) => {
      this.modal.alert(err);
    })
  }

  /**
   * Validate if all variables unique
   *
   * @param name
   */
  checkIfVariableUnique(name) {
    this.isVariableUnique = true;

    let sameName = true;
    for (let item of this.settingsModel.platform.variables) {
      if (item.name === name) {
        if(!sameName){
          this.isVariableUnique = false;
          return;
        }

        sameName = false;
      }
    }
  }

  /**
   * Validate if doc not a JSON format
   */
  docUpdated() {
    this.settingsModel.jsonValidationMessage = "";

    try {
      JSON.parse(this.settingsModel.doc_string)
      return true;
    } catch (e) {
      this.settingsModel.jsonValidationMessage = "Json is invalid";
      return false;
    }
  }

  /**
   * Add repeat field block with fields
   *
   * @param arr
   */
  addRepeatField(arr){
    if (this.isVariableUnique) {
      arr.push({value: null});
    }
  }

  /**
   * Remove repeat block with fields
   *
   * @param arr
   * @param key
   */
  removeRepeatField(arr, key){
    arr.splice(key, 1);

    for (let obj of arr) {
      this.checkIfVariableUnique(obj.key);
    }
  }

  /**
   * Clean repeated block fields value
   *
   * @param arr
   */
  cleanFields(arr){
    arr[0].value = null;
  }

}
