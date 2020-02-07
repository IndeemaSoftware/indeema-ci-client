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

  //File uploader
  public uploader: MultipleFileUploaderService;

  modelDefault: any = {
    //CI templates
    ci_template: 'gitlab_ci',

    //OS
    os: 'ubuntu',

    //Project configuration
    app_name: '',
    desc: '',
    project_type: null,
    environment: 'development',
    app_port: '', //optional
    avaliable_ports: '',//optional

    //AWS S3 Config
    s3_user: '',
    s3_bucket_name: '',
    aws_access_key_id: '',
    aws_secret_access_key: '',
    s3_https: false,
    s3_region: null,

    //Server credentials
    ssh_host: '',
    ssh_username: '',
    ssh_pem: null,

    //Domain setup
    domain_name: null,
    lets_encrypt: false,
    custom_ssl_key: null,
    custom_ssl_crt: null,
    custom_ssl_pem: null,

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

  projectModel: any = {};

  modelApi: any = {};

  //Lists
  serversDeps = [] as any;
  nodejsDeps = [] as any;
  projectTypes = [] as any;
  awsRegions = [] as any;

  //Error
  errorMsg = false as any;

  //Project data
  project = null as any;
  projectId = null as any;

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
    this.projectId = this.activatedRoute.snapshot.params['id'];
    if(!this.projectId){
      this.route.navigate([`projects`]);
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

    //Get nodejs dependencies list
    this.api.get('/project-types')
        .then(data => this.projectTypes = data, err => this.projectTypes = []);

    //Get AWS regions
    this.api.get('/aws/regions')
        .then(data => this.awsRegions = data, err => this.awsRegions = []);

    //Get project
    this.api.get(`/projects/${this.projectId}`)
        .then(data => {
          this.project = data;
          this.setupProject();
        }, err => {
          this.modal.alert(err);
          this.route.navigate([`projects`]);
        });
  }

  prepareToEdit(){
    this.projectModel = _.cloneDeep(this.project.plain());
    this.modelApi = {};

    //Prepare model apps
    for(var i = 0; i < this.projectModel.apps.length; i++){
      this.activeTab = this.projectModel.apps[i].id;

      //Clean from dependencies
      delete this.projectModel.apps[i].console;
      delete this.projectModel.apps[i].project;

      //Prepare project type
      this.projectModel.apps[i].project_type = this.projectModel.apps[i].project_type.id;

      //Remove exist cert
      this.projectModel.apps[i].ssh_pem = null;
      this.projectModel.apps[i].custom_ssl_key = null;
      this.projectModel.apps[i].custom_ssl_crt = null;
      this.projectModel.apps[i].custom_ssl_pem = null;

      //Prepare server dependencies
      if(this.projectModel.apps[i].server_dependencies && this.projectModel.apps[i].server_dependencies.length){
        this.projectModel.apps[i].server_dependency = [];
        for(let dep of this.projectModel.apps[i].server_dependencies){
          this.projectModel.apps[i].server_dependency.push({value: dep.id});
        }
        delete this.projectModel.apps[i].server_dependencies;
      }else{
        this.projectModel.apps[i].server_dependency = [
          {value: null}
        ];
        delete this.projectModel.apps[i].server_dependencies;
      }

      //Prepare nodejs dependencies
      if(this.projectModel.apps[i].nodejs_dependencies && this.projectModel.apps[i].nodejs_dependencies.length){
        this.projectModel.apps[i].node_dependency = [];
        for(let dep of this.projectModel.apps[i].nodejs_dependencies){
          this.projectModel.apps[i].node_dependency.push({value: dep.id});
        }
        delete this.projectModel.apps[i].nodejs_dependencies;
      }else{
        this.projectModel.apps[i].node_dependency = [
          {value: null}
        ];
        delete this.projectModel.apps[i].nodejs_dependencies;
      }
    }
  }

  setupProject(){
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

      if(this.modelApi.apps[this.uploadModelIndex]){
        //Setup files id`s
        for(let file of response){
          if(this.modelApi.apps[this.uploadModelIndex].ssh_pem && this.modelApi.apps[this.uploadModelIndex].ssh_pem.name === file.name)
            this.modelApi.apps[this.uploadModelIndex].ssh_pem = file.id;

          if(this.modelApi.apps[this.uploadModelIndex].custom_ssl_key && this.modelApi.apps[this.uploadModelIndex].custom_ssl_key.name === file.name)
            this.modelApi.apps[this.uploadModelIndex].custom_ssl_key = file.id;

          if(this.modelApi.apps[this.uploadModelIndex].custom_ssl_crt && this.modelApi.apps[this.uploadModelIndex].custom_ssl_crt.name === file.name)
            this.modelApi.apps[this.uploadModelIndex].custom_ssl_crt = file.id;

          if(this.modelApi.apps[this.uploadModelIndex].custom_ssl_pem && this.modelApi.apps[this.uploadModelIndex].custom_ssl_pem.name === file.name)
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
        }else{
          isUpdateProject = false;
        }

      }, 250);

    };
  }

  trackByFn(index, app) {
    return app.appId || app.id || index;
  }

  downloadTemplate(app){
    window.open(environment.API_URL + `/app/download/yml/${app.id}`,'_blank');
  }

  addNewApp(){
    const newApp = _.cloneDeep(this.modelDefault);
    newApp.appId = 'project-app-' + (this.projectModel.apps.length + 1) + new Date().getTime();

    this.projectModel.apps.push(newApp);

    //Open current tab
    this.openTab(newApp.appId);
  }

  removeApp(i){
    if(this.projectModel.apps[i].appId === this.activeTab || this.projectModel.apps[i].id === this.activeTab){
      if(this.projectModel.apps[0] && this.projectModel.apps[0].appId)
        this.openTab(this.projectModel.apps[0].appId);

      if(this.projectModel.apps[0] && this.projectModel.apps[0].id)
        this.openTab(this.projectModel.apps[0].id);
    }

    this.projectModel.apps.splice(i, 1);
  }

  addPemFile(ev, model){
    model.ssh_pem = ev.target.files[0];
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

  validateModel(model){
    if(
        !model.os
        || !model.app_name
        || !model.project_type
        || !model.environment
    )
      return 'Please input all required fields.';

    if(model.app_port){
      const portRegex = new RegExp('^[0-9]+$', 'gm');
      if(!portRegex.test(model.app_port)){
        return 'App port is invalid. Please use: numbers';
      }
    }

    if(model.avaliable_ports){
      const portRegex = new RegExp('^[0-9]+$', 'gm');
      const availiablePortRegex = new RegExp('^[0-9 ]+$', 'gm');

      if(!portRegex.test(model.avaliable_ports)){
        if(!availiablePortRegex.test(model.avaliable_ports)){
          return 'Avaliable ports is invalid. Please use: numbers. Separate ports by whitespace';
        }
      }
    }

    const appNameRegex = new RegExp('^[-_a-zA-Z0-9]+$', 'gm');
    if(!appNameRegex.test(model.app_name)){
      return 'App name is invalid. Please use: alphabetic characters, numbers, "-" or "_"';
    }

    if(model.os === 'aws_s3'){
      if(!model.s3_user || !model.s3_bucket_name || !model.aws_access_key_id || !model.aws_secret_access_key || !model.s3_region)
        return 'Please input all required fields.';

      const bucketNameRegex = new RegExp('^[-_a-zA-Z0-9]+$', 'gm');
      if(!bucketNameRegex.test(model.s3_bucket_name)){
        return 'AWS S3 Bucket name is invalid. Please use: alphabetic characters, numbers, "-" or "_"';
      }
    }else{
      if(!model.ssh_host || !model.ssh_username)
        return 'Please input all required fields.';
    }

    if(!model.id) {
      if(model.os !== 'aws_s3' && !model.ssh_pem)
        return 'Please input all required fields.';
    }

    if(model.lets_encrypt && !model.domain_name)
      return 'If you want to use Let`s encrypt please enter domain name.';

    if(model.lets_encrypt && model.domain_name){
      const domainNameRegex = new RegExp('^[-\.a-z]+$', 'gm');
      if(!domainNameRegex.test(model.domain_name)){
        return 'Domain name is invalid. For using Let`s Encript please use: alphabetic characters(lower case), "." or "-"';
      }
    }

    //Check if certs is try to upload
    if(model.custom_ssl_key || model.custom_ssl_crt || model.custom_ssl_pem){
      //Check if ssh pem and custom ssl pem have different names
      if(model.custom_ssl_pem && model.ssh_pem && model.custom_ssl_pem.name === model.ssh_pem.name){
        return 'SSH pem key and Custom SSL Pem key have the same names, please use different names.';
      }

      //Check if files has names
      if(
          (model.custom_ssl_key && !model.custom_ssl_key.name) ||
          (model.custom_ssl_crt && !model.custom_ssl_crt.name) ||
          (model.custom_ssl_pem && !model.custom_ssl_pem.name)
      ){
        return 'SSL files not upload properly, please upload files one more time.';
      }

      if(!model.id) {
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

      if(model.custom_ssl_pem) {
        const extentionPem = model.custom_ssl_pem.name.split('.').pop();
        if (extentionPem !== 'pem')
          return 'SSL Pem file is not valid, please upload file with .pem extention.';
      }
    }

    //Check server dependencies unique
    let isServerUnique = true;
    for(let dep of model.server_dependency){
      let breakCycle = false;
      let firstCycle = true;
      for(let depin of model.server_dependency){
        if(dep.value && depin.value && dep.value === depin.value && firstCycle){
          firstCycle = false;
        }else if(dep.value && depin.value && dep.value === depin.value && !firstCycle){
          breakCycle = true;
          isServerUnique = false;
          break;
        }else if(dep.value && depin.value && !firstCycle){
          let depObject = null;
          let depinObject = null;

          for(let obj of this.serversDeps){
            if(dep.value === obj.id)
              depObject = obj;

            if(depin.value === obj.id)
              depinObject = obj;

            if(depObject && depinObject)
              break;
          }

          if(depObject.package === depinObject.package){
            breakCycle = true;
            isServerUnique = false;
            break;
          }
        }
      }
      if(breakCycle)
        break;
    }
    if(!isServerUnique)
      return 'Server dependencies must be unique.'

    //Check nodejs dependencies unique
    let isNodejsUnique = true;
    for(let dep of model.node_dependency){
      let breakCycle = false;
      let firstCycle = true;
      for(let depin of model.node_dependency){
        if(dep.value && depin.value && dep.value === depin.value && firstCycle){
          firstCycle = false;
        }else if(dep.value && depin.value && dep.value === depin.value && !firstCycle){
          breakCycle = true;
          isNodejsUnique = false;
          break;
        }
      }
      if(breakCycle)
        break;
    }
    if(!isNodejsUnique)
      return 'Node.JS dependencies must be unique.'

    return false;
  }

  prepareModel(model){
    const newModel = _.cloneDeep(model);

    for(var i = 0; i < newModel.apps.length; i++){

      //Create new model fields
      newModel.apps[i].server_dependencies = [];
      newModel.apps[i].nodejs_dependencies = [];

      //Fill model fields
      for(let obj of newModel.apps[i].server_dependency){
        if(obj.value)
          newModel.apps[i].server_dependencies.push(obj.value);
      }
      for(let obj of newModel.apps[i].node_dependency){
        if(obj.value)
          newModel.apps[i].nodejs_dependencies.push(obj.value);
      }

      if(!newModel.apps[i].custom_ssl_key)
        delete newModel.apps[i].custom_ssl_key;

      if(!newModel.apps[i].custom_ssl_crt)
        delete newModel.apps[i].custom_ssl_crt;

      if(!newModel.apps[i].custom_ssl_pem)
        delete newModel.apps[i].custom_ssl_pem;

      if(!newModel.apps[i].ssh_pem)
        delete newModel.apps[i].ssh_pem;

      //Cleanup model fields
      delete newModel.apps[i].server_dependency;
      delete newModel.apps[i].node_dependency;
      delete newModel.apps[i].appId;
    }
    return newModel;
  }

  isFileUploaded(){
    let hasFiles = false;

    for(let app of this.modelApi.apps){
      if(app.ssh_pem){
        hasFiles = true;
        break;
      }

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

  proceedToUpdate(start = false){
    //Validate models
    let hasErrors = false;
    for(var i = 0; i < this.projectModel.apps.length; i++){
      this.projectModel.apps[i].errorMsg = this.validateModel(this.projectModel.apps[i]);
      if(this.projectModel.apps[i].errorMsg)
        hasErrors = true;
    }

    if(hasErrors){
      window.scrollTo(0, 1);
      return false;
    }
    this.errorMsg = '';
    if(!this.projectModel.project_name) {
      this.errorMsg = 'Project name is required';
      return false;
    }else{
      const projectNameRegex = new RegExp('^[-_a-zA-Z0-9]+$', 'gm');
      if(!projectNameRegex.test(this.projectModel.project_name)){
        this.errorMsg = 'Project name is invalid. Please use: alphabetic characters, numbers, "-" or "_"';
        return false;
      }
    }

    //Prepare model for api
    this.modelApi = this.prepareModel(this.projectModel);

    //Remove all files from queue
    this.uploader.queue = [];

    //Check if user upload any files
    if(this.isFileUploaded()){
      this.uploadModelIndex = 0;
      this.uploadFiles();
    }else{
      const proceed_setup = this.modelApi.proceed_setup;
      delete this.modelApi.proceed_setup;

      //Cleanup apps
      for(var i = 0; i < this.modelApi.apps.length; i++){
        delete this.modelApi.apps[i].ssh_pem;
        delete this.modelApi.apps[i].custom_ssl_key;
        delete this.modelApi.apps[i].custom_ssl_crt;
        delete this.modelApi.apps[i].custom_ssl_pem;
      }

      //Update project
      this.api.update(`projects/${this.projectId}`, this.modelApi).then((project) => {
        //PROJECT CREATED
        if(proceed_setup){
          this.route.navigate([`console/${project.id}`], { queryParams: { start: 'true' } });
        }else{
          this.route.navigate([`projects`]);
        }
      }, (err) => {
        this.errorMsg = err;
      });
    }

    return false;
  }

  uploadFiles(){
    //If models finish
    if(!this.modelApi.apps[this.uploadModelIndex])
      return false;

    //Remove all files from queue
    this.uploader.queue = [];

    //Prepare files list
    const files = [];
    if(this.modelApi.apps[this.uploadModelIndex].ssh_pem)
      files.push(this.modelApi.apps[this.uploadModelIndex].ssh_pem);
    if(this.modelApi.apps[this.uploadModelIndex].custom_ssl_key)
      files.push(this.modelApi.apps[this.uploadModelIndex].custom_ssl_key);
    if(this.modelApi.apps[this.uploadModelIndex].custom_ssl_crt)
      files.push(this.modelApi.apps[this.uploadModelIndex].custom_ssl_crt);
    if(this.modelApi.apps[this.uploadModelIndex].custom_ssl_pem)
      files.push(this.modelApi.apps[this.uploadModelIndex].custom_ssl_pem);

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

  /**
   * Open tab
   */
  openTab(name){
    this.activeTab = name;
  }
}
