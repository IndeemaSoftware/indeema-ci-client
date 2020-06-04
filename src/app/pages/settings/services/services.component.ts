import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../../services/auth.service';
import { ApiService } from '../../../services/api.service';
import { ModalService } from '../../../services/modal.service';

@Component({
  selector: 'services',
  templateUrl: './services.component.html',
  styleUrls: ['./services.component.css']
})
export class ServicesComponent implements OnInit {

  newService: {
    service_name: "",
    variables: [{
      key: "",
      value: ""
    }],
    doc_string: "", 
    jsonValidationMessage: ""
  };

  settingsModel: any = {
    service_list: [],
    service: {
      service_name: "",
      variables: [{
        key: "",
        value: ""
      }],
      doc_string: "", 
      jsonValidationMessage: ""
    } as any
  };

  isNewService: boolean = true;
  isVariableUnique: boolean = true;

  constructor (
    private api: ApiService,
    private modal: ModalService,
    private auth: AuthService,
  ) { }

  ngOnInit() {
    this.isNewService = true;
    this.auth.getUser().then(() => {
      this.prepareModel();
      this.updateServiceList();
    });
  }

  /**
   * Prepare service model
   */
  prepareModel() {
    this.settingsModel.service = {
      service_name:"",
      users: [this.auth.user.id],
      variables: [{
        key: "",
        value: ""
      }],
      doc_string: "", 
      jsonValidationMessage: ""
    };
  }

  /**
   * Update fields when select service
   *
   * @param service
   */
  serviceSelected(service) {
    if (service) {
      delete service.apps;//deleting servers from platform is needed for platform updating

      this.isNewService = false;
      this.settingsModel.doc_string = JSON.stringify(service.doc, undefined, 2);    
    } else {
      this.isNewService = true;
      this.cleanServiceFields();
    }
  }

  /**
   * Update service fields
   * @param data
   */
  updateServiceFields(data) {
    this.settingsModel.service = data;
    this.updateServiceList();
  }

  /**
   * Cleanup service fields
   */
  cleanServiceFields() {
    this.isNewService = true;
    this.settingsModel.new_service_name = "";
    this.settingsModel.doc_string = "";

    this.prepareModel();
    this.updateServiceList();
  }

  /**
   * Update service list
   */
  updateServiceList() {
    this.api.get(`services`).then((res) => {
      this.settingsModel.service_list = res;
    });  
  }

  /**
   * Parse JSON doc to object
   */
  saveDocJson() {
    if (this.settingsModel.doc_string && this.settingsModel.doc_string.length) {
      this.settingsModel.service.doc = JSON.parse(this.settingsModel.doc_string);
    }
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
        res.msg = 'Service name is invalid. Please use: letters and numbers only'
      } else {
        res.status = true;
        res.msg = `Let's go`;
      }
    } else {
      res.status = false;
      res.msg = `Service name can't be empty`;
    }

    return res;
  }

  /**
   * Validate all required fields
   */
  validateRequiredFields() {
    var res = {
      status: true,
      msg: ""
    };

    if (!this.settingsModel.service.service_name) {
        res.status = false;
        res.msg = "Service name is required"
    }
    if (!this.settingsModel.service.setup_script) {
        res.status = false;
        res.msg = "Setup script is required"
    }
    if (!this.settingsModel.service.cleanup_script) {
        res.status = false;
        res.msg = "Cleanup script is required"
    }

    return res;
  }

  /**
   * Create new service
   */
  createService() {
    const name = this.settingsModel.service.service_name;

    if (!this.isVariableUnique) {
      this.modal.alert(`Variable names should be unique`);
      return;
    }


    if (!this.validateRequiredFields().status) {
      this.modal.alert(this.validateRequiredFields().msg);
      return;
    }

    if (this.validateName(name).status) {
      this.modal.confirm(
        `Confirm creating of "${name}" service`,
        "Do you really want to save changes of service?<br>If yes, please input service name.",
        (value) => {
          if (value !== name)
            return 'Service name is incorrect!';
        },
        'Yes, please create!',
        'Don`t create'
      ).then(() => {
        this.saveDocJson();
        this.api.create(`services`, this.settingsModel.service).then((res) => {
          this.updateServiceFields(res);
          this.cleanServiceFields();

          this.modal.alert(`Service ${name} was succesfully created. To proceed working with it please select it from list in the top of page.`);
        });

      }, (err) => {
        this.modal.alert(err);
      })
    } else {
      this.modal.alert(this.validateName(name).msg);
    }
  }

  /**
   * Update service
   */
  updateService() {
    const name = this.settingsModel.service.service_name;

    if (!this.isVariableUnique) {
      this.modal.alert(`Variable names should be unique`);
      return;
    }


    if (!this.validateRequiredFields().status) {
      this.modal.alert(this.validateRequiredFields().msg);
      return;
    }

    if (this.validateName(name).status) {
      this.modal.confirm(
        `Confirm saving of updates of "${name}" service`,
        "Do you really want to save changes of service?<br>If yes, please input service name.",
        (value) => {
          if(value !== name )
            return 'Service name is incorrect!';
        },
        'Yes, please save!',
        'Don`t save'
      ).then(() => {
        this.saveDocJson();
        this.api.update(`services/${this.settingsModel.service.id}`, this.settingsModel.service).then((res) => this.modal.alert(`Service ${name} was succesfully updated.`));
      }, (err) => {
        this.modal.alert(err);
      });
    } else {
      this.modal.alert(this.validateName(name).msg);
    }
  }

  /**
   * Delete service
   */
  deleteService() {
    if (!this.settingsModel.service.service_name) {
      this.modal.alert("You can't delete service with no name");
      return;
    }

    this.modal.confirm(
      `Confirm deletion of "${this.settingsModel.service.service_name}" service`,
      "Do you really want to delete this service?<br>If yes, please input service name.",
      (value) => {
        if(value !== this.settingsModel.service.service_name)
          return 'Service name is incorrect!';
      },
      'Yes, please remove!',
      'Don`t remove'
    ).then(() => {
      this.api.remove(`services/${this.settingsModel.service.id}`).then((res) => {
        this.cleanServiceFields();

        this.modal.alert(`Service ${name} was succesfully removed.`);
      });
    }, (err) => {
      this.modal.alert(err);
    })
  }

  /**
   * Validate if all variables unique
   *
   * @param name
   */
  checkIfVariableUnique(name) {
    this.isVariableUnique = true;

    for (let item of this.settingsModel.platform.variables) {
      if (item.name === name) {
        this.isVariableUnique = false;
        return;
      }
    }
  }

  /**
   * Validate if doc in JSON format
   */
  docUpdated() {
    this.settingsModel.jsonValidationMessage = "";

    try {
      JSON.parse(this.settingsModel.doc_string)
    } catch (e) {
      this.settingsModel.jsonValidationMessage = "Json is invalid";
    }
  }

  /**
   * Add repeated field
   *
   * @param arr
   */
  addRepeatField(arr){
    arr.push({value: null});
  }

  /**
   * Remove repeated field
   *
   * @param arr
   * @param key
   */
  removeRepeatField(arr, key){
    arr.splice(key, 1);

    for (let obj of arr) {
      this.checkIfVariableUnique(obj.key);
    }
  }

  /**
   * Clean repeated field value
   *
   * @param arr
   */
  cleanFields(arr){
    arr[0].value = null;
  }

}
