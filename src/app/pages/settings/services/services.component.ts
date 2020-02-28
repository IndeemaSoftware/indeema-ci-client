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

  constructor (
    private api: ApiService,
    private modal: ModalService
  ) { 
  };

  ngOnInit() {
    this.updateServiceList();
  }

  serviceSelected(service) {
    if (service) {
      this.isNewService = false;
      this.settingsModel.doc_string = JSON.stringify(service.doc, undefined, 2);    
    } else {
      this.isNewService = true;
      this.settingsModel.service = {
        service_name:"",
        variables: [{
          key: "",
          value: ""
        }],
        doc_string: "", 
        jsonValidationMessage: ""
      };
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
    this.settingsModel.service = {
      service_name:"",
      variables: [{
        key: "",
        value: ""
      }],
      doc_string: "", 
      jsonValidationMessage: ""
      };
    this.updateServiceList();
  }

  updateServiceList() {
    this.api.get(`services`).then((resp) => {
      console.log(resp);
      this.settingsModel.service_list = resp;
    });  
  }

  saveDocJson() {
    if (this.settingsModel.doc_string.length) {
      this.settingsModel.service.doc = JSON.parse(this.settingsModel.doc_string);
    }
  }

  updateService() {
    if (!this.settingsModel.service.service_name) {
      this.modal.alert("You can't update service with no name");
      return;
    }
    this.modal.confirm(
      `Confirm saving of updates of "${this.settingsModel.service.service_name}" script`,
      "Do you really want to save changes of script?<br>If yes, please input template name.",
      (value) => {
        if(value !== this.settingsModel.service.service_name )
          return 'Template name is incorrect!';
      },
      'Yes, please save!',
      'Don`t save'
  ).then((res) => {
    this.saveDocJson();
    this.api.update(`services/${this.settingsModel.service.id}`, this.settingsModel.service).then((resp) => {
    });

    }, (err) => {
      this.modal.alert(err);
    })
  }

  deleteService() {
    if (!this.settingsModel.service.service_name) {
      this.modal.alert("You can't delete service with no name");
      return;
    }
    this.modal.confirm(
      `Confirm deletion of "${this.settingsModel.service.service_name}" template`,
      "Do you really want to delete this template?<br>If yes, please input template name.",
      (value) => {
        if(value !== this.settingsModel.service.service_name)
          return 'Template name is incorrect!';
      },
      'Yes, please remove!',
      'Don`t remove'
  ).then((res) => {
    this.api.remove(`services/${this.settingsModel.service.id}`).then((resp) => {
      this.cleanServiceFields();
    });
    }, (err) => {
      this.modal.alert(err);
    })
  }

  createService() {
    if (!this.settingsModel.service.service_name) {
      this.modal.alert("You can't create service with no name");
      return;
    }
    this.modal.confirm(
      `Confirm creating of "${this.settingsModel.service.service_name}" script`,
      "Do you really want to save changes of script?<br>If yes, please input template name.",
      (value) => {
        if(value !== this.settingsModel.service.service_name )
          return 'Template name is incorrect!';
      },
      'Yes, please save!',
      'Don`t save'
  ).then((res) => {
    this.saveDocJson();
    this.api.create(`services`, this.settingsModel.service).then((resp) => {
      this.updateServiceFields(resp);
      this.cleanServiceFields();
    });  

    }, (err) => {
      this.modal.alert(err);
    })
  }

  docUpdated() {
    console.log("docUpdated");
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