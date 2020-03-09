import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../../services/auth.service';
import { ApiService } from '../../../services/api.service';
import { Router } from '@angular/router';
import { ModalService } from '../../../services/modal.service';

@Component({
  selector: 'server-dep',
  templateUrl: './server-dep.component.html',
  styleUrls: ['./server-dep.component.css']
})
export class ServerDepComponent implements OnInit {

    newDependency: {
        name:"",
        label:"",
        package:"",
        pre_install_script:"",
        post_install_script:"",
        is_new:true
    };

    settingsModel: any = {
        dependency: {
            name:"",
            users: [],
            label:"",
            package:"",
            pre_install_script:"",
            post_install_script:""
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
        this.settingsModel.maintenance = {
            name:"",
            users: [this.auth.user.id],
            html_code: "",
            maintenance_list:[]
          };
    }

    updateList() {
        this.api.get(`server-dependencies`).then((resp) => {
            this.settingsModel.dependency_list = resp;
        });  
    }

    cleanFields() {
        this.initUser();
    }

    update() {
        this.api.update(`server-dependencies/${this.settingsModel.dependency.id}`, this.settingsModel.dependency).then((resp) => {
            this.updateList();
        });  
    }

    delete() {
        this.api.remove(`server-dependencies/${this.settingsModel.dependency.id}`).then((resp) => {
            this.updateList();
        });  
    }

    createNew() {
        if (this.settingsModel.dependency) {
            this.api.create(`server-dependencies`, this.settingsModel.dependency).then((resp) => {
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
            this.initUser();
            this.isNew = true;
        }
    }
}