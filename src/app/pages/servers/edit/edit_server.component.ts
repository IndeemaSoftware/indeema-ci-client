import { Component, OnInit } from '@angular/core';
import { environment } from "../../../../environments/environment";
import { AuthService } from '../../../services/auth.service';
import { Router, ActivatedRoute } from '@angular/router';
import { ApiService } from '../../../services/api.service';
import { MultipleFileUploaderService } from '../../../services/multiple-file-uploader.service';
import * as _ from 'lodash';
import { ModalService} from '../../../services/modal.service';
import { ConsoleComponent } from '../../console/console.component';

@Component({
  selector: 'edit_server',
  templateUrl: './edit_server.component.html',
  styleUrls: ['./edit_server.component.css']
})
export class EditServerComponent implements OnInit {
  api_url = environment.API_URL;

  //File uploader
  public uploader: MultipleFileUploaderService;

  modelDefault: any = {
    //Server configuration
    server_name: '',
    description: '',
    ports: '',//optional

    //Server credentials
    ssh_ip: '',
    ssh_username: '',
    ssh_key: null,

    //Server dependencies
    serverModel: { server_dependency: [{value:""}
                                    ],
                  custom_dependency: [ {value:""}
                                    ],
                  platform: ""
                  },

    //Validation error
    errorMsg: ''
  };
  
  serverModel: any = {};
  platform_list: any = [];
  modelApi: any = {};

  platform: any;

  //Lists
  server_dependency_list = [] as any;
  custom_dependency_list = [] as any;

  //Error
  errorMsg = false as any;

  //Server data
  server: any = {};
  serverId = null as any;

  isNew = false as boolean;

  constructor(
      private api: ApiService,
      private auth: AuthService,
      private route: Router,
      private activatedRoute: ActivatedRoute,
      private modal: ModalService
  ) {
    let value = this.activatedRoute.snapshot.params['id'];
    if (value !== "new") {
      this.serverId = value;
      this.isNew = false;
    } else {
      this.isNew = true;
    }
  }

  ngOnInit() {
    //Get server
    if (!this.isNew) {
      this.api.get(`/server/${this.serverId}`)
        .then(data => {
          this.server = data;
          this.setupServer();
        }, err => {
          this.modal.alert(err);
          this.route.navigate([`servers`]);
        });
    }

    //Get server dependencies list
    this.api.get('/server-dependencies')
    .then(data => this.server_dependency_list = data, err => this.server_dependency_list = []);

    //Get nodejs dependencies list
    this.api.get('/custom-dependencies')
        .then(data => this.custom_dependency_list = data, err => this.custom_dependency_list = []);

    this.api.get(`platform/listAll`).then((resp) => {
      this.platform_list = resp.data;
    });  
  }

  prepareToEdit() {
    this.serverModel = _.cloneDeep(this.server);
    this.modelApi = {};

    //Remove exist cert
    this.serverModel.ssh_pem = null;

    //Prepare server dependencies
    if(this.serverModel.server_dependencies && this.serverModel.server_dependencies.length) {
      this.serverModel.server_dependency = [];
      for(let dep of this.serverModel.server_dependencies){
        this.serverModel.server_dependency.push({value:dep.id});
      }
      delete this.serverModel.server_dependencies;
    } else {
      this.serverModel.server_dependency = [{value:""}];
      delete this.serverModel.server_dependencies;
    }

    //Prepare custom dependencies
    if(this.serverModel.custom_dependencies && this.serverModel.custom_dependencies.length) {
      this.serverModel.custom_dependency = [];
      for(let dep of this.serverModel.custom_dependencies){
        this.serverModel.custom_dependency.push({value:dep.id});
      }
      delete this.serverModel.custom_dependencies;
    } else {
      this.serverModel.custom_dependency = [{value:""}];
      delete this.serverModel.custom_dependencies;
    }

    if (this.serverModel.platform) {
      this.platform = this.serverModel.platform.id;
    } else {
      this.platform = "";
    }
  }


   async createServer() {
    return new Promise((rs, rj) => {
      this.api.create(`server`, {}).then((server) => {
        this.server = server;
        this.serverId = server.id;
        rs();
      });
    })
  }

