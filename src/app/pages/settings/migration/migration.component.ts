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

  //file uploader 
  public uploader: MultipleFileUploaderService;

  constructor (
    private api: ApiService,
    private auth: AuthService,
    private route: Router,
    private modal: ModalService
  ) { 
  };

  ngOnInit() {
    this.auth.getUser().then((user) => {
      this.setupUpload();
    }, (err) => {
      this.route.navigate(['signin']);
    });
  }

  setupUpload() {
    console.log("setupUpload");
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
      //Additional check for create project
      console.log(response);

      this.projectFile = null;

      response = JSON.parse(response);
      if (!response.length) {
        // this.errorMsg = 'File not uploaded properly!';
        return;
      } else {
        var hash = response[0].hash;
        this.api.get(`migrations/import/${hash}`)
        .then((resp) => {
          console.log(resp);
        }); 
      }

      return new Promise((rs, rj) => {
        //Timeout for fix multiple responses
        setTimeout(() => {
          console.log("We are here!");
          rs();
  
        }, 250);
      });
    }

    this.uploader.onWhenAddingFileFailed = (item: any, filter: any, options: any) => {
      console.log("Failed to upload");
    }

    this.uploader.onProgressAll(progress =>{
      console.log(progress);
    });
  }

  addFile(ev) {
    if (ev.target.files.length > 0) {
      this.projectFile = ev.target.files[0];
      console.log("File", this.projectFile);  
    } else {
      this.modal.alert("No file chosen");
    }
  }

  import () {
    console.log("Import");
    const files = [];
    files.push(this.projectFile);
    this.uploader.queue = [];
    this.uploader.addToQueue(files);

    //Send files
    this.uploader.uploadAllFiles('files', 'POST');
  }

  export () {
    this.api.get(`migrations/export`)
    .then((resp) => {
      window.open(environment.API_URL + `/migrations/download/${this.auth.user.id}`,'_blank');
    }); 
  }
}