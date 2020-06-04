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
    name: "",
    label: "",
    install_script: "",
    is_new: true
  };

  settingsModel: any = {
    dependency_list: [],
    dependency: {
      name: "",
      users: [],
      label: "",
      install_script: "",
    }
  } as any;

  isNew: boolean = true;

  constructor(
    private api: ApiService,
    private auth: AuthService,
    private route: Router,
    private modal: ModalService
  ) { }

  ngOnInit() {
    this.isNew = true;
    this.auth.getUser().then(() => {
      this.prepareModel();
      this.updateList();
    });
  }

  /**
   * Prepare dependency model
   */
  prepareModel() {
    this.settingsModel.dependency = {
      name: "",
      users: [this.auth.user.id],
      label: "",
      install_script: "",
    };
  }

  /**
   * Update dependencies list
   */
  updateList() {
    this.api.get(`custom-dependencies`).then((res) => {
      this.settingsModel.dependency_list = res;
    });
  }

  /**
   * Update dependency model after select
   */
  dependencySelected() {
    if (this.settingsModel.dependency.name) {
      this.isNew = false;
    } else {
      this.isNew = true;
      this.prepareModel();
    }
  }

  /**
   * Cleanup model
   */
  cleanFields() {
    this.prepareModel();
  }

  /**
   * Validate name field
   *
   * @param name
   */
  validateName(name) {
    var res = {
      status: true,
      msg: ""
    };

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

  /**
   * Validate required fields
   */
  validateRequiredFields() {
    var res = {
      status: true,
      msg: ""
    };

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

  /**
   * Create new dependency
   */
  create() {
    const name = this.settingsModel.dependency.name;

    if (!this.validateRequiredFields().status) {
      this.modal.alert(this.validateRequiredFields().msg);
      return;
    }

    if (this.validateName(name).status) {
      this.modal.confirm(
        `Confirm creating of "${name}" custom dependency`,
        "Do you really want to update this custom dependency?<br>If yes, please input name.",
        (value) => {
          if(value !== name)
            return 'Custom dependency name is incorrect!';
        },
        'Yes, please create!',
        'Don`t create'
      ).then(() => {
        this.api.create(`custom-dependencies`, this.settingsModel.dependency).then((res) => {
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

  /**
   * Update existing dependency
   */
  update() {
    const name = this.settingsModel.dependency.name;

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
      ).then(() => {
        this.api.update(`custom-dependencies/${this.settingsModel.dependency.id}`, this.settingsModel.dependency).then((res) => {
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

  /**
   * Delete dependency action
   */
  delete() {
    if (!this.settingsModel.dependency.name) {
      this.modal.alert("You can't delete custom dependency with no name");
      return;
    }
    this.modal.confirm(
      `Confirm deletion of "${this.settingsModel.dependency.name}"`,
      "Do you really want to delete this custom dependency?<br>If yes, please input name.",
      (value) => {
        if(value !== this.settingsModel.dependency.name)
          return 'Custom dependency name is incorrect!';
      },
      'Yes, please remove!',
      'Don`t remove'
    ).then(() => {
      this.api.remove(`custom-dependencies/${this.settingsModel.dependency.id}`).then((res) => {
        this.cleanFields();
        this.updateList();

        this.modal.alert(`Dependency ${name} was succesfully removed.`);
      });
    }, (err) => {
      this.modal.alert(err);
    })
  }
}
