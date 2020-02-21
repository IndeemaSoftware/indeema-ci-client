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

  settingsModel: any = {
  };

  maintenance: null
  new_naimtenance_name: null

  constructor(
    private api: ApiService,
    private auth: AuthService,
    private route: Router,
    private modal: ModalService
  ) { };

  ngOnInit() {
    this.auth.getUser().then((user) => {
      this.updateMaintenanceList();
    }, (err) => {
      this.route.navigate(['signin']);
    });
  }

  updateMaintenanceFields(data) {
    this.settingsModel.new_maintenance_name = "";
    this.settingsModel.maintenance_script = data;
    this.maintenanceSelected();
    this.updateMaintenanceList();
  }

  updateMaintenanceList() {
    this.api.get(`maintenance/listAll`).then((resp) => {
    this.settingsModel.maintenance_list = resp.data;
    });  
  }

  maintenanceSelected() {
    this.api.get(`maintenance/download/${this.settingsModel.maintenance}`).then((resp) => {
      this.settingsModel.maintenance_script = resp.data;
    });  

    this.updateMaintenanceList();
  }

  duplicateMaintenance() {
    this.settingsModel.maintenance_list.forEach(item => {
      if (item == this.settingsModel.new_maintenance_name){
        this.modal.alert(`Maintenance page with this name already exist, please change the name`);
        return;
      }
    });

    this.api.create(`maintenance/${this.settingsModel.new_maintenance_name}`, {"data":this.settingsModel.maintenance_script}).then((resp) => {
      if (resp.status == "ok")  {
        this.updateMaintenanceFields(resp.data);
      }
    });
  }

  deleteMaintenance() {
    //Ask to delete CI template
    this.modal.confirm(
      `Confirm deletion of "${this.settingsModel.maintenance}" maintenance`,
      "Do you really want to delete this maintenance?<br>If yes, please input maintenance name.",
      (value) => {
        if(value !== this.settingsModel.maintenance)
          return 'Template name is incorrect!';
      },
      'Yes, please remove!',
      'Don`t remove'
  ).then((res) => {
    this.api.remove(`maintenance/${this.settingsModel.maintenance}`).then((resp) => {
      if (resp.status == "ok")  {
        this.settingsModel.new_maintenance_name = "";
        this.settingsModel.maintenance_script = "";
        this.settingsModel.maintenance = null;
        this.updateMaintenanceList();
      }
    });
    }, (err) => {
      this.modal.alert(err);
    })
  }

  saveMaintenanceScript() {
    this.modal.confirm(
      `Confirm saving of updates of "${this.settingsModel.maintenance}" template`,
      "Do you really want to save changes of template?<br>If yes, please input template name.",
      (value) => {
        if(value !== this.settingsModel.maintenance)
          return 'Template name is incorrect!';
      },
      'Yes, please save!',
      'Don`t save'
  ).then((res) => {
    this.api.create(`ci/template/${this.settingsModel.ci}/${this.settingsModel.maintenance}`, this.settingsModel.maintenance_script).then((resp) => {
      if (resp.status == "ok")  {
        this.updateMaintenanceFields(resp.data);
      }
    });

    }, (err) => {
      this.modal.alert(err);
    })
  }
}