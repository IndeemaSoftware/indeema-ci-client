import { Component, OnInit } from '@angular/core';
import {Socket} from 'ngx-socket-io';
import {ApiService} from '../../services/api.service';
import {AuthService} from '../../services/auth.service';
import {ActivatedRoute, Router} from '@angular/router';

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
  projectId = null as any;

  //Auto start setup
  autoStart = false;

  //Download btn
  enableDownloadBtn = false;

  constructor(
    private socket: Socket,
    private api: ApiService,
    private auth: AuthService,
    private route: Router,
    private activatedRoute: ActivatedRoute,
  ) {

    this.projectId = this.activatedRoute.snapshot.params['id'];
    if(!this.projectId){
      this.route.navigate([`projects`]);
      return;
    }

    //Get params
    this.activatedRoute.queryParams.subscribe(params => {
      this.autoStart = params['start']? true : false;
    });
  }

  ngOnInit() {
    //Setup connection status
    setInterval(() => {
      this.consoleLive = this.socket.ioSocket.connected;
    }, 1000);

    //Get project
    this.api.get(`/projects/${this.projectId}`)
        .then(data => {
          this.project = data;
          this.prepareConsole();
        }, err => {
          alert(err);
          this.route.navigate([`projects`]);
        });
  }

  prepareConsole(){
    if(this.project.project_status === 'success'){
      this.enableDownloadBtn = true;
    }else{
      this.enableDownloadBtn = false;
    }

    if(this.autoStart){
      this.connectToChannel(this.projectId);

      this.setupProject();
    }else{
      //Get project console output
      this.api.get(`/console/project/${this.projectId}`)
          .then(data => {
            const list = Object.values(data) as any;
            for(let item of list){
              if(item && item.type && item.message)
                this.addMessage(item.type, item.message);
            }

            //Connect to project stream
            this.connectToChannel(this.projectId);
          }, err => {
            alert(err);
            this.route.navigate([`projects`]);
          });
    }
  }

  setupProject(){
    this.api.create(`/console/setup/${this.projectId}`, {}).then(() => {
      this.cleanConsole();
    }, (err) => {
      alert(err);
      this.route.navigate([`projects`]);
    })
  }

  downloadTemplate(){
    console.log('download template file');
    //window.open(this.templateDownloadPath,'_blank');
  }

  cleanConsole(){
    this.consoleOutput = [];
    this.consoleTitle = 'Proccess is running... Please wait.';
  }

  disableConsole(){
    this.route.navigate([`projects/${this.projectId}`]);
  }

  addMessage(type, msg){
    msg = msg.toString().replace('\\n', '');
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
