import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../../services/auth.service';
import { ApiService } from '../../../services/api.service';
import { Router } from '@angular/router';
import { ModalService } from '../../../services/modal.service';

@Component({
  selector: 'custom-dep',
  templateUrl: './custom-dep.component.html',
  styleUrls: ['./custom-dep.component.css']
})
export class CustomDepComponent implements OnInit {

    newDependency: {
        name:"",
        label:"",
        install_script:"",
        is_new:true
    };

    settingsModel: any = {
        dependency: {
            name:"",
            users: [],
            label:"",
            install_script:"",
        }
    } as any;

    isNew: boolean = true;

    constructor(
        private api: ApiService,
        private auth: AuthService,
        private route: Router,
        private modal: ModalService
    ) { };

    ngOnInit() {
        this.auth.getUser().then((user) => {
            this.initUser();
            this.updateList();
              }, (err) => {
            this.route.navigate(['signin']);
          });
    }

    initUser() {
        this.settingsModel.dependency ={
            dependency: {
                name:"",
                users: [this.auth.user.id],
                label:"",
                install_script:"",
            }
        };
    }

    updateList() {
        this.api.get(`custom-dependencies`).then((resp) => {
            this.settingsModel.dependency_list = resp;
        });  
    }

    cleanFields() {
        this.settingsModel.dependency = {
            name:"",
            users: [],
            label:"",
            install_script:"",
        };
        this.initUser();
    }

    update() {
        this.api.update(`custom-dependencies/${this.settingsModel.dependency.id}`, this.settingsModel.dependency).then((resp) => {
            this.updateList();
        });  
    }

    delete() {
        this.api.remove(`custom-dependencies/${this.settingsModel.dependency.id}`).then((resp) => {
            this.updateList();
        });  
    }

    createNew() {
        if (this.settingsModel.dependency) {
            this.api.create(`custom-dependencies`, this.settingsModel.dependency).then((resp) => {
                this.updateList();
            });      
        } else {
            this.modal.alert("Something went wrong");
        }
    }

    dependencySelected() {
        if (this.settingsModel.dependency.name) {
            this.isNew = false;
        } else {
            this.settingsModel.dependency = {
                name:"",
                users: [],
                label:"",
                install_script:"",
            };
            this.isNew = true;
            this.initUser();
        }
    }
}