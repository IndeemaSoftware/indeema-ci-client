import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../../services/auth.service';
import { Router } from '@angular/router';
import { ApiService } from '../../../services/api.service';
import { ModalService } from '../../../services/modal.service';
import { environment } from '../../../../environments/environment';
import { MultipleFileUploaderService } from '../../../services/multiple-file-uploader.service';

@Component({
  selector: 'migration',
  templateUrl: './migration.component.html',
  styleUrls: ['./migration.component.css']
})
export class MigrationComponent implements OnInit {

  isNewMaintenance: boolean = true;
  projectFile: null;
  errorMsg: "";
  api_url = environment.API_URL;
  modules: any = [{
    name:"",
    description:"",
    version:""
  }]

  //file uploader 
  public uploader: MultipleFileUploaderService;

  isLoading: boolean
  isInstalling = null;

  constructor (
    private api: ApiService,
    private auth: AuthService,
    private route: Router,
    private modal: ModalService
  ) { 
  };

  ngOnInit() {
    if (this.modules.length === 0) {
      this.selected();
    }      
  }

  selected () {
    this.isInstalling = null;
    this.isLoading = true;
    this.auth.user = null;//this is needed to get updated users after installing module
    this.auth.getUser().then((user) => {
      this.setupUpload();
      this.updateModules();
      this.isLoading = false;
    }, (err) => {
      this.route.navigate(['signin']);
      this.isLoading = false;
    });
  }

  updateModules() {
    this.api.get(`migrations`).then((resp) => {
      this.modules = resp;
    });  
  }

  setupUpload() {
    const jwt = this.auth.getJWT();

    this.uploader = new MultipleFileUploaderService({
      url: this.api_url + '/upload',
      authToken: 'Bearer ' + jwt,
      itemAlias: 'files'
    });

    //If upload success
    this.uploader.onAfterAddingFile = (file) => {
      file.withCredentials = false;
      file.method = "POST";
    };

    //Trigger for creating project
    let isUpdateServer = false;

    this.uploader.onSuccessItem = (item: any, response: any, status: any, headers: any) => {
      this.projectFile = null;

      response = JSON.parse(response);
      if (!response.length) {
        // this.errorMsg = 'File not uploaded properly!';
        return;
      } else {
        var hash = response[0].hash;
        this.api.get(`migrations/import/${hash}`)
        .then((resp) => {
          this.isLoading = false;
          this.modal.alert(`Set ${response[0].name} was succesfully imported`);
        }); 
      }

      return new Promise((rs, rj) => {
        //Timeout for fix multiple responses
        setTimeout(() => {
          rs();
  
        }, 250);
      });
    }

    this.uploader.onWhenAddingFileFailed = (item: any, filter: any, options: any) => {
      this.isLoading = false;
      console.log("Failed to upload");
    }

    this.uploader.onProgressAll(progress =>{
      console.log(progress);
    });
  }

  addFile(ev) {
    if (ev.target.files.length > 0) {
      this.projectFile = ev.target.files[0];
    } else {
      this.modal.alert("No file chosen");
    }
  }

  import () {
    const files = [];
    files.push(this.projectFile);
    this.uploader.queue = [];
    this.uploader.addToQueue(files);

    this.isLoading = true;
    //Send files
    this.uploader.uploadAllFiles('files', 'POST');
  }

  export () {
    this.api.get(`migrations/export`)
    .then((resp) => {
      window.open(environment.API_URL + `/migrations/download/${this.auth.user.id}`,'_blank');
    }); 
  }

  installModule(module) {
    if (module.module.length > 0) {
      this.isInstalling = module.identifier;
      this.api.get(`migrations/import/${module.module[0].hash}`)
      .then((resp) => {
        this.isInstalling = null;
        this.selected();
      });   
    }
  }

  uninstallModule(module) {
    if (module.module.length > 0) {
      this.isInstalling = module.identifier;
      this.api.get(`migrations/isused/${module.module[0].hash}`)
      .then((resp) => {
        if (resp.apps.length > 0) {
          this.isInstalling = null;
          var apps = "";
          for (var a of resp.apps) {
            apps += ` ${a.app_name},`;
          }

          this.modal.alert(`You may not delete this module as applications${apps} are still using some components of from this module. Please change componets from application first and then you can delete this module`);
        } else if (resp.servers.length > 0) {
          this.isInstalling = null;
          var servers = "";
          for (var s of resp.servers) {
            servers += ` ${s.server_name},`;
          }

          this.modal.alert(`You may not delete this module as servers${servers} are still using some components of from this module. Please change componets from server first and then you can delete this module`);
        } else {
          this.api.get(`migrations/uninstall/${module.module[0].hash}`)
          .then((resp) => {
            this.isInstalling = null;
            this.selected();
          });       
        }
      });   
    }
  }
}