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

    //Validation error
    errorMsg: ''
  };
  
  serverModel: any = {
    server_dependency: [],
    custom_dependency: [],
    platform: "",
    ssh_key: {},
    users: []
  };
  platform_list: any = [];
  modelApi: any = {};

  platform: any;

  ports: any = "";
  jsonValidationMessage: any = "";

  //Lists
  server_dependency_list = [] as any;
  custom_dependency_list = [] as any;

  //Error
  errorMsg = false as any;

  //Server data
  server: any = {};
  serverId = null as any;

  isNew = false as boolean;

  serverDepsError = "";
  customDepsError = "";

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
    } else {
      this.setupServer();        
    }

    //Get server dependencies list
    this.api.get('/server-dependencies')
    .then(data => this.server_dependency_list = data, err => this.server_dependency_list = []);

    //Get nodejs dependencies list
    this.api.get('/custom-dependencies')
        .then(data => this.custom_dependency_list = data, err => this.custom_dependency_list = []);

    this.api.get(`platforms`).then((res) => {
      this.platform_list = res;
    });

    this.serverModel.users = [];
    this.auth.getUser().then((user) => {
      this.serverModel.users.push(this.auth.user.id);
    });
  }

  /**
   * Update prots list
   */
  portsUpdated() {
    this.jsonValidationMessage = "";

    let value = this.ports.split(',');
    if (Array.isArray(value)) {
      this.serverModel.ports = [];
      for (let s of value) {
        this.serverModel.ports.push(s.replace(/\s/g, ""));
      }
    } else {
      this.jsonValidationMessage = "Please enter environment names devided with comma";
    }
  }

  /**
   * Prot selected action
   */
  platformSelected() {
    for (let p of this.platform_list) {
      if (this.serverModel.platform === p.id) {
        this.platform = {};
        this.platform = p;
      }
    }  
  }

  /**
   * Prepare model to edit
   */
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

    this.ports = this.serverModel.ports;
    this.platform = this.serverModel.platform;
    if (this.serverModel.platform) {
      this.serverModel.platform = this.serverModel.platform.id;
    }
  }

  /**
   * Create new server
   */
  async createServer() {
    return new Promise((rs, rj) => {
      this.api.create(`server`, {}).then((server) => {
        this.server = server;
        this.serverId = server.id;
        rs();
      });
    })
  }

  /**
   * Setup server action
   */
  async setupServer() {
    //Prepare form model
    if (!this.isNew) {
      this.prepareToEdit();
    } else {
      this.serverModel= {
        server_dependency: [{value:""}],
        custom_dependency: [ {value:""} ],
        platform: ""
      };
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

  /**
   * Attach pem file to model
   *
   * @param ev
   * @param model
   */
  addPemFile(ev, model){
    model.ssh_key = ev.target.files[0];
    this.server.ssh_key = null;
  }

  /**
   * Validate dependencies list
   *
   * @param arr
   * @param withoutCheckingEmpty
   */
  validateDependencies(arr, withoutCheckingEmpty = false){
    let result: any = true;

    for(let item of arr) {
      if(!withoutCheckingEmpty){
        if (typeof item.value !== 'undefined' && !item.value) {
          result = "You already have empty field, please choose any dependency then you can add one more";
          break;
        }
      }

      let sameValue = true;
      for (let verifyItem of arr) {
        if (item.value === verifyItem.value) {
          if (!sameValue) {
            result = "All dependecies must be unique";
            break;
          }

          sameValue = false;
        }
      }
    }

    return result;
  }

  /**
   * Attach repeated field
   *
   * @param arr
   * @param typeError
   */
  addRepeatField(arr, typeError) {
    const isValid = this.validateDependencies(arr);

    if (isValid === true){
      this.serverDepsError = "";
      this.customDepsError = "";

      arr.push({value: ""});
    }else{
      if (typeError === 'server')
        this.serverDepsError = isValid;

      if (typeError === 'custom')
        this.customDepsError = isValid;
    }
  }

  /**
   * Remove repeated field
   *
   * @param arr
   * @param key
   * @param type
   */
  removeRepeatField(arr, key, type){
    const newArr = _.cloneDeep(arr);

    newArr.splice(key, 1);

    if(type === 'server')
      this.serverModel.server_dependency = newArr;

    if(type === 'custom')
      this.serverModel.custom_dependency = newArr;
  }

  /**
   * Reset field value
   *
   * @param arr
   */
  cleanFields(arr){
    arr[0] = {value:""};
  }

  /**
   * Make model validation
   *
   * @param model
   */
  validateModel(model){
    if(
        !model.server_name
        || !model.platform_list
        || !model.ssh_ip
        || !model.ssh_key
        || !model.ssh_username
        || !model.platform
        || !model.server_dependencies
        || !model.custom_dependencies
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

  /**
   * Prepare model for request
   *
   * @param model
   */
  prepareModel(model){
    const newModel = _.cloneDeep(model);

    newModel.platform = this.platform;
    //Create new model fields

    delete newModel.server_dependencies;
    newModel.server_dependencies = [];
    for (let obj of newModel.server_dependency) {
      if(obj && obj.value !== "")
        newModel.server_dependencies.push(obj.value);
    }

    delete newModel.custom_dependencies;
    newModel.custom_dependencies = [];
    for (let obj of newModel.custom_dependency) {
      if (obj && obj.value !== "")
        newModel.custom_dependencies.push(obj.value);
    }

    if(!newModel.ssh_key)
      delete newModel.ssh_key;

    delete newModel.custom_dependency;
    delete newModel.server_dependency;

    return newModel;
  }

  /**
   * Check if file is attached for upload
   */
  isFileUploaded(){
    let hasFiles = false;

    if (this.server.ssh_key) {
        hasFiles = true;
    }

    return hasFiles;
  }

  /**
   * Send update or create request
   *
   * @param start
   */
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
    } else

    if (!this.serverModel.platform) {
      this.errorMsg = 'Platform script is required';
      return false;
    } else

    if (!this.serverModel.ssh_ip) {
      this.errorMsg = 'Server ip address is required';
      return false;
    } else

    if (!this.serverModel.ssh_username) {
      this.errorMsg = 'Server user name is required';
      return false;
    } else

    if (!this.serverModel.ssh_key || !this.serverModel.ssh_key.name) {
      this.errorMsg = 'Server pem key is required';
      return false;
    } else {
      const serverNameRegex = new RegExp('^[-_a-zA-Z0-9]+$', 'gm');
      if (!serverNameRegex.test(this.serverModel.server_name)) {
        this.errorMsg = 'Server name is invalid. Please use: alphabetic characters, numbers, "-" or "_"';
        return false;
      }
    }

    this.validateModel(this.serverModel);

    this.serverDepsError = "";
    this.customDepsError = "";

    const isServerDepValid = this.validateDependencies(this.serverModel.server_dependency, true);
    if(isServerDepValid !== true){
      this.errorMsg = isServerDepValid;
      return false;
    }

    const isCustomDepValid = this.validateDependencies(this.serverModel.custom_dependency, true);
    if(isCustomDepValid !== true){
      this.errorMsg = isCustomDepValid;
      return false;
    }

    if (this.isNew) {
      await this.createServer();
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

  /**
   * Update server request
   *
   * @param model
   * @param proceed_setup
   */
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

  /**
   * Upload file request
   */
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
