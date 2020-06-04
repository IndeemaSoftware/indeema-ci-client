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

  projectFile: null;
  errorMsg: "";
  api_url = environment.API_URL;
  modules: any = [{
    name: "",
    description: "",
    version: ""
  }]

  isLoading: boolean
  isInstalling = null;

  public uploader: MultipleFileUploaderService;

  constructor (
    private api: ApiService,
    private auth: AuthService,
    private route: Router,
    private modal: ModalService
  ) {  }

  ngOnInit() {
    this.getMigrations();
  }

  /**
   * Get migration list
   */
  getMigrations(){
    this.isInstalling = true;
    this.isLoading = true;

    this.auth.getUser(true).then((user) => {
      this.setupUpload();
      this.updateModules();
      this.isLoading = false;
    }, (err) => {
      this.isLoading = false;
    });
  }

  /**
   * Get modules list
   */
  updateModules() {
    this.api.get(`migrations`).then((res) => {
      this.modules = res;
    });  
  }

  /**
   * Setup upload module
   */
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
        return;
      } else {
        const hash = response[0].hash;
        this.api.get(`migrations/import/${hash}`)
        .then((res) => {
          this.isLoading = false;
          this.modal.alert(`Set ${response[0].name} was succesfully imported`);
        }); 
      }

      return new Promise((rs, rj) => {
        setTimeout(() => {
          rs();
        }, 250);
      });
    }

    this.uploader.onWhenAddingFileFailed = (item: any, filter: any, options: any) => {
      this.isLoading = false;
    }
  }

  /**
   * Add file to upload queue
   *
   * @param ev
   */
  addFile(ev) {
    if (ev.target.files.length > 0) {
      this.projectFile = ev.target.files[0];
    } else {
      this.modal.alert("No file chosen");
    }
  }

  /**
   * Import new module
   */
  import () {
    const files = [];
    files.push(this.projectFile);
    this.uploader.queue = [];
    this.uploader.addToQueue(files);

    this.isLoading = true;

    //Send files
    this.uploader.uploadAllFiles('files', 'POST');
  }

  /**
   * Export module
   */
  export () {
    this.api.get(`migrations/export`)
    .then((res) => {
      window.open(environment.API_URL + `/migrations/download/${this.auth.user.id}`,'_blank');
    }); 
  }

  /**
   * Install modules from market
   *
   * @param module
   */
  installModule(module) {
    if (module.module.length > 0) {
      this.isInstalling = module.identifier;
      this.api.get(`migrations/import/${module.module[0].hash}`)
      .then((res) => {
        this.isInstalling = null;
        this.getMigrations();
      });   
    }
  }

  /**
   * Uninstall module from market
   *
   * @param module
   */
  uninstallModule(module) {
    if (module.module.length > 0) {
      this.isInstalling = module.identifier;
      this.api.get(`migrations/isused/${module.module[0].hash}`)
      .then((res) => {
        if (res.apps.length > 0) {
          this.isInstalling = null;
          let apps = "";
          for (let a of res.apps) {
            apps += ` ${a.app_name},`;
          }

          this.modal.alert(`You may not delete this module as applications${apps} are still using some components of from this module. Please change componets from application first and then you can delete this module`);
        } else if (res.servers.length > 0) {
          this.isInstalling = null;
          let servers = "";
          for (let s of res.servers) {
            servers += ` ${s.server_name},`;
          }

          this.modal.alert(`You may not delete this module as servers${servers} are still using some components of from this module. Please change componets from server first and then you can delete this module`);
        } else {
          this.api.get(`migrations/uninstall/${module.module[0].hash}`)
          .then((res) => {
            this.isInstalling = null;
            this.getMigrations();
          });       
        }
      });   
    }
  }
}
