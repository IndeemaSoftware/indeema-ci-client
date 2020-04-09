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
        dependency_list:[],
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
        if (this.settingsModel.dependency_list.length === 0) {
            this.selected();
          }      
    }

    selected() {
        this.auth.getUser().then((user) => {
            this.initUser();
            this.updateList();
              }, (err) => {
            this.route.navigate(['signin']);
        });
    }

    initUser() {
        this.settingsModel = {
            dependency: {
                name:"",
                users: [this.auth.user.id],
                html_code: "",
                maintenance_list:[]                    
            }
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

    validateName(name) {
        var res = {status:true, msg:""};

        if (name) {
            const regex = new RegExp('^[0-9a-zA-Z_-]\.+$', 'gm');
      
            if (!regex.test(name)) {
                res.status = false;
                res.msg = 'Package name is invalid. Please use: letters and numbers only'
            } else {
                res.status = true;
                res.msg = `Let's go`;  
            }
        } else {
            res.status = false;
            res.msg = `Package name can't be empty`;
    }

        return res;
    }

    update() {
        var name = this.settingsModel.dependency.package;
        if (this.validateName(name).status) {
            this.modal.confirm(
                `Confirm updating of "${name}" template`,
                "Do you really want to delete this template?<br>If yes, please input template name.",
                (value) => {
                  if(value !== name)
                    return 'Template name is incorrect!';
                },
                'Yes, please remove!',
                'Don`t remove'
            ).then((res) => {
                this.api.update(`server-dependencies/${this.settingsModel.dependency.id}`, this.settingsModel.dependency).then((resp) => {
                    this.updateList();
                });  
                }, (err) => {
                this.modal.alert(err);
            })
        } else {
            this.modal.alert(this.validateName(name).msg);
        }
    }

    delete() {
        var name = this.settingsModel.dependency.name; 
        if (!name) {
            this.modal.alert("You can't delete service with no name");
            return;
          }

          this.modal.confirm(
            `Confirm deletion of "${name}" template`,
            "Do you really want to delete this template?<br>If yes, please input template name.",
            (value) => {
              if(value !== name)
                return 'Template name is incorrect!';
            },
            'Yes, please remove!',
            'Don`t remove'
        ).then((res) => {
            this.api.remove(`server-dependencies/${this.settingsModel.dependency.id}`).then((resp) => {
                this.updateList();
                this.cleanFields();
            });  
        }, (err) => {
            this.modal.alert(err);
        })
    }

    createNew() {
        var name = this.settingsModel.dependency.package;
        if (this.validateName(name).status) {
            this.modal.confirm(
                `Confirm deletion of "${name}" template`,
                "Do you really want to delete this template?<br>If yes, please input template name.",
                (value) => {
                  if(value !== name)
                    return 'Template name is incorrect!';
                },
                'Yes, please remove!',
                'Don`t remove'
            ).then((res) => {
                this.api.create(`server-dependencies`, this.settingsModel.dependency).then((resp) => {
                    this.updateList();
                    this.cleanFields();
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
            this.initUser();
            this.isNew = true;
        }
    }
}