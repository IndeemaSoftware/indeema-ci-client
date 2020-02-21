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
        post_install_script:""
    };

    settingsModel: any = {
        dependency: {
            name:"",
            label:"",
            package:"",
            pre_install_script:"",
            post_install_script:""
        }
    } as any;

    constructor(
        private api: ApiService,
        private auth: AuthService,
        private route: Router,
        private modal: ModalService
    ) { };

    ngOnInit() {
        this.updateList();
    }

    updateList() {
        this.api.get(`server-dependencies`).then((resp) => {
            this.settingsModel.dependency_list = resp;
        });  
    }

    cleanFields() {
        this.settingsModel.dependency = this.newDependency;
    }

    createNew() {
        console.log("Create new");
    }

    dependencySelected() {
        console.log("Dependency selected");
    }
}