import { Component, OnInit } from '@angular/core';
import {environment} from "../../../environments/environment";
import { FileUploader } from 'ng2-file-upload';
import {AuthService} from '../../services/auth.service';
import {Router} from '@angular/router';
import {ApiService} from '../../services/api.service';
import {MultipleFileUploaderService} from '../../services/multiple-file-uploader.service';
import * as _ from 'lodash';

@Component({
  selector: 'app-runner',
  templateUrl: './runner.component.html',
  styleUrls: ['./runner.component.css']
})
export class RunnerComponent implements OnInit {

  //File uploader
  public uploader: MultipleFileUploaderService;

  modelDefault: any = {
    //CI templates
    ci_template: 'gitlab_ci',

    //OS
    os: 'ubuntu',

    //Project configuration
    app_name: '',
    project_type: null,
    environment: 'development',
    app_port: '', //optional
    avaliable_ports: '',//optional

    //AWS S3 Config
    s3_project: false,
    s3_bucket_name: '',
    aws_access_key_id: '',
    aws_secret_access_key: '',

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

  //Error
  errorMsg = false as any;

  //Upload model index
  uploadModelIndex = 0;

  /**
   * Tabs variables
   */
  activeTab = 'create-new-app';//default open tab


  constructor(
    private api: ApiService,
    private auth: AuthService,
    private route: Router
  ) {
    //Prepare form model
    this.modelApi = {};

    const jwt = this.auth.getJWT();

    this.uploader = new MultipleFileUploaderService({
      url: environment.API_URL + '/upload',
      authToken: 'Bearer ' + jwt,
      itemAlias: 'files'
    });

    //Trigger for creating project
    let isCreatingProject = false;

    //If upload success
    this.uploader.onAfterAddingFile = (file) => {
      file.withCredentials = false;
      file.method = "POST";
    };
    this.uploader.onSuccessItem = (item: any, response: any, status: any, headers: any) => {

      //Additional check for create project
      if(isCreatingProject)
        return

      isCreatingProject = true;

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

          //Create new project
          this.api.create('projects/new', this.modelApi).then((project) => {
            isCreatingProject = false;

            //PROJECT CREATED
            if(proceed_setup){
              this.route.navigate([`console/${project.id}`], { queryParams: { start: 'true' } });
            }else{
              this.route.navigate([`projects`]);
            }
          }, (err) => {
            isCreatingProject = false;
            this.errorMsg = err;
          });
        }else{
          isCreatingProject = false;
        }

      }, 250);
    };
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

    //Prepare project model
    this.projectModel = {
      project_name: '',
      apps: []
    };
    this.addNewApp();
  }

  addNewApp(){
    const newApp = _.cloneDeep(this.modelDefault);
    newApp.appId = 'project-app-' + (this.projectModel.apps.length + 1) + new Date().getTime();

    this.projectModel.apps.push(newApp);

    //Open current tab
    this.openTab(newApp.appId);
  }

  removeApp(i){
    if(this.projectModel.apps[i].appId === this.activeTab){
      if(this.projectModel.apps[0] && this.projectModel.apps[0].appId)
        this.openTab(this.projectModel.apps[0].appId);
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

    if(model.s3_project){
      if(!model.s3_bucket_name || !model.aws_access_key_id || !model.aws_secret_access_key)
        return 'Please input all required fields.';
    }else{
      if(!model.ssh_host || !model.ssh_username || !model.ssh_pem)
        return 'Please input all required fields.';
    }

    if(model.lets_encrypt && !model.domain_name)
      return 'If you want to use Let`s encrypt please enter domain name.';

    //Check if certs is try to upload
    if(model.custom_ssl_key || model.custom_ssl_crt || model.custom_ssl_pem){
      //Check if ssh pem and custom ssl pem have different names
      if(model.ssh_pem && model.custom_ssl_pem && model.custom_ssl_pem.name === model.ssh_pem.name){
        return 'SSH pem key and Custom SSL Pem key have the same names, please use different names.';
      }

      //Check if all certs is included
      if(!model.custom_ssl_key || !model.custom_ssl_crt || !model.custom_ssl_pem){
        return 'If you want to use custom certificate then you need to upload .key, .crt and .pem files.';
      }

      //Check if files has names
      if(!model.custom_ssl_key.name || !model.custom_ssl_crt.name || !model.custom_ssl_pem.name){
        return 'SSL files not upload properly, please upload files one more time.';
      }

      //Check files extentions
      const extentionKey = model.custom_ssl_key.name.split('.').pop();
      if(extentionKey !== 'key')
        return 'SSL Key file is not valid, please upload file with .key extention.';

      const extentionCrt = model.custom_ssl_crt.name.split('.').pop();
      if(extentionCrt !== 'crt')
        return 'SSL Crt file is not valid, please upload file with .crt extention.';

      const extentionPem = model.custom_ssl_pem.name.split('.').pop();
      if(extentionPem !== 'pem')
        return 'SSL Pem file is not valid, please upload file with .pem extention.';

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

  proceedToIntall(start = false){

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
    }

    //Prepare model for api
    this.modelApi = this.prepareModel(this.projectModel);

    //Start project setup
    this.modelApi.proceed_setup = start;

    if(this.isFileUploaded()){
      //Start recrusion for upload files
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
      this.api.create('projects/new', this.modelApi).then((project) => {
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
