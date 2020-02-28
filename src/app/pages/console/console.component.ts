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
  server = null as any;
  key = null as any;
  projectId = null as any;
  serverId = null as any;
  appId = null as any;

  //Auto start setup
  autoStart = false;

  //Download btn
  enableDownloadBtn = false;
  hideDownloadBtn = true;

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
    //Get params
    this.activatedRoute.queryParams.subscribe(params => {
      this.autoStart = params['start']==="true";
      this.isCleanup = params['cleanup']==="true";
    });      
    
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
          this.server = data;
          this.prepareConsole();
        }, err => {
          this.modal.alert(err);
          this.route.navigate([`servers`]);
      });
    }
  }

  prepareConsole(){
    if (this.projectId) {
      this.hideDownloadBtn = false;;
      if (this.app.app_status === 'success'){
        this.enableDownloadBtn = true;
      } else {
        this.enableDownloadBtn = false;
      }
    } else {
      this.hideDownloadBtn = false;;
      if (this.server.server_status === 'success'){
        this.enableDownloadBtn = true;
      } else {
        this.enableDownloadBtn = false;
      }
    }

    if (this.autoStart) {
      if (this.appId) {
        this.connectToChannel(this.appId);
      } else if (this.serverId) {
        this.connectToChannel(this.serverId);
      }

      if (this.isCleanup) {
        this.startCleanupScript();
      } else {
        this.startSetupScript();  
      }
    } else {
      if (this.appId) {
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
          this.route.navigate([`servers`]);
        });
      }
    }
  }

  startSetupScript() {
    if (this.projectId) {
      this.api.create(`/apps/setup/${this.appId}`, {}).then(() => {
        this.cleanConsole();
      }, (err) => {
        this.modal.alert(err);
        this.route.navigate([`projects`]);
      })
    } else if (this.serverId) {
      this.api.create(`/server/setup/${this.serverId}`, {}).then(() => {
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

  reloadScript() {
    if (this.isCleanup) {
      this.startCleanupScript();
    } else {
      this.startSetupScript();
    }
  }

  startCleanupScript() {
    if (this.projectId) {
      this.api.remove(`projects/cleanup/${this.projectId}/${this.appId}`).then((resp) => {
        this.cleanConsole();
      }, (err) => {
        this.modal.alert(err);
        this.route.navigate([`projects`]);
      });
    } else if (this.serverId) {
      this.api.remove(`server/cleanup/${this.serverId}/`).then((resp) => {
        this.cleanConsole();
      }, (err) => {
        this.modal.alert(err);
        this.route.navigate([`servers`]);
      });
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
      this.consoleTitle = `Setup ${this.projectId?"project":"server"} has success!`;
      this.enableDownloadBtn = true;
    }

    if(type === 'build_error') {
      this.consoleTitle = `Setup ${this.projectId?"project":"server"} has failed!`;
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
