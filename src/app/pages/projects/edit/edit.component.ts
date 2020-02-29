import { Component, OnInit } from '@angular/core';
import { environment } from "../../../../environments/environment";
import { AuthService } from '../../../services/auth.service';
import { Router, ActivatedRoute } from '@angular/router';
import { ApiService } from '../../../services/api.service';
import { MultipleFileUploaderService } from '../../../services/multiple-file-uploader.service';
import * as _ from 'lodash';
import { ModalService} from '../../../services/modal.service';

@Component({
  selector: 'app-edit',
  templateUrl: './edit.component.html',
  styleUrls: ['./edit.component.css']
})
export class EditComponent implements OnInit {
  api_url = environment.API_URL;

  success = "success";

  //File uploader
  public uploader: MultipleFileUploaderService;

  modelDefault: any = {
    //CI templates
    ci_template: 'gitlab_ci',

    //Project configuration
    app_name: '',
    desc: '',
    environment: 'development',
    app_port:'',

    //Domain setup
    domain_name: null,
    automatic_cert: false,
    custom_ssl_key: null,
    custom_ssl_crt: null,
    custom_ssl_pem: null,

    //Validation error
    errorMsg: ''
  };

  projectModel: any = {
    project_name:"",
    users: [],
    apps: []
  };

  environments: any = "";
  jsonValidationMessage: any = "";

  isNew: boolean = false;
  ci_script_list: any;
  ci_script: any;
  ci_template_list: any;

  servers = null as  any;
  server = null as any;

  services = null as any;
  service = null as any;

  automatic_cert: boolean = false;

  modelApi: any = {};

  //Error
  errorMsg = false as any;

  //Project data
  project = null as any;
  projectId = null as any;
  app_port = 0;
  missing_port = false;

  //Upload model index
  uploadModelIndex = 0;

  /**
   * Tabs variables
   */
  activeTab = 'create-new-app';

  constructor(
      private api: ApiService,
      private auth: AuthService,
      private route: Router,
      private activatedRoute: ActivatedRoute,
      private modal: ModalService
  ) {
    let value = this.activatedRoute.snapshot.params['id'];
    if (value !== "new") {
      this.projectId = value;
      this.isNew = false;
    } else {
      this.isNew = true;
    }
}

  ngOnInit() {
    //Get project
    if (!this.isNew) {
      this.api.get(`/projects/${this.projectId}`)
      .then(data => {
        this.project = data;

        this.setupProject();
      }, err => {
        this.modal.alert(err);
        this.route.navigate([`projects`]);
      });
    } else {
      this.setupProject();
    }

    this.updateCIList();
    this.projectModel.users.push(this.auth.user.id);
    this.getServers();
    this.updateServiceList();
  }

  environmentsUpdated() {
    console.log("docUpdated");
    this.jsonValidationMessage = "";

    let value = this.environments.split(',');
    console.log(value);
    if (Array.isArray(value)) {
      this.projectModel.environments = [];
      for (let s of value) {
        this.projectModel.environments.push(s.replace(/\s/g, ""));
      }
    } else {
      this.jsonValidationMessage = "Please enter environment names devided with comma";
    }
  }

  updateServiceList() {
    this.api.get(`services`).then((resp) => {
      this.services = resp;
      this.serviceChosen();
    });  
  }

  serviceChosen() {
    var app;
    for (let a of this.projectModel.apps) {
      if (a.id === this.activeTab) {
        app = a;
      }
    }

    if (app) {
      for (let s of this.services) {
        if (app.service === s.id) {
          this.service = {};
          this.service = s;
        }
      }  
    }
  }

  getServerDetails(app) {
    //getting list of templates for selected script
    if (app && app.server) {
      this.api.get(`/server/${app.server.id}`)
      .then(data => {
        console.log(data);
        this.server = data;
        app.server = this.server.id;
      }, err => {
        this.modal.alert(err);
        this.route.navigate([`servers`]);
      });
    }
  }

  updateCIList() {
    this.api.get(`ci/script/listAll`).then((resp) => {
      this.ci_script_list = resp.data;
    });  
  }

  ciSelected() {
    var app;
    console.log(this.activeTab);
    for (let a of this.projectModel.apps) {
      console.log(a);
        if (a.id === this.activeTab) {
          app = a;
        }
    }
    console.log(app);
    //getting list of templates for selected script
    if (app && app.ci_script) {
      this.getTemplates(app.ci_script);
    } else {
      console.log("No template found");
    }
  }
  getTemplates(script) {
    this.api.get(`ci/template/listAll/${script}`).then((resp) => {
      console.log(resp.data);
      this.ci_template_list = resp.data;
    });  
  }

