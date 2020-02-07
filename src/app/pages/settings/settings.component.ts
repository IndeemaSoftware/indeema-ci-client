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
    ci_template_script: null
  };

  settingsModel: any = {};

  constructor(
    private api: ApiService,
    private auth: AuthService,
    private route: Router,
    private modal: ModalService
  ) { };

  ngOnInit() {
    this.auth.getUser().then((user) => {
      this.switchSetting('General');

      this.api.get('ci_template/listAll').then((resp) => {
        this.settingsModel.ci_template_list = resp.data;
      });  
    }, (err) => {
      this.route.navigate(['signin']);
    });
  }

  dublicateScript(){
    
  }

  templateSelected(pId){
    console.log(pId);
  }

  saveScript(){
    console.log("Save pressed!");
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
