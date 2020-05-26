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
        dependency_list:[],
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
        if (this.settingsModel.dependency_list.length === 0) {
            this.selected();
        }            
    }

    selected() {
        this.isNew = true;
        this.auth.getUser().then((user) => {
            this.initUser();
            this.updateList();
              }, (err) => {
            this.route.navigate(['signin']);
        });
    }

    initUser() {
        this.settingsModel.dependency = {
            name:"",
            users: [this.auth.user.id],
            label:"",
            install_script:"",
        };
    }

    updateList() {
        this.api.get(`custom-dependencies`).then((resp) => {
            this.settingsModel.dependency_list = resp;
        });  
    }

    cleanFields() {
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

    validateRequiredFields() {
        var res = {status:true, msg:""};

        if (!this.settingsModel.dependency.name) {
            res.status = false;
            res.msg = "Dependancy name is required"
        }
        if (!this.settingsModel.dependency.label) {
            res.status = false;
            res.msg = "Dependancy label is required"
        }
        if (!this.settingsModel.dependency.install_script) {
            res.status = false;
            res.msg = "Dependancy install script is required"
        }

        return res;
    }

    update() {
        var name = this.settingsModel.dependency.name;

        if (!this.validateRequiredFields().status) {
            this.modal.alert(this.validateRequiredFields().msg);
            return;
        }

        if (this.validateName(name).status) {
            this.modal.confirm(
                `Confirm updating of "${name}" template`,
                "Do you really want to delete this template?<br>If yes, please input template name.",
                (value) => {
                  if(value !== name)
                    return 'Template name is incorrect!';
                },
                'Yes, please update!',
                'Don`t update'
            ).then((res) => {
                this.api.update(`custom-dependencies/${this.settingsModel.dependency.id}`, this.settingsModel.dependency).then((resp) => {
                    this.cleanFields();
                    this.updateList();
                    this.modal.alert(`Dependency ${name} was succesfully updated. To proceed with it, please select it from the list in the top of this page.`);  
                });  
                    }, (err) => {
                this.modal.alert(err);
            })
        } else {
            this.modal.alert(this.validateName(name).msg);
        }
    }

    delete() {
        if (!this.settingsModel.dependency.name) {
            this.modal.alert("You can't delete custom dependancy with no name");
            return;
          }
          this.modal.confirm(
            `Confirm deletion of "${this.settingsModel.dependency.name}"`,
            "Do you really want to delete this custom dependancy?<br>If yes, please input name.",
            (value) => {
              if(value !== this.settingsModel.dependency.name)
                return 'Custom dependancy name is incorrect!';
            },
            'Yes, please remove!',
            'Don`t remove'
        ).then((res) => {
            this.api.remove(`custom-dependencies/${this.settingsModel.dependency.id}`).then((resp) => {
                this.cleanFields();
                this.updateList();
                this.modal.alert(`Dependency ${name} was succesfully removed.`);  
            });  
              }, (err) => {
            this.modal.alert(err);
        })
    }

    createNew() {
        var name = this.settingsModel.dependency.name;

        if (!this.validateRequiredFields().status) {
            this.modal.alert(this.validateRequiredFields().msg);
            return;
        }

        if (this.validateName(name).status) {
            this.modal.confirm(
                `Confirm creating of "${name}" custom dependancy`,
                "Do you really want to update this custom dependancy?<br>If yes, please input name.",
                (value) => {
                  if(value !== name)
                    return 'Custom dependancy name is incorrect!';
                },
                'Yes, please create!',
                'Don`t create'
            ).then((res) => {
                this.api.create(`custom-dependencies`, this.settingsModel.dependency).then((resp) => {
                    this.cleanFields();
                    this.updateList();
                    this.modal.alert(`Dependency ${name} was succesfully created. To proceed with it, please select it from the list in the top of this page.`);  
                });      
            }, (err) => {
                this.modal.alert(err);
            })
        } else {
            this.modal.alert(this.validateName(name).msg);
        }
    }

    dependencySelected() {
        if (this.settingsModel.dependency.name) {
            this.isNew = false;
        } else {
            this.isNew = true;
            this.initUser();
        }
    }
}