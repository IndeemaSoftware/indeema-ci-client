import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { ApiService } from '../../services/api.service';
import { Router } from '@angular/router';
import { ModalService } from '../../services/modal.service';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css']
})
export class SettingsComponent implements OnInit {

  modelDefault: any = {
    project_path: "/home/$USER",
  };

  settingsModel: any = {};
  maintenance: null
  new_naimtenance_name: null
  ci: null
  new_ci_name: null
  ci_template: null

  server: null
  new_server_name: null

  constructor(
    private api: ApiService,
    private auth: AuthService,
    private route: Router,
    private modal: ModalService
  ) { };

  ngOnInit() {
    this.auth.getUser().then((user) => {
      this.switchSetting('General');

      this.updateMaintenanceList();
      this.updatePlatformList();
      this.updateCIList();
    }, (err) => {
      this.route.navigate(['signin']);
    });
  }

//Working with CI templates
//Start
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

//Finish
//Working with CI templates

//Working with CI templates
//Start
  updateCiFields(data) {
    this.settingsModel.new_ci_name = "";
    this.settingsModel.ci_script = data;
    this.ciSelected();
    this.updateCIList();
  }

  updateTemplateFields(data) {
    this.settingsModel.new_template_name = "";
    this.settingsModel.ci_template_script = data;
    this.templateSelected();
    this.updateTemplatesList();
  }

  updateCIList() {
    this.api.get(`ci/script/listAll`).then((resp) => {
      this.settingsModel.ci_script_list = resp.data;
    });  
  }

  updateTemplatesList() {
    //getting list of templates for selected script
    if (this.settingsModel.ci) {
      this.api.get(`ci/template/listAll/${this.settingsModel.ci}`).then((resp) => {
        this.settingsModel.ci_template_list = resp.data;
      });  
    }
  }

  cleanupTemplateFields(){
    this.settingsModel.new_template_name = "";
    this.settingsModel.template_script = "";
    this.settingsModel.ci_template = null;
    this.updateTemplatesList();
  }

  ciSelected() {
    this.api.get(`ci/script/download/${this.settingsModel.ci}`).then((resp) => {
      this.settingsModel.ci_script = resp.data;
    });  

    this.updateTemplatesList();
  }

  templateSelected() {
    this.api.get(`ci/template/download/${this.settingsModel.ci}/${this.settingsModel.ci_template}`).then((resp) => {
      this.settingsModel.template_script = resp.data;
    });  
  }

  duplicateCI() {
    this.settingsModel.ci_script_list.forEach(item => {
      if (item == this.settingsModel.new_ci_name){
        this.modal.alert(`Ci with this name already exist, please change the name`);
        return;
      }
    });

    this.api.create(`ci/script/${this.settingsModel.new_ci_name}`, {"data":this.settingsModel.ci_script}).then((resp) => {
      if (resp.status == "ok")  {
        this.updateCiFields(resp.data);
      }
    });
  }

  duplicateTemplate() {
    this.settingsModel.ci_script_list.forEach(item => {
      if (item == this.settingsModel.new_ci_name){
        this.modal.alert(`Template with this name already exist, please change the name`);
        return;
      }
    });

    this.api.create(`ci/template/${this.settingsModel.ci}/${this.settingsModel.new_template_name}`, {"data":this.settingsModel.template_script}).then((resp) => {
      if (resp.status == "ok")  {
        this.updateTemplateFields(resp.data);
      }
    });
  }

  deleteCI(){
    //Ask to delete CI template
    this.modal.confirm(
      `Confirm deletion of "${this.settingsModel.ci}" ci`,
      "Do you really want to delete this ci?<br>If yes, please input ci name.",
      (value) => {
        if(value !== this.settingsModel.ci)
          return 'Ci name is incorrect!';
      },
      'Yes, please remove!',
      'Don`t remove'
  ).then((res) => {
    this.api.remove(`ci/script/${this.settingsModel.ci}`).then((resp) => {
      if (resp.status == "ok")  {
        this.settingsModel.new_ci_name = "";
        this.settingsModel.ci_script = "";
        this.settingsModel.ci = null;
        this.updateCIList();
        this.cleanupTemplateFields();
      }
    });
    }, (err) => {
      this.modal.alert(err);
    })
  }

  deleteTemplate(){
    //Ask to delete CI template
    this.modal.confirm(
      `Confirm deletion of "${this.settingsModel.ci_template}" template`,
      "Do you really want to delete this template?<br>If yes, please input template name.",
      (value) => {
        if(value !== this.settingsModel.ci_template)
          return 'Template name is incorrect!';
      },
      'Yes, please remove!',
      'Don`t remove'
  ).then((res) => {
    this.api.remove(`ci/template/${this.settingsModel.ci}/${this.settingsModel.ci_template}`).then((resp) => {
      if (resp.status == "ok")  {
        this.cleanupTemplateFields();
      }
    });
    }, (err) => {
      this.modal.alert(err);
    })
  }

  saveCIScript() {
    this.modal.confirm(
      `Confirm saving of updates of "${this.settingsModel.ci}" script`,
      "Do you really want to save changes of script?<br>If yes, please input template name.",
      (value) => {
        if(value !== this.settingsModel.ci)
          return 'Ci name is incorrect!';
      },
      'Yes, please save!',
      'Don`t save'
  ).then((res) => {
    this.api.create(`ci/script/${this.settingsModel.ci}`, this.settingsModel.ci_script).then((resp) => {
      if (resp.status == "ok")  {
        this.updateCiFields(resp.data);
      }
    });

    }, (err) => {
      this.modal.alert(err);
    })
  }