  async setupServer() {
    //Prepare form model
    if (!this.isNew) {
      this.prepareToEdit();
    }

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
      if (isUpdateServer)
        return

      isUpdateServer = true;

      response = JSON.parse(response);
      if (!response.length) {
        this.errorMsg = 'File not uploaded properly!';
        return;
      }

      if (this.modelApi) {
        //Setup files id`s
        for (let file of response) {
          if (this.modelApi.ssh_key && this.modelApi.ssh_key.name === file.name)
            this.modelApi.ssh_key = file.id;
        }
      }

      return new Promise((rs, rj) => {
        //Timeout for fix multiple responses
        setTimeout(() => {
          const proceed_setup = this.modelApi.proceed_setup;
          delete this.modelApi.proceed_setup;

          this.updateServer(this.modelApi, proceed_setup);
          rs();
  
        }, 250);
      });
    };
  }

  addPemFile(ev, model){
    model.ssh_key = ev.target.files[0];
  }

  addRepeatField(arr){
    arr.push({value:""});
  }

  removeRepeatField(arr, key){
    arr.splice(key, 1);
  }

  cleanFields(arr){
    arr[0] = null;
  }

  validateModel(model){
    if(
        !model.server_name
    )
    return 'Please input all required fields.';

    if(model.avaliable_ports){
      const portRegex = new RegExp('^[0-9]+$', 'gm');
      const availiablePortRegex = new RegExp('^[0-9 ]+$', 'gm');

      if(!portRegex.test(model.avaliable_ports)){
        if(!availiablePortRegex.test(model.avaliable_ports)){
          return 'Avaliable ports is invalid. Please use: numbers. Separate ports by comma with no whitespace';
        }
      }
    }

    if(!model.ssh_ip || !model.ssh_username) {
      return 'Please input all required fields.';
    }

    if(!model.id) {
      if(!model.ssh_key)
        return 'Please input all required fields.';
    }
  }   

  prepareModel(model){
    const newModel = _.cloneDeep(model);

    newModel.platform = this.platform;
    //Create new model fields

    delete newModel.server_dependencies;
    newModel.server_dependencies = [];
    for (let obj of newModel.server_dependency) {
      if(obj)
        newModel.server_dependencies.push(obj.value);
    }

    delete newModel.custom_dependencies;
    newModel.custom_dependencies = [];
    for (let obj of newModel.custom_dependency) {
      if (obj)
        newModel.custom_dependencies.push(obj.value);
    }

    // if(!newModel.ssh_key)
    //   delete newModel.ssh_key;

    //Cleanup model fields
    //delete newModel.server_dependency;
    // delete newModel.custom_dependency;

    return newModel;
  }

  isFileUploaded(){
    let hasFiles = false;

    if (this.server.ssh_key) {
        hasFiles = true;
    }

    return hasFiles;
  }

  async proceedToUpdate(start = false){
    //Validate models
    let hasErrors = false;

    if (hasErrors) {
      window.scrollTo(0, 1);
      return false;
    }
    this.errorMsg = '';
    if (!this.serverModel.server_name) {
      this.errorMsg = 'Server name is required';
      return false;
    } else {
      const serverNameRegex = new RegExp('^[-_a-zA-Z0-9]+$', 'gm');
      if (!serverNameRegex.test(this.serverModel.server_name)) {
        this.errorMsg = 'Server name is invalid. Please use: alphabetic characters, numbers, "-" or "_"';
        return false;
      }
    }

    if (this.isNew) {
      await this.createServer();
      await this.setupServer();        
    }

    //Prepare model for api
    this.modelApi = this.prepareModel(this.serverModel);

    //Remove all files from queue
    this.uploader.queue = [];

    //Check if user upload any files
    if (!this.isFileUploaded()) {
      this.uploadFiles();
    } else {
      const proceed_setup = this.modelApi.proceed_setup;
      delete this.modelApi.proceed_setup;

      //Cleanup server
      delete this.modelApi.ssh_key;

      this.updateServer(this.modelApi, proceed_setup);
    }

    return false;
  }

  updateServer(model, proceed_setup = false) {
    //Update server
    this.api.update(`server/${this.serverId}`, model).then((server) => {
      //SERVER CREATED
      if (proceed_setup) {
        this.route.navigate([`console/server/${server.id}`], { queryParams: { start: 'true',cleanup: 'false' } });
      } else {
        this.route.navigate([`servers`]);
      }
    }, (err) => {
      this.errorMsg = err;
    });
  }

  uploadFiles(){
    //If models finish
    if(!this.modelApi)
      return false;

    //Remove all files from queue
    this.uploader.queue = [];

    //Prepare files list
    const files = [];
    files.push(this.modelApi.ssh_key);

    //Attach file
    this.uploader.addToQueue(files);

    //Send files
    this.uploader.uploadAllFiles('files', 'POST');

    return true;
  }
}
