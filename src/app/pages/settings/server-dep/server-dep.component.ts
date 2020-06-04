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
    this.isNew = true;
    this.auth.getUser().then((user) => {
      this.initUser();
      this.updateList();
    });
  }

  initUser() {
    this.settingsModel.dependency = {
      name:"",
      users: [this.auth.user.id],
      label:"",
      package:"",
      pre_install_script:"",
      post_install_script:"",
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
        res.msg = 'Dependancy package name is invalid. Please use: letters and numbers only'
      } else {
        res.status = true;
        res.msg = `Let's go`;
      }
    } else {
      res.status = false;
      res.msg = `Dependancy package name can't be empty`;
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
    if (!this.settingsModel.dependency.pre_install_script) {
      res.status = false;
      res.msg = "Dependancy install script is required"
    }
    if (!this.settingsModel.dependency.post_install_script) {
      res.status = false;
      res.msg = "Dependancy post install script is required"
    }

    return res;
  }

  update() {
    var name = this.settingsModel.dependency.package;

    if (!this.validateRequiredFields().status) {
      this.modal.alert(this.validateRequiredFields().msg);
      return;
    }

    if (this.validateName(name).status) {
      this.modal.confirm(
        `Confirm updating of "${name}" Ddpendancy`,
        "Do you really want to update this dependancy?<br>If yes, please input dependancy name.",
        (value) => {
          if(value !== name)
            return 'Dependancy name is incorrect!';
        },
        'Yes, please update!',
        'Don`t update'
      ).then((res) => {
        this.api.update(`server-dependencies/${this.settingsModel.dependency.id}`, this.settingsModel.dependency).then((resp) => {
          this.updateList();
          this.modal.alert(`Dependency ${name} was succesfully updated.`);
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
      this.modal.alert("You can't delete dependancy with no name");
      return;
    }

    this.modal.confirm(
      `Confirm deletion of "${name}" dependancy`,
      "Do you really want to delete this dependancy?<br>If yes, please input dependancy name.",
      (value) => {
        if(value !== name)
          return 'Dependancy name is incorrect!';
      },
      'Yes, please remove!',
      'Don`t remove'
    ).then((res) => {
      this.api.remove(`server-dependencies/${this.settingsModel.dependency.id}`).then((resp) => {
        this.updateList();
        this.cleanFields();
        this.modal.alert(`Dependency ${name} was succesfully removed.`);
      });
    }, (err) => {
      this.modal.alert(err);
    })
  }

  createNew() {
    var name = this.settingsModel.dependency.package;

    if (!this.validateRequiredFields().status) {
      this.modal.alert(this.validateRequiredFields().msg);
      return;
    }

    if (this.validateName(name).status) {
      this.modal.confirm(
        `Confirm creating of "${name}" dependancy`,
        "Do you really want to create this dependancy?<br>If yes, please input dependancy name.",
        (value) => {
          if(value !== name)
            return 'Dependancy name is incorrect!';
        },
        'Yes, please create!',
        'Don`t create'
      ).then((res) => {
        this.api.create(`server-dependencies`, this.settingsModel.dependency).then((resp) => {
          this.cleanFields();
          this.updateList();
          this.modal.alert(`Dependency ${name} was succesfully created. To proceed working with it please select it from list in the top of page.`);
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