  saveTemplateScript() {
    if (!this.settingsModel.ci_template) {
      this.settingsModel.ci_template = this.settingsModel.new_template_name;
    }
    this.modal.confirm(
      `Confirm saving of updates of "${this.settingsModel.ci_template}" template`,
      "Do you really want to save changes of template?<br>If yes, please input template name.",
      (value) => {
        if(value !== this.settingsModel.ci_template)
          return 'Template name is incorrect!';
      },
      'Yes, please save!',
      'Don`t save'
  ).then((res) => {
    this.api.create(`ci/template/${this.settingsModel.ci}/${this.settingsModel.ci_template}`, this.settingsModel.template_script).then((resp) => {
      if (resp.status == "ok")  {
        this.updateTemplateFields(resp.data);
      }
    });

    }, (err) => {
      this.modal.alert(err);
    })
  }
//Finish
//Working with CI templates

//Working with Platforms
//Start
updatePlatformFields(data) {
  this.settingsModel.new_platform_name = "";
  this.settingsModel.platform = data;
  this.platformSelected();
  this.updatePlatformList();
}

cleanPlatfomFields() {
  this.settingsModel.new_platform_name = "";
  this.settingsModel.platform_setup_script = "";
  this.settingsModel.platform_cleanup_script = "";
  this.settingsModel.platform = null;
  this.updatePlatformList();
}

updatePlatformList() {
  this.api.get(`platform/listAll`).then((resp) => {
    this.settingsModel.platform_list = resp.data;
  });  
}

platformSelected(){
  this.api.get(`platform/download/${this.settingsModel.platform}`).then((resp) => {
    this.settingsModel.platform_setup_script = resp.data;
  });  

  this.api.get(`platform/cleanup/download/${this.settingsModel.platform}`).then((resp) => {
    this.settingsModel.platform_cleanup_script = resp.data;
  });  
}

duplicatePlatform(){
  this.settingsModel.platform_list.forEach(item => {
    if (item == this.settingsModel.new_platform_name){
      this.modal.alert(`Template with this name already exist, please change the name`);
      return;
    }
  });

  this.api.create(`platform/${this.settingsModel.new_platform_name}`, {"data":this.settingsModel.platform_setup_script}).then((resp) => {
    if (resp.status == "ok")  {
      this.updatePlatformFields(resp.data);
    }
  });

  this.api.create(`platform/cleanup/${this.settingsModel.new_platform_name}`, {"data":this.settingsModel.platform_cleanup_script}).then((resp) => {
    if (resp.status == "ok")  {
      this.updatePlatformFields(resp.data);
    }
  });
}

deletePlatform() {
  this.modal.confirm(
    `Confirm deletion of "${this.settingsModel.platform}" template`,
    "Do you really want to delete this template?<br>If yes, please input template name.",
    (value) => {
      if(value !== this.settingsModel.platform)
        return 'Template name is incorrect!';
    },
    'Yes, please remove!',
    'Don`t remove'
).then((res) => {
  this.api.remove(`platform/${this.settingsModel.platform}`).then((resp) => {
    if (resp.status == "ok")  {
      this.cleanPlatfomFields();
    }
  });
  this.api.remove(`platform/cleanup/${this.settingsModel.platform}`).then((resp) => {
    if (resp.status == "ok")  {
      this.cleanPlatfomFields();
    }
  });
  }, (err) => {
    this.modal.alert(err);
  })
}

savePlatformScript(){
  this.modal.confirm(
    `Confirm saving of updates of "${this.settingsModel.platform}" script`,
    "Do you really want to save changes of script?<br>If yes, please input template name.",
    (value) => {
      if(value !== this.settingsModel.platform)
        return 'Template name is incorrect!';
    },
    'Yes, please save!',
    'Don`t save'
).then((res) => {
  this.api.create(`platform/${this.settingsModel.platform}`, this.settingsModel.platform_setup_script).then((resp) => {
    if (resp.status == "ok")  {
      this.updatePlatformFields(resp.data);
    }
  });
  this.api.create(`platform/cleanup/${this.settingsModel.platform}`, this.settingsModel.platform_cleanup_script).then((resp) => {
    if (resp.status == "ok")  {
      this.updatePlatformFields(resp.data);
    }
  });
  }, (err) => {
    this.modal.alert(err);
  })
}
//Finish
//Working with Servers

//Tab bar navigation
//Start
  switchSetting(page) {
    // Declare all variables
    var i, tabcontent, tablinks;
  
    // Get all elements with class="tabcontent" and hide them
    tabcontent = document.getElementsByClassName("tabcontent");
    for (i = 0; i < tabcontent.length; i++) {
      tabcontent[i].style.display = "none";
    }
  
    // Get all elements with class="tablinks" and remove the class "active"
    tablinks = document.getElementsByClassName("tablinks");
    for (i = 0; i < tablinks.length; i++) {
      tablinks[i].className = tablinks[i].className.replace(" active", "");
    }
  
    // Show the current tab, and add an "active" class to the button that opened the tab
    document.getElementById(page).style.display = "block";
  }
//Finish
//Tab bar navigation
}
