import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { ApiService } from '../../services/api.service';
import { Router } from '@angular/router';
import { ModalService } from '../../services/modal.service';
import { MultipleFileUploaderService } from '../../services/multiple-file-uploader.service';


@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css']
})
export class SettingsComponent implements OnInit {
  //File uploader
  public uploader: MultipleFileUploaderService;

  modelDefault: any = {
    project_path: "/home/$USER",
  };

  settingsModel: any = {};
  ci_template: null
  new_template_name: null

  constructor(
    private api: ApiService,
    private auth: AuthService,
    private route: Router,
    private modal: ModalService
  ) { };

  ngOnInit() {
    this.auth.getUser().then((user) => {
      this.switchSetting('General');

      this.updateCITemplatesList();
    }, (err) => {
      this.route.navigate(['signin']);
    });
  }

  updateCITemplatesList() {
    this.api.get(`ci_template/listAll`).then((resp) => {
      this.settingsModel.ci_template_list = resp.data;
    });  
  }

  templateSelected() {
    this.api.get(`ci_template/download/${this.settingsModel.ci_template}`).then((resp) => {
      this.settingsModel.ci_template_script = resp.data;
    });  
  }

  duplicateCITemplate() {
    this.settingsModel.ci_template_list.forEach(item => {
      if (item == this.settingsModel.new_template_name){
        this.modal.alert(`Template with this name already exist, please change the name`);
        return;
      }
    });

    this.api.create(`ci_template/${this.settingsModel.new_template_name}`, this.settingsModel.ci_template_script).then((resp) => {
      if (resp.status == "ok")  {
        this.settingsModel.new_template_name = "";
        this.settingsModel.ci_template = resp.data;
        this.templateSelected();
        this.updateCITemplatesList();
      }
    });
  }

  deleteCITemplate(){
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
    this.api.remove(`ci_template/${this.settingsModel.ci_template}`).then((resp) => {
      if (resp.status == "ok")  {
        this.settingsModel.new_template_name = "";
        this.settingsModel.ci_template_script = "";
        this.settingsModel.ci_template = null;
        this.updateCITemplatesList();
      }
    });
    }, (err) => {
      this.modal.alert(err);
    })
  }

  saveScript() {
    this.modal.confirm(
      `Confirm saving of updates of "${this.settingsModel.ci_template}" script`,
      "Do you really want to save changes of script?<br>If yes, please input template name.",
      (value) => {
        if(value !== this.settingsModel.ci_template)
          return 'Template name is incorrect!';
      },
      'Yes, please save!',
      'Don`t save'
  ).then((res) => {
    this.api.create(`ci_template/${this.settingsModel.ci_template}`, this.settingsModel.ci_template_script).then((resp) => {
      if (resp.status == "ok")  {
        this.settingsModel.new_template_name = "";
        this.settingsModel.ci_template = resp.data;
        this.templateSelected();
        this.updateCITemplatesList();
      }
    });

    }, (err) => {
      this.modal.alert(err);
    })
  }
  
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
}