  getServers(){
    this.api.get('server').then((servers) => {
      this.servers = servers;

      this.serverChosen();
      for (let s of  this.servers) {
        if (s.server_dependencies === "lets encrypt" || s.server_dependencies === "let's encrypt" || s.server_dependencies === "lets_encrypt") {
          this.automatic_cert = true;
        } else if (s.custom_dependencies === "lets encrypt" || s.custom_dependencies === "let's encrypt" || s.custom_dependencies === "lets_encrypt") {
          this.automatic_cert = true;
        }
      }
    })
  }

  serverChosen() {
    var app;
    for (let a of this.projectModel.apps) {
      if (a.id === this.activeTab) {
        app = a;
      }
    }

    if (app) {
      for (let s of this.servers) {
        if (app.server === s.id) {
          this.server = {};
          this.server = s;

          if (this.server.ports && !this.server.ports.includes(this.app_port)) {
            this.missing_port = true;
          } else {
            this.missing_port = false;
          }
        }
      }  
    }
  }

  portSelected(port) {
    for (let a of this.projectModel.apps) {
      if (a.id === this.activeTab) {
        a.app_port = port
        this.app_port = port;
        this.missing_port = false;
      }
    }
  }

  prepareToEdit() {
    this.projectModel = _.cloneDeep(this.project.plain());
    this.modelApi = {};

    //Prepare model apps
    for (var i = 0; i < this.projectModel.apps.length; i++) {
      this.activeTab = this.projectModel.apps[i].id;


      //Clean from dependencies
      delete this.projectModel.apps[i].console;
      delete this.projectModel.apps[i].project;

      //Remove exist cert
      this.projectModel.apps[i].custom_ssl_key = null;
      this.projectModel.apps[i].custom_ssl_crt = null;
      this.projectModel.apps[i].custom_ssl_pem = null;

      //init servers
      this.projectModel.apps[i].server = this.projectModel.apps[i].server.id;

      //init services
      this.projectModel.apps[i].service = this.projectModel.apps[i].service.id;
    }

    if (this.project.apps.length > 0) {
      this.activeTab = this.project.apps[0].id;
      this.getTemplates(this.project.apps[0].ci_script);
      this.app_port = this.project.apps[0].app_port;

      this.getServerDetails(this.project.apps[0]);
    }

    this.environments = this.project.environments;
  }

