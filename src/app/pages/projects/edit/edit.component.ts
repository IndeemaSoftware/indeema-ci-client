import { Component, OnInit } from '@angular/core';
import {environment} from "../../../../environments/environment";
import { FileUploader } from 'ng2-file-upload';
import {AuthService} from '../../../services/auth.service';
import {Router, ActivatedRoute} from '@angular/router';
import {ApiService} from '../../../services/api.service';

@Component({
  selector: 'app-edit',
  templateUrl: './edit.component.html',
  styleUrls: ['./edit.component.css']
})
export class EditComponent implements OnInit {
  api_url = environment.API_URL;

  //File uploader
  public uploader: FileUploader;

  model: any = {};
  modelApi: any = {};

  //Lists
  serversDeps = [] as any;
  nodejsDeps = [] as any;
  projectTypes = [] as any;

  //Error
  errorMsg = false as any;

  //Project data
  project = null as any;
  projectId = null as any;

  constructor(
      private api: ApiService,
      private auth: AuthService,
      private route: Router,
      private activatedRoute: ActivatedRoute,
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

    //Get project
    this.api.get(`/projects/${this.projectId}`)
        .then(data => {
          this.project = data;
          this.setupProject();
        }, err => {
          alert(err);
          this.route.navigate([`projects`]);
        });
  }

  prepareToEdit(){
    this.model = Object.assign({}, this.project);
    this.modelApi = {};

    //Prepare project type
    this.model.project_type = this.model.project_type.id;

    //Remove exist cert
    this.model.ssh_pem = null;

    //Prepare server dependencies
    if(this.model.server_dependencies && this.model.server_dependencies.length){
      this.model.server_dependency = [];
      for(let dep of this.model.server_dependencies){
        this.model.server_dependency.push({value: dep.id});
      }
      delete this.model.server_dependencies;
    }else{
      this.model.server_dependency = [
        {value: null}
      ];
      delete this.model.server_dependencies;
    }

    //Prepare nodejs dependencies
    if(this.model.nodejs_dependencies && this.model.nodejs_dependencies.length){
      this.model.node_dependency = [];
      for(let dep of this.model.nodejs_dependencies){
        this.model.node_dependency.push({value: dep.id});
      }
      delete this.model.nodejs_dependencies;
    }else{
      this.model.node_dependency = [
        {value: null}
      ];
      delete this.model.nodejs_dependencies;
    }
  }

  setupProject(){
    //Prepare form model
    this.prepareToEdit();

    const jwt = this.auth.getJWT();

    this.uploader = new FileUploader({
      url: this.api_url + '/upload',
      authToken: 'Bearer ' + jwt,
      itemAlias: 'files'
    });

    //If upload success
    this.uploader.onAfterAddingFile = (file) => {
      file.withCredentials = false;
      file.method = "POST";
    };
    this.uploader.onSuccessItem = (item: any, response: any, status: any, headers: any) => {
      response = JSON.parse(response);
      if(!response.length){
        this.errorMsg = 'File not uploaded properly!';
        return;
      }

      this.modelApi.ssh_pem = response[0].id;

      const proceed_setup = this.modelApi.proceed_setup;
      delete this.modelApi.proceed_setup;

      //Create new project
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
    };
  }

  addPemFile(ev){
    this.model.ssh_pem = ev.target.files[0];
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
        !model.project_name
        || !model.app_name
        || !model.project_type
        || !model.ssh_host
        || !model.ssh_username
    )
      return 'Please input all required fields.';

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
    const newModel = Object.assign({}, model);

    //Cleanup model fields
    delete newModel.server_dependency;
    delete newModel.node_dependency;

    //Create new model fields
    newModel.server_dependencies = [];
    newModel.nodejs_dependencies = [];

    //Fill model fields
    for(let obj of model.server_dependency){
      newModel.server_dependencies.push(obj.value);
    }
    for(let obj of model.node_dependency){
      newModel.nodejs_dependencies.push(obj.value);
    }

    return newModel;
  }

  proceedToUpdate(start = false){
    this.errorMsg = this.validateModel(this.model);
    if(this.errorMsg){
      return;
    }

    //Prepare model for api
    this.modelApi = this.prepareModel(this.model);

    //Remove all files from queue
    this.uploader.queue = [];

    //Start project setup
    this.modelApi.proceed_setup = start;

    //Send files
    if(this.modelApi.ssh_pem) {
      //Attach file
      this.uploader.addToQueue([this.modelApi.ssh_pem]);

      this.uploader.uploadAll();

    }else{
      const proceed_setup = this.modelApi.proceed_setup;
      delete this.modelApi.proceed_setup;
      delete this.modelApi.ssh_pem;

      //Create new project
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
}
