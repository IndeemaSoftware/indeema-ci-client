import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../../services/auth.service';
import { ApiService } from '../../../services/api.service';
import { Router } from '@angular/router';
import { ModalService } from '../../../services/modal.service';

@Component({
  selector: 'ci-templates',
  templateUrl: './ci-templates.component.html',
  styleUrls: ['./ci-templates.component.css']
})
export class CITemplatesComponent implements OnInit {

  newMaintenance: {
    name:"",
    yml_code: "", 
    };

  settingsModel: any = {
    maintenance: {
      name:"",
      yml_code: "",
      maintenance_list:[]
    } as any
  };

  isNewMaintenance: boolean = true;

  constructor (
    private api: ApiService,
    private modal: ModalService
  ) { 
  };

  ngOnInit() {
    this.updateMaintenanceList();
  }

  maintenanceSelected(maintenance) {
    if (maintenance) {
      this.isNewMaintenance = false;
      this.settingsModel.yml_code = maintenance.yml_code   
    } else {
      this.isNewMaintenance = true;
      this.settingsModel.maintenance = {
        name:"",
        yml_code:""
      };
      this.cleanMaintenanceFields();
    }
  }

  updateServiceFields(data) {
    this.settingsModel.maintenance = data;
    this.updateMaintenanceList();
  }

  cleanMaintenanceFields() {
    this.isNewMaintenance = true;
    this.settingsModel.new_service_name = "";
    this.settingsModel.yml_code = "";
    this.settingsModel.maintenance = {
      name:"",
      yml_code:""
      };
    this.updateMaintenanceList();
  }

  updateMaintenanceList() {
    this.api.get(`ci-templates`).then((resp) => {
      console.log(resp);
      this.settingsModel.maintenance_list = resp;
    });  
  }

  updateMaintenance() {
    if (!this.settingsModel.maintenance.name) {
      this.modal.alert("You can't update service with no name");
      return;
    }
    this.modal.confirm(
      `Confirm saving of updates of "${this.settingsModel.maintenance.name}" script`,
      "Do you really want to save changes of script?<br>If yes, please input template name.",
      (value) => {
        if(value !== this.settingsModel.maintenance.name )
          return 'Template name is incorrect!';
      },
      'Yes, please save!',
      'Don`t save'
  ).then((res) => {
    this.api.update(`ci-templates/${this.settingsModel.maintenance.id}`, this.settingsModel.maintenance).then((resp) => {
    });

    }, (err) => {
      this.modal.alert(err);
    })
  }

  deleteMaintenance() {
    if (!this.settingsModel.maintenance.name) {
      this.modal.alert("You can't delete service with no name");
      return;
    }
    this.modal.confirm(
      `Confirm deletion of "${this.settingsModel.maintenance.name}" template`,
      "Do you really want to delete this template?<br>If yes, please input template name.",
      (value) => {
        if(value !== this.settingsModel.maintenance.name)
          return 'Template name is incorrect!';
      },
      'Yes, please remove!',
      'Don`t remove'
  ).then((res) => {
    this.api.remove(`ci-templates/${this.settingsModel.maintenance.id}`).then((resp) => {
      this.cleanMaintenanceFields();
    });
    }, (err) => {
      this.modal.alert(err);
    })
  }

  createMaintenance() {
    if (!this.settingsModel.maintenance.name) {
      this.modal.alert("You can't create service with no name");
      return;
    }
    this.modal.confirm(
      `Confirm creating of "${this.settingsModel.maintenance.name}" script`,
      "Do you really want to save changes of script?<br>If yes, please input template name.",
      (value) => {
        if(value !== this.settingsModel.maintenance.name )
          return 'Template name is incorrect!';
      },
      'Yes, please save!',
      'Don`t save'
  ).then((res) => {
    this.api.create(`ci-templates`, this.settingsModel.maintenance).then((resp) => {
      this.updateServiceFields(resp);
      this.cleanMaintenanceFields();
    });  

    }, (err) => {
      this.modal.alert(err);
    })
  }

  preview() {
    window.open(`preview?id=${this.settingsModel.maintenance.id}`, '_blank');
  }
}