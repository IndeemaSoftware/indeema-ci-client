import { Component, OnInit } from '@angular/core';
import { environment } from "../../../../environments/environment";
import { AuthService } from '../../../services/auth.service';
import { Router, ActivatedRoute } from '@angular/router';
import { ApiService } from '../../../services/api.service';
import { MultipleFileUploaderService } from '../../../services/multiple-file-uploader.service';
import * as _ from 'lodash';
import { ModalService} from '../../../services/modal.service';

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
    server_dependency: [
      {value: null}
    ],

    //Node.JS dependencies
    node_dependency: [
      {value: null}
    ],

    //Validation error
    errorMsg: ''
  };

  serverModel: any = {};
  platform_list: any = {};

  modelApi: any = {};

  //Lists
  serversDeps = [] as any;
  nodejsDeps = [] as any;

  //Error
  errorMsg = false as any;

  //Server data
  server = null as any;
  serverId = null as any;

  //Upload model index
  uploadModelIndex = 0;

  constructor(
      private api: ApiService,
      private auth: AuthService,
      private route: Router,
      private activatedRoute: ActivatedRoute,
      private modal: ModalService
  ) {
    this.serverId = this.activatedRoute.snapshot.params['id'];
    if(!this.serverId){
      this.route.navigate([`servers`]);
      return;
    }
  }

  ngOnInit() {
    //Get server dependencies list
    this.api.get('/server-dependencies')
        .then(data => this.serversDeps = data, err => this.serversDeps = []);

    //Get nodejs dependencies list
    this.api.get('/nodejs-dependencies')
        .then(data => this.nodejsDeps = data, err => this.nodejsDeps = []);

    //Get project
    this.api.get(`/server/${this.serverId}`)
        .then(data => {
          this.server = data;
          this.setupServer();
        }, err => {
          this.modal.alert(err);
          this.route.navigate([`servers`]);
        });

    this.api.get(`platform/listAll`).then((resp) => {
      this.platform_list = resp.data;
    });  
  }

  platformSelected() {
    console.log("Platform selected");
  }

  prepareToEdit(){
    this.serverModel = _.cloneDeep(this.server.plain());
    this.modelApi = {};

    //Remove exist cert
    this.serverModel.ssh_pem = null;

    //Prepare server dependencies
    if(this.serverModel.server_dependencies && this.serverModel.server_dependencies.length) {
      this.serverModel.server_dependency = [];
      for(let dep of this.serverModel.server_dependencies){
        this.serverModel.server_dependency.push({value: dep.id});
      }
      delete this.serverModel.server_dependencies;
    } else {
      this.serverModel.server_dependency = [
        {value: null}
      ];
      delete this.serverModel.server_dependencies;
    }

    //Prepare nodejs dependencies
    if(this.serverModel.nodejs_dependencies && this.serverModel.nodejs_dependencies.length){
      this.serverModel.node_dependency = [];
      for(let dep of this.serverModel.nodejs_dependencies){
        this.serverModel.node_dependency.push({value: dep.id});
      }
      delete this.serverModel.nodejs_dependencies;
    }else{
      this.serverModel.node_dependency = [
        {value: null}
      ];
      delete this.serverModel.nodejs_dependencies;
    }
  }

  setupServer(){
    //Prepare form model
    this.prepareToEdit();

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
    let isUpdateProject = false;

    this.uploader.onSuccessItem = (item: any, response: any, status: any, headers: any) => {
      //Additional check for create project
      if(isUpdateProject)
        return

      isUpdateProject = true;

      response = JSON.parse(response);
      if(!response.length){
        this.errorMsg = 'File not uploaded properly!';
        return;
      }

      if(this.modelApi){
        //Setup files id`s
        for(let file of response){
          if(this.modelApi.ssh_key && this.modelApi.ssh_key.name === file.name)
            this.modelApi.ssh_key = file.id;
        }
      }

      //Timeout for fix multiple responses
      setTimeout(() => {

        //Increase index and re-upload
        this.uploadModelIndex++;

        const isAvaliable = this.uploadFiles();
        if(!isAvaliable){
          const proceed_setup = this.modelApi.proceed_setup;
          delete this.modelApi.proceed_setup;

          //Update project
          this.api.update(`server/${this.serverId}`, this.modelApi).then((project) => {
            isUpdateProject = false;

            //PROJECT CREATED
            if(proceed_setup){
              this.route.navigate([`console/${project.id}`], { queryParams: { start: 'true' } });
            }else{
              this.route.navigate([`servers`]);
            }
          }, (err) => {
            isUpdateProject = false;
            this.errorMsg = err;
          });
        }else{
          isUpdateProject = false;
        }

      }, 250);

    };
  }

  addPemFile(ev, model){
    model.ssh_key = ev.target.files[0];
  }

  addRepeatField(arr){
    arr.push({value: null});
  }

  removeRepeatField(arr, key){
    arr.splice(key, 1);
  }

  cleanFields(arr){
    arr[0].value = null;
  }

  validateModel(model){
    if(
        !model.Server_name
    )
      return 'Please input all required fields.';

    if(model.avaliable_ports){
      const portRegex = new RegExp('^[0-9]+$', 'gm');
      const availiablePortRegex = new RegExp('^[0-9 ]+$', 'gm');

      if(!portRegex.test(model.avaliable_ports)){
        if(!availiablePortRegex.test(model.avaliable_ports)){
          return 'Avaliable ports is invalid. Please use: numbers. Separate ports by whitespace';
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

    //Create new model fields
    newModel.server_dependencies = [];
    newModel.nodejs_dependencies = [];

    //Fill model fields
    for(let obj of newModel.server_dependency){
      if(obj.value)
        newModel.server_dependencies.push(obj.value);
    }
    for(let obj of newModel.node_dependency){
      if(obj.value)
        newModel.nodejs_dependencies.push(obj.value);
    }

    if(!newModel.ssh_key)
      delete newModel.ssh_key;

    //Cleanup model fields
    delete newModel.server_dependency;
    delete newModel.node_dependency;

    return newModel;
  }

  isFileUploaded(){
    let hasFiles = false;

    for(let server of this.modelApi.servers){
      if(server.ssh_key){
        hasFiles = true;
        break;
      }
    }

    return hasFiles;
  }

  proceedToUpdate(start = false){
    //Validate models
    let hasErrors = false;

    if(hasErrors){
      window.scrollTo(0, 1);
      return false;
    }
    this.errorMsg = '';
    if(!this.serverModel.Server_name) {
      this.errorMsg = 'Server name is required';
      return false;
    } else {
      const serverNameRegex = new RegExp('^[-_a-zA-Z0-9]+$', 'gm');
      if(!serverNameRegex.test(this.serverModel.Server_name)){
        this.errorMsg = 'Server name is invalid. Please use: alphabetic characters, numbers, "-" or "_"';
        return false;
      }
    }

    //Prepare model for api
    this.modelApi = this.prepareModel(this.serverModel);

    //Remove all files from queue
    this.uploader.queue = [];

    //Check if user upload any files
    if(this.isFileUploaded()){
      this.uploadModelIndex = 0;
      this.uploadFiles();
    }else{
      const proceed_setup = this.modelApi.proceed_setup;
      delete this.modelApi.proceed_setup;

      //Cleanup server
      delete this.modelApi.ssh_key;

      //Update project
      this.api.update(`server/${this.serverId}`, this.modelApi).then((project) => {
        //PROJECT CREATED
        if(proceed_setup){
          this.route.navigate([`console/${project.id}`], { queryParams: { start: 'true' } });
        }else{
          this.route.navigate([`servers`]);
        }
      }, (err) => {
        this.errorMsg = err;
      });
    }

    return false;
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

    if(!files.length){
      this.uploadModelIndex++;
      return this.uploadFiles();
    }

    //Attach file
    this.uploader.addToQueue(files);

    //Send files
    this.uploader.uploadAllFiles('files', 'POST');

    return true;
  }
}
