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

    validateName(name) {
        var res = {status:true, msg:""};

        if (name) {
            const regex = new RegExp('^[0-9a-zA-Z_-]+$', 'gm');
      
            if (!regex.test(name)) {
                res.status = false;
                res.msg = 'Dependancy name is invalid. Please use: letters and numbers only'
            } else {
                res.status = true;
                res.msg = `Let's go`;  
            }
        } else {
            res.status = false;
            res.msg = `Dependancy name can't be empty`;
    }

        return res;
    }

    update() {
        var name = this.settingsModel.dependency.name;
        
        if (this.validateName(name).status) {
            this.api.update(`custom-dependencies/${this.settingsModel.dependency.id}`, this.settingsModel.dependency).then((resp) => {
                this.cleanFields();
                this.updateList();
            });  
        } else {
            this.modal.alert(this.validateName(name).msg);
        }
    }

    delete() {
        this.api.remove(`custom-dependencies/${this.settingsModel.dependency.id}`).then((resp) => {
            this.cleanFields();
            this.updateList();
        });  
    }

    createNew() {
        if (this.validateName(this.settingsModel.dependency.name).status) {
            this.api.create(`custom-dependencies`, this.settingsModel.dependency).then((resp) => {
                this.updateList();
            });      
        } else {
            this.modal.alert(this.validateName(this.settingsModel.dependency.name).msg);
        }
    }

    dependencySelected() {
        if (this.settingsModel.dependency.name) {
            this.isNew = false;
        } else {
            this.initUser();
        }
    }
}