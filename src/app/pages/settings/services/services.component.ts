import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../../services/auth.service';
import { ApiService } from '../../../services/api.service';
import { Router } from '@angular/router';
import { ModalService } from '../../../services/modal.service';
import { ConsoleComponent } from '../../console/console.component';

@Component({
  selector: 'services',
  templateUrl: './services.component.html',
  styleUrls: ['./services.component.css']
})
export class ServicesComponent implements OnInit {

  newService: {
    service_name:"",
    variables: [{
      key: "",
      value: ""
    }],
    doc_string: "", 
    jsonValidationMessage: ""
    };

  settingsModel: any = {
    service_list:[],
    service: {
      service_name:"",
      variables: [{
        key: "",
        value: ""
      }],
      doc_string: "", 
      jsonValidationMessage: ""
    } as any
  };

  isNewService: boolean = true;

  isVariableUnique: boolean = true;

  constructor (
    private api: ApiService,
    private modal: ModalService,
    private auth: AuthService,
  ) { 
  };

  ngOnInit() {
    if (this.settingsModel.service_list.length === 0) {
      this.selected();
    }
  }

  selected() {
    this.auth.getUser().then((user) => {
      this.updateServiceList();
      this.initUser();
    });
  }

  initUser() {
    this.settingsModel.service = {
      service_name:"",
      users: [this.auth.user.id],
      variables: [{
        key: "",
        value: ""
      }],
      doc_string: "", 
      jsonValidationMessage: ""
    };
  }

  serviceSelected(service) {
    if (service) {
      delete service.apps;//deleting servers from platform is needed for platform updating

      this.isNewService = false;
      this.settingsModel.doc_string = JSON.stringify(service.doc, undefined, 2);    
    } else {
      this.isNewService = true;
      this.cleanServiceFields();
    }
  }

  updateServiceFields(data) {
    this.settingsModel.service = data;
    this.updateServiceList();
  }

  cleanServiceFields() {
    this.isNewService = true;
    this.settingsModel.new_service_name = "";
    this.settingsModel.doc_string = "";
    this.initUser();
    this.updateServiceList();
  }

  updateServiceList() {
    this.api.get(`services`).then((resp) => {
      this.settingsModel.service_list = resp;
    });  
  }

  saveDocJson() {
    if (this.settingsModel.doc_string && this.settingsModel.doc_string.length) {
      this.settingsModel.service.doc = JSON.parse(this.settingsModel.doc_string);
    }
  }

  validateName(name) {
    var res = {status:true, msg:""};

    if (name) {
        const regex = new RegExp('^[0-9a-zA-Z_-]+$', 'gm');
  
        if (!regex.test(name)) {
            res.status = false;
            res.msg = 'Service name is invalid. Please use: letters and numbers only'
        } else {
            res.status = true;
            res.msg = `Let's go`;  
        }
    } else {
      res.status = false;
      res.msg = `Service name can't be empty`;
    }

    return res;
  }

  validateRequiredFields() {
    var res = {status:true, msg:""};

    if (!this.settingsModel.service.service_name) {
        res.status = false;
        res.msg = "Service name is required"
    }
    if (!this.settingsModel.service.setup_script) {
        res.status = false;
        res.msg = "Setup script is required"
    }
    if (!this.settingsModel.service.cleanup_script) {
        res.status = false;
        res.msg = "Cleanup script is required"
    }

    return res;
  }

  updateService() {
    var name = this.settingsModel.service.service_name;

    if (!this.isVariableUnique) {
      this.modal.alert(`Variable names should be unique`);
      return;
    }


    if (!this.validateRequiredFields().status) {
      this.modal.alert(this.validateRequiredFields().msg);
      return;
    }

    if (this.validateName(name).status) {
      this.modal.confirm(
        `Confirm saving of updates of "${name}" service`,
        "Do you really want to save changes of service?<br>If yes, please input service name.",
        (value) => {
          if(value !== name )
            return 'Service name is incorrect!';
        },
        'Yes, please save!',
        'Don`t save'
    ).then((res) => {
      this.saveDocJson();
      this.api.update(`services/${this.settingsModel.service.id}`, this.settingsModel.service).then((resp) => {
      });
        this.modal.alert(`Service ${name} was succesfully updated.`);  
      }, (err) => {
        this.modal.alert(err);
      })
    } else {
      this.modal.alert(this.validateName(name).msg);
    }
  }

  deleteService() {
    if (!this.settingsModel.service.service_name) {
      this.modal.alert("You can't delete service with no name");
      return;
    }
    this.modal.confirm(
      `Confirm deletion of "${this.settingsModel.service.service_name}" service`,
      "Do you really want to delete this service?<br>If yes, please input service name.",
      (value) => {
        if(value !== this.settingsModel.service.service_name)
          return 'Service name is incorrect!';
      },
      'Yes, please remove!',
      'Don`t remove'
  ).then((res) => {
    this.api.remove(`services/${this.settingsModel.service.id}`).then((resp) => {
      this.cleanServiceFields();
      this.modal.alert(`Service ${name} was succesfully removed.`);  
    });
    }, (err) => {
      this.modal.alert(err);
    })
  }

  createService() {
    var name = this.settingsModel.service.service_name;

    if (!this.isVariableUnique) {
      this.modal.alert(`Variable names should be unique`);
      return;
    }


    if (!this.validateRequiredFields().status) {
      this.modal.alert(this.validateRequiredFields().msg);
      return;
    }

    if (this.validateName(name).status) {
      this.modal.confirm(
        `Confirm creating of "${name}" service`,
        "Do you really want to save changes of service?<br>If yes, please input service name.",
        (value) => {
          if (value !== name)
            return 'Service name is incorrect!';
        },
        'Yes, please create!',
        'Don`t create'
    ).then((res) => {
      this.saveDocJson();
      console.log(this.settingsModel.service);
      this.api.create(`services`, this.settingsModel.service).then((resp) => {
        this.updateServiceFields(resp);
        this.cleanServiceFields();
        this.modal.alert(`Service ${name} was succesfully created. To proceed working with it please select it from list in the top of page.`);  
      });  
  
      }, (err) => {
        this.modal.alert(err);
      })    
    } else {
      this.modal.alert(this.validateName(name).msg);
    }
  }

  variableNameChange(name) {
    var count = 0;

    for (let v of this.settingsModel.service.variables) {
      if (v.name === name) {
        count++;
      }
    }

    if (count > 1) {
      this.isVariableUnique = false;
    } else {
      this.isVariableUnique = true;
    }
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

    for (let obj of arr) {
      this.variableNameChange(obj.key);
    }
  }

  cleanFields(arr){
    arr[0].value = null;
  }

}