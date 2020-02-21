import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../../services/auth.service';
import { ApiService } from '../../../services/api.service';
import { Router } from '@angular/router';
import { ModalService } from '../../../services/modal.service';

@Component({
  selector: 'ci-scripts',
  templateUrl: './ci-scripts.component.html',
  styleUrls: ['./ci-scripts.component.css']
})
export class CIScriptsComponent implements OnInit {

  settingsModel: any = {
    ci_script_list: []
  } as any;
  ci: null
  new_ci_name: null
  ci_template: null

  constructor(
    private api: ApiService,
    private auth: AuthService,
    private route: Router,
    private modal: ModalService
  ) { };

  ngOnInit() {
    this.updateCIList();
  }

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
}