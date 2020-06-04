import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../../services/auth.service';
import { Router } from '@angular/router';
import { ApiService } from '../../../services/api.service';
import { ModalService } from '../../../services/modal.service';

@Component({
  selector: 'maintenance',
  templateUrl: './maintenance.component.html',
  styleUrls: ['./maintenance.component.css']
})
export class MaintenanceComponent implements OnInit {

  newMaintenance: {
    name: "",
    html_code: "", 
  };

  settingsModel: any = {
    maintenance_list: [],
    maintenance: {
      name: "",
      users: [],
      html_code: "",
    } as any
  };

  isNewMaintenance: boolean = true;

  constructor (
    private api: ApiService,
    private auth: AuthService,
    private route: Router,
    private modal: ModalService
  ) { }

  ngOnInit() {
    this.isNewMaintenance = true;
    this.auth.getUser().then(() => {
      this.prepareModel();
      this.updateMaintenanceList();
    });
  }

  /**
   * Prepare settings model maintenance with user id
   */
  prepareModel() {
    this.settingsModel.maintenance = {
      name: "",
      users: [this.auth.user.id],
      html_code: "",
      maintenance_list: []
    };
  }

  /**
   * Update maintenance list for API
   */
  updateMaintenanceList() {
    this.api.get(`maintenances`).then((resp) => {
      this.settingsModel.maintenance_list = resp;
    });
  }

  /**
   * Select maintenance html code
   *
   * @param maintenance
   */
  maintenanceSelected(maintenance) {
    if (maintenance) {
      this.isNewMaintenance = false;
      this.settingsModel.html_code = maintenance.html_code   
    } else {
      this.isNewMaintenance = true;
      this.prepareModel();
      this.cleanMaintenanceFields();
    }
  }

  /**
   * Update service fields
   *
   * @param data
   */
  updateServiceFields(data) {
    this.settingsModel.maintenance = data;
    this.updateMaintenanceList();
  }

  /**
   * Clean fields
   */
  cleanMaintenanceFields() {
    this.isNewMaintenance = true;
    this.settingsModel.new_service_name = "";
    this.settingsModel.html_code = "";

    //Refresh model & update list
    this.prepareModel();
    this.updateMaintenanceList();
  }

  /**
   * Validate maintenance name
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
        res.msg = 'Maintenance name is invalid. Please use: letters and numbers only'
      } else {
        res.status = true;
        res.msg = `Let's go`;
      }
    } else {
      res.status = false;
      res.msg = `Maintenance name can't be empty`;
    }

    return res;
  }

  /**
   * Create maintenance action
   */
  createMaintenance() {
    var name = this.settingsModel.maintenance.name;

    if (!this.settingsModel.maintenance.html_code) {
      this.modal.alert("Maintenance page html code can't be empty");
      return;
    }

    if (this.validateName(name).status) {
      this.modal.confirm(
        `Confirm creating of "${name}" maintenance page`,
        "Do you really want to save changes of maintenance page?<br>If yes, please input maintenance page name.",
        (value) => {
          if(value !== name )
            return 'Maintenance page name is incorrect!';
        },
        'Yes, please save!',
        'Don`t save'
      ).then(() => {
        this.api.create(`maintenances`, this.settingsModel.maintenance).then((resp) => {
          this.updateServiceFields(resp);
          this.cleanMaintenanceFields();

          this.modal.alert(`Maintenance page ${name} was succesfully created. To proceed working with it, please selected it from list in the top of this page.`);
        });

      }, (err) => {
        this.modal.alert(err);
      })
    } else {
      this.modal.alert(this.validateName(name).msg);
    }
  }

  /**
   * Update maintenance action
   */
  updateMaintenance() {
    var name = this.settingsModel.maintenance.name;

    if (!this.settingsModel.maintenance.html_code) {
      this.modal.alert("Maintenance page html code can't be empty");
      return;
    }

    if (this.validateName(name).status) {
      this.modal.confirm(
        `Confirm saving of updates of "${name}" maintenance page`,
        `Do you really want to save changes of maintenance page?<br>If yes, please input maintenance page name.`,
        (value) => {
          if(value !== name )
            return 'Maintenance name is incorrect!';
        },
        'Yes, please save!',
        'Don`t save'
      ).then(
        () => this.api.update(`maintenances/${this.settingsModel.maintenance.id}`, this.settingsModel.maintenance).then((resp) => this.modal.alert(`Maintenance page ${name} was succesfully updated.`) ),
        (err) => this.modal.alert(err)
      );
    } else {
      this.modal.alert(this.validateName(name).msg);
    }
  }

  /**
   * Delete maintenance page
   */
  deleteMaintenance() {
    if (!this.settingsModel.maintenance.name) {
      this.modal.alert("You can't delete maintenance page with no name");
      return;
    }

    this.modal.confirm(
      `Confirm deletion of "${this.settingsModel.maintenance.name}" maintenance`,
      "Do you really want to delete this maintenance page?<br>If yes, please input maintenance name.",
      (value) => {
        if(value !== this.settingsModel.maintenance.name)
          return 'Template name is incorrect!';
      },
      'Yes, please remove!',
      'Don`t remove'
    ).then(() => {
      this.api.remove(`maintenances/${this.settingsModel.maintenance.id}`).then((resp) => {
        this.cleanMaintenanceFields();
        this.modal.alert(`Maintenance page ${name} was succesfully deleted.`);
      });
    }, (err) => {
      this.modal.alert(err);
    })
  }

  /**
   * Open maintenance page for preview
   */
  preview() {
    window.open(`preview?id=${this.settingsModel.maintenance.id}`, '_blank');
  }
}
