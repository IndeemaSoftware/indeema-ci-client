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

  newTemplate: {
    name:"",
    yml_code: "", 
    };

  settingsModel: any = {
    template_list:[],
    template: {
      name:"",
      users: [],
      yml_code: "",
      template_list:[]
    } as any
  };

  isNewTemplate: boolean = true;

  constructor (
    private api: ApiService,
    private modal: ModalService,
    private auth: AuthService,
    private route: Router,
  ) { 
  };

  ngOnInit() {
    this.isNewTemplate = true;
    this.auth.getUser().then(() => {
      this.initUser();
      this.updateTemplatesList();
    });
  }

  initUser() {
    this.settingsModel.template = {
      name:"",
      users: [this.auth.user.id],
      yml_code: "",
      template_list:[]
    };
  }

  templateSelected(template) {
    if (template) {
      this.isNewTemplate = false;
      this.settingsModel.yml_code = template.yml_code   
    } else {
      this.isNewTemplate = true;
      this.initUser();
      this.cleanTemplateFields();
    }
  }

  updateServiceFields(data) {
    this.settingsModel.template = data;
    this.updateTemplatesList();
  }

  cleanTemplateFields() {
    this.isNewTemplate = true;
    this.settingsModel.new_service_name = "";
    this.settingsModel.yml_code = "";
    this.initUser();
    this.updateTemplatesList();
  }

  updateTemplatesList() {
    this.api.get(`ci-templates`).then((resp) => {
      this.settingsModel.template_list = resp;
    });  
  }

  validateName(name) {
    var res = {status:true, msg:""};

    if (name) {
        const regex = new RegExp('^[0-9a-zA-Z_-]+$', 'gm');
  
        if (!regex.test(name)) {
            res.status = false;
            res.msg = 'Template name is invalid. Please use: letters and numbers only'
        } else {
            res.status = true;
            res.msg = `Let's go`;  
        }
    } else {
      res.status = false;
      res.msg = `Template name can't be empty`;
  }

  return res;
}

  updateTemplate() {
    var name = this.settingsModel.template.name;

    if (!this.settingsModel.template.yml_code) {
      this.modal.alert("CI script is required for new template");
      return;
    }

    if (this.validateName(name).status) {
      this.modal.confirm(
        `Confirm saving of updates of "${name}" script`,
        "Do you really want to save changes of script?<br>If yes, please input template name.",
        (value) => {
          if(value !== name )
            return 'Template name is incorrect!';
        },
        'Yes, please save!',
        'Don`t save'
    ).then((res) => {
      this.api.update(`ci-templates/${this.settingsModel.template.id}`, this.settingsModel.template).then((resp) => {
      });
        this.modal.alert(`CI template ${name} was succesfully updated.`);  
      }, (err) => {
        this.modal.alert(err);
      })
    } else {
      this.modal.alert(this.validateName(name).msg);
    }
  }

  deleteTemplate() {
    if (!this.settingsModel.template.name) {
      this.modal.alert("You can't delete service with no name");
      return;
    }
    this.modal.confirm(
      `Confirm deletion of "${this.settingsModel.template.name}" template`,
      "Do you really want to delete this template?<br>If yes, please input template name.",
      (value) => {
        if(value !== this.settingsModel.template.name)
          return 'Template name is incorrect!';
      },
      'Yes, please remove!',
      'Don`t remove'
  ).then((res) => {
    this.api.remove(`ci-templates/${this.settingsModel.template.id}`).then((resp) => {
      this.cleanTemplateFields();
      this.modal.alert(`CI template ${name} was succesfully removed.`);  
    });
    }, (err) => {
      this.modal.alert(err);
    })
  }

  createTemplate() {
    var name = this.settingsModel.template.name;

    if (!this.settingsModel.template.yml_code) {
      this.modal.alert("CI script is required for new template");
      return;
    }

    if (this.validateName(name).status) {
      this.modal.confirm(
        `Confirm creating of "${name}" script`,
        "Do you really want to save changes of script?<br>If yes, please input template name.",
        (value) => {
          if(value !== name )
            return 'Template name is incorrect!';
        },
        'Yes, please save!',
        'Don`t save'
    ).then((res) => {
      this.api.create(`ci-templates`, this.settingsModel.template).then((resp) => {
        this.updateServiceFields(resp);
        this.cleanTemplateFields();
        this.modal.alert(`CI template ${name} was succesfully created. To proceed working with it selected it from list in the top of this page.`);  
      });  
  
      }, (err) => {
        this.modal.alert(err);
      })
    } else {
      this.modal.alert(this.validateName(name).msg);
    }
  }
}