  setupProject(){
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
    let isUpdateProject = false;

    this.uploader.onSuccessItem = (item: any, response: any, status: any, headers: any) => {
      //Additional check for create project
      if (isUpdateProject)
        return

      isUpdateProject = true;

      response = JSON.parse(response);
      if (!response.length) {
        this.errorMsg = 'File not uploaded properly!';
        return;
      }

      if (this.modelApi.apps[this.uploadModelIndex]) {
        //Setup files id`s
        for (let file of response) {
          if (this.modelApi.apps[this.uploadModelIndex].custom_ssl_key && this.modelApi.apps[this.uploadModelIndex].custom_ssl_key.name === file.name)
            this.modelApi.apps[this.uploadModelIndex].custom_ssl_key = file.id;

          if (this.modelApi.apps[this.uploadModelIndex].custom_ssl_crt && this.modelApi.apps[this.uploadModelIndex].custom_ssl_crt.name === file.name)
            this.modelApi.apps[this.uploadModelIndex].custom_ssl_crt = file.id;

          if (this.modelApi.apps[this.uploadModelIndex].custom_ssl_pem && this.modelApi.apps[this.uploadModelIndex].custom_ssl_pem.name === file.name)
            this.modelApi.apps[this.uploadModelIndex].custom_ssl_pem = file.id;
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
          if (this.isNew) {
            this.api.create(`projects/${this.projectId}`, this.modelApi).then((project) => {
              isUpdateProject = false;
  
              //PROJECT CREATED
              if(proceed_setup){
                this.route.navigate([`console/${project.id}`], { queryParams: { start: 'true' } });
              }else{
                this.route.navigate([`projects`]);
              }
            }, (err) => {
              isUpdateProject = false;
              this.errorMsg = err;
            });
          } else {
            this.api.update(`projects/${this.projectId}`, this.modelApi).then((project) => {
              isUpdateProject = false;
  
              //PROJECT CREATED
              if(proceed_setup){
                this.route.navigate([`console/${project.id}`], { queryParams: { start: 'true' } });
              }else{
                this.route.navigate([`projects`]);
              }
            }, (err) => {
              isUpdateProject = false;
              this.errorMsg = err;
            });
          }

        } else {
          isUpdateProject = false;
        }

      }, 250);

    };
  }

  trackByFn(index, app) {
    return app.id || app.id || index;
  }

  downloadTemplate(app){
    window.open(environment.API_URL + `/app/download/yml/${app.id}`,'_blank');
  }

  addNewApp() {
    const newApp = _.cloneDeep(this.modelDefault);
    newApp.id = 'project-app-' + (this.projectModel.apps.length + 1) + new Date().getTime();

    this.projectModel.apps.push(newApp);

    //Open current tab
    this.openTab(newApp.id);
  }

  removeApp(i){
    if(this.projectModel.apps[i].id === this.activeTab || this.projectModel.apps[i].id === this.activeTab){
      if(this.projectModel.apps[0] && this.projectModel.apps[0].id)
        this.openTab(this.projectModel.apps[0].id);

      if(this.projectModel.apps[0] && this.projectModel.apps[0].id)
        this.openTab(this.projectModel.apps[0].id);
    }

    this.projectModel.apps.splice(i, 1);
  }

  addKeySSLFile(ev, model){
    model.custom_ssl_key = ev.target.files[0];
  }

  addCrtSSLFile(ev, model){
    model.custom_ssl_crt = ev.target.files[0];
  }

  addPemSSLFile(ev, model){
    model.custom_ssl_pem = ev.target.files[0];
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

  validateModel(model) {
    if (
        !model.server
        || !model.app_name
        || !model.environment
        || !model.ci_template
        || !model.app_port
        || !model.service
        || this.missing_port
    ) {
      return 'Please input all required fields.';
    } else if (!this.server.ports || this.server.ports.length == 0) {
      return 'You may not use this server as it doesn\'t have any open ports';
    }

    if (model.app_port) {
      const portRegex = new RegExp('^[0-9]+$', 'gm');
      if (!portRegex.test(model.app_port)) {
        return 'App port is invalid. Please use: numbers';
      }
    }

    const appNameRegex = new RegExp('^[-_a-zA-Z0-9]+$', 'gm');
    if (!appNameRegex.test(model.app_name)) {
      return 'App name is invalid. Please use: alphabetic characters, numbers, "-" or "_"';
    }


    if (model.automatic_cert && !model.domain_name)
      return 'If you want to use automatic certificates please enter domain name';

    if (model.automatic_cert && model.domain_name) {
      const domainNameRegex = new RegExp('^[-\.a-z]+$', 'gm');
      if (!domainNameRegex.test(model.domain_name)) {
        return 'Domain name is invalid. For using Let`s Encript please use: alphabetic characters(lower case), "." or "-"';
      }
    }

    //Check if certs is try to upload
    if (model.custom_ssl_key || model.custom_ssl_crt || model.custom_ssl_pem) {
      //Check if files has names
      if (
          (model.custom_ssl_key && !model.custom_ssl_key.name) ||
          (model.custom_ssl_crt && !model.custom_ssl_crt.name) ||
          (model.custom_ssl_pem && !model.custom_ssl_pem.name)
      ) {
        return 'SSL files not upload properly, please upload files one more time.';
      }

      if (!model.id) {
        //Check if all certs is included
        if (!model.custom_ssl_key || !model.custom_ssl_crt || !model.custom_ssl_pem) {
          return 'If you want to use custom certificate then you need to upload .key, .crt and .pem files.';
        }

        //Check if files has names
        if (!model.custom_ssl_key.name || !model.custom_ssl_crt.name || !model.custom_ssl_pem.name) {
          return 'SSL files not upload properly, please upload files one more time.';
        }
      }

      //Check files extentions
      if(model.custom_ssl_key){
        const extentionKey = model.custom_ssl_key.name.split('.').pop();
        if(extentionKey !== 'key')
          return 'SSL Key file is not valid, please upload file with .key extention.';
      }

      if(model.custom_ssl_crt) {
        const extentionCrt = model.custom_ssl_crt.name.split('.').pop();
        if (extentionCrt !== 'crt')
          return 'SSL Crt file is not valid, please upload file with .crt extention.';
      }
    }

    return false;
  }

  prepareModel(model){
    const newModel = _.cloneDeep(model);

    for (var i = 0; i < newModel.apps.length; i++) {

      if(!newModel.apps[i].custom_ssl_key)
        delete newModel.apps[i].custom_ssl_key;

      if(!newModel.apps[i].custom_ssl_crt)
        delete newModel.apps[i].custom_ssl_crt;

      if(!newModel.apps[i].custom_ssl_pem)
        delete newModel.apps[i].custom_ssl_pem;

      //Cleanup model fields
      delete newModel.apps[i].id;
    }
    return newModel;
  }

  isFileUploaded(){
    let hasFiles = false;

    for(let app of this.modelApi.apps){

      if(app.custom_ssl_key){
        hasFiles = true;
        break;
      }

      if(app.custom_ssl_crt){
        hasFiles = true;
        break;
      }

      if(app.custom_ssl_pem){
        hasFiles = true;
        break;
      }
    }

    return hasFiles;
  }

  proceedToUpdate(start = false) {
    //Validate models
    let hasErrors = false;
    for (var i = 0; i < this.projectModel.apps.length; i++) {
      this.projectModel.apps[i].errorMsg = this.validateModel(this.projectModel.apps[i]);
      if (this.projectModel.apps[i].errorMsg)
        hasErrors = true;
    }

    if (hasErrors) {
      window.scrollTo(0, 1);
      return false;
    }
    this.errorMsg = '';
    if (!this.projectModel.project_name) {
      this.errorMsg = 'Project name is required';
      return false;
    } else {
      const projectNameRegex = new RegExp('^[-_a-zA-Z0-9]+$', 'gm');
      if (!projectNameRegex.test(this.projectModel.project_name)) {
        this.errorMsg = 'Project name is invalid. Please use: alphabetic characters, numbers, "-" or "_"';
        return false;
      }
    }

    //Prepare model for api
    this.modelApi = this.prepareModel(this.projectModel);
    // this.modelApi.service = this.service;

    //Remove all files from queue
    this.uploader.queue = [];

    //Check if user upload any files
    if (this.isFileUploaded()) {
      this.uploadModelIndex = 0;
      this.uploadFiles();
    } else {
      const proceed_setup = this.modelApi.proceed_setup;
      delete this.modelApi.proceed_setup;

      //Cleanup apps
      for (var i = 0; i < this.modelApi.apps.length; i++) {
        delete this.modelApi.apps[i].custom_ssl_key;
        delete this.modelApi.apps[i].custom_ssl_crt;
        delete this.modelApi.apps[i].custom_ssl_pem;
      }

      //Update project
      if (this.isNew) {
        this.api.create(`projects/new`, this.modelApi).then((project) => {
          //PROJECT CREATED
          if (proceed_setup) {
            this.route.navigate([`console/${project.id}`], { queryParams: { start: 'true' } });
          } else {
            this.route.navigate([`projects`]);
          }
        }, (err) => {
          this.errorMsg = err;
        });
      } else {
        this.api.update(`projects/${this.projectId}`, this.modelApi).then((project) => {
          //PROJECT CREATED
          if (proceed_setup) {
            this.route.navigate([`console/${project.id}`], { queryParams: { start: 'true' } });
          } else {
            this.route.navigate([`projects`]);
          }
        }, (err) => {
          this.errorMsg = err;
        });
      }
    }

    return false;
  }

  uploadFiles() {
    //If models finish
    if (!this.modelApi.apps[this.uploadModelIndex])
      return false;

    //Remove all files from queue
    this.uploader.queue = [];

    //Prepare files list
    const files = [];
    if (this.modelApi.apps[this.uploadModelIndex].custom_ssl_key)
      files.push(this.modelApi.apps[this.uploadModelIndex].custom_ssl_key);
    if (this.modelApi.apps[this.uploadModelIndex].custom_ssl_crt)
      files.push(this.modelApi.apps[this.uploadModelIndex].custom_ssl_crt);
    if (this.modelApi.apps[this.uploadModelIndex].custom_ssl_pem)
      files.push(this.modelApi.apps[this.uploadModelIndex].custom_ssl_pem);

    if (!files.length) {
      this.uploadModelIndex++;
      return this.uploadFiles();
    }

    //Attach file
    this.uploader.addToQueue(files);

    //Send files
    this.uploader.uploadAllFiles('files', 'POST');

    return true;
  }

  /**
   * Open tab
   */
  openTab(name){
    this.activeTab = name;
  }
}
