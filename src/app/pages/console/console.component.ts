import { Component, OnInit } from '@angular/core';
import {Socket} from 'ngx-socket-io';
import {ApiService} from '../../services/api.service';
import {AuthService} from '../../services/auth.service';
import {ActivatedRoute, Router} from '@angular/router';
import {environment} from '../../../environments/environment';
import {ModalService} from '../../services/modal.service';

@Component({
  selector: 'app-console',
  templateUrl: './console.component.html',
  styleUrls: ['./console.component.css']
})
export class ConsoleComponent implements OnInit {
  consoleTitle = 'Proccess is running... Please wait.';

  //Enable console output
  consoleLive = null as any;
  consoleOutput = [] as any;

  //Project data
  project = null as any;
  app = null as any;
  key = null as any;
  projectId = null as any;
  serverId = null as any;
  appId = null as any;

  //Auto start setup
  autoStart = false;

  //Download btn
  enableDownloadBtn = false;

  //Is cleanup feature
  isCleanup = false;

  constructor(
    private socket: Socket,
    private api: ApiService,
    private auth: AuthService,
    private route: Router,
    private activatedRoute: ActivatedRoute,
    private modal: ModalService
  ) {

    this.key = this.activatedRoute.snapshot.params['id'];
    if (this.key === "server") {
      this.serverId = this.activatedRoute.snapshot.params['app_id'];
      if(!this.serverId) {
        this.route.navigate([`servers`]);
        return;
      }  
    } else {
      this.projectId = this.activatedRoute.snapshot.params['id'];
      if (!this.projectId) {
        this.route.navigate([`projects`]);
        return;
      }
  
      this.appId = this.activatedRoute.snapshot.params['app_id'];
      if(!this.appId){
        this.route.navigate([`projects`]);
        return;
      }
  
      //Get params
      this.activatedRoute.queryParams.subscribe(params => {
        this.autoStart = params['start']? true : false;
        this.isCleanup = params['cleanup']? true : false;
      });  
    }
  }

  ngOnInit() {
    //Setup connection status
    setInterval(() => {
      this.consoleLive = this.socket.ioSocket.connected;
    }, 1000);

    if (this.projectId) {
    //Get project
    this.api.get(`/projects/${this.projectId}`)
      .then(data => {
        this.project = data;

        //Get app
        this.api.get(`/app/${this.appId}`)
          .then(data => {
            this.app = data;
            this.prepareConsole();
          }, err => {
            this.modal.alert(err);
            this.route.navigate([`projects`]);
          });
      }, err => {
        this.modal.alert(err);
        this.route.navigate([`projects`]);
      });
    } else if (this.serverId) {
      this.api.get(`/server/${this.serverId}`)
        .then(data => {
          this.app = data;
          this.prepareConsole();
        }, err => {
          this.modal.alert(err);
          this.route.navigate([`servers`]);
      });
    }
  }

  prepareConsole(){
    if (this.app.app_status === 'success'){
      this.enableDownloadBtn = true;
    } else {
      this.enableDownloadBtn = false;
    }

    if (this.autoStart) {
      if (this.projectId) {
        this.connectToChannel(this.appId);
      } else if (this.serverId) {
        this.connectToChannel(this.serverId);
      }
      
      this.startSetupScript();  
    } else {
      if (this.projectId) {
      //Get project console output
      this.api.get(`/console/app/${this.appId}`)
        .then(data => {
          const list = Object.values(data) as any;
          for(let item of list){
            if(item && item.type && item.message)
              this.addMessage(item.type, item.message);
          }

          //Connect to project stream
          this.connectToChannel(this.appId);
        }, err => {
          this.modal.alert(err);
          this.route.navigate([`projects`]);
        });
      } else if (this.serverId) {
        this.api.get(`/console/server/${this.serverId}`)
        .then(data => {
          const list = Object.values(data) as any;
          for(let item of list){
            if(item && item.type && item.message)
              this.addMessage(item.type, item.message);
          }

          //Connect to project stream
          this.connectToChannel(this.serverId);
        }, err => {
          this.modal.alert(err);
          this.route.navigate([`projects`]);
        });
      }
    }
  }

  startSetupScript() {
    if (this.projectId) {
      this.api.create(`/console/setup/${this.projectId}/${this.appId}`, {}).then(() => {
        this.cleanConsole();
      }, (err) => {
        this.modal.alert(err);
        this.route.navigate([`projects`]);
      })
    } else if (this.serverId) {
      this.api.create(`/console/setup_server/${this.serverId}`, {}).then(() => {
        this.cleanConsole();
      }, (err) => {
        this.modal.alert(err);
        this.route.navigate([`servers`]);
      })
    }
  }  

  downloadTemplate(){
    window.open(environment.API_URL + `/app/download/yml/${this.appId}`,'_blank');
  }

  cleanConsole(){
    this.consoleOutput = [];
    this.consoleTitle = 'Proccess is running... Please wait.';
  }

  disableConsole(){
    if (this.projectId) {
      this.route.navigate([`projects/${this.projectId}`]);
    } else if (this.serverId) {
      this.route.navigate([`servers/${this.serverId}`]);
    }
  }

  cleanupProject(){
    if (this.projectId) {
      this.api.remove(`projects/cleanup/${this.projectId}/${this.appId}`).then(() => {
        this.cleanConsole();
      }, (err) => {
        this.modal.alert(err);
        this.route.navigate([`projects`]);
      })
    } else if (this.serverId) {
      console.log("Cleanup server");
    }
  }

  addMessage(type, msg){
    msg = msg.toString().replace('\\n', '');
    msg = msg.replace('\\t', '');
    msg = msg.replace('"', '');
    msg = msg.replace('"', '');
    this.consoleOutput.push({
      type: type,
      value: msg
    });

    if(type === 'build_success') {
      this.consoleTitle = 'Setup project is success!';
      this.enableDownloadBtn = true;
    }

    if(type === 'build_error') {
      this.consoleTitle = 'Setup project is failed!';
      this.enableDownloadBtn = false;
    }

    //Scroll to bottom
    var objDiv = document.getElementById("consoleOutput");
    objDiv.scrollTop = objDiv.scrollHeight;
  }

  connectToChannel(channel){
    //Remove all listeners
    this.socket.removeAllListeners();

    this.socket.on(`/console/setup/${channel}/message`, (msg) => {
      this.addMessage('message', msg);
    });
    this.socket.on(`/console/setup/${channel}/error`, (msg) => {
      this.addMessage('error', msg);
    });
    this.socket.on(`/console/setup/${channel}/end`, (msg) => {
      this.addMessage('end', msg);
    });
    this.socket.on(`/console/setup/${channel}/build_error`, (msg) => {
      this.addMessage('build_error', msg);
    });
    this.socket.on(`/console/setup/${channel}/build_success`, (msg) => {
      this.addMessage('build_success', msg);
    });
  }

}
