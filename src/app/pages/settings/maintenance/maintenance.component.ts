import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../../services/auth.service';
import { ApiService } from '../../../services/api.service';
import { Router } from '@angular/router';
import { ModalService } from '../../../services/modal.service';

@Component({
  selector: 'maintenance',
  templateUrl: './maintenance.component.html',
  styleUrls: ['./maintenance.component.css']
})
export class MaintenanceComponent implements OnInit {

  newMaintenance: {
    name:"",
    html_code: "", 
    };

  settingsModel: any = {
    maintenance: {
      name:"",
      html_code: "",
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
      this.settingsModel.html_code = maintenance.html_code   
    } else {
      this.isNewMaintenance = true;
      this.settingsModel.maintenance = {
        name:"",
        html_code:""
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
    this.settingsModel.html_code = "";
    this.settingsModel.maintenance = {
      name:"",
      html_code:""
      };
    this.updateMaintenanceList();
  }

  updateMaintenanceList() {
    this.api.get(`maintenances`).then((resp) => {
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
    this.api.update(`maintenances/${this.settingsModel.maintenance.id}`, this.settingsModel.maintenance).then((resp) => {
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
    this.api.remove(`maintenances/${this.settingsModel.maintenance.id}`).then((resp) => {
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
    this.api.create(`maintenances`, this.settingsModel.maintenance).then((resp) => {
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