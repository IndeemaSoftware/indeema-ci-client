import { Component, OnInit } from '@angular/core';
import {AuthService} from '../../services/auth.service';
import {ApiService} from '../../services/api.service';
import {Router} from '@angular/router';
import {ModalService} from '../../services/modal.service';

@Component({
  selector: 'app-servers',
  templateUrl: './servers.component.html',
  styleUrls: ['./servers.component.css']
})
export class ServersComponent implements OnInit {
  servers = null as  any;
  statuses = {
    waiting: 0,
    progress: 0,
    success: 0,
    failed: 0,
    cleanup: 0,
    cleanup_success: 0,
    cleanup_failed: 0
  };

  constructor(
      private auth: AuthService,
      private api: ApiService,
      private route: Router,
      private modal: ModalService
  ) { }

  ngOnInit() {
    this.auth.getUser().then((user) => {
      this.checkWelcome();
      this.getServers();
    }, (err) => {
      this.route.navigate(['signin']);
    });
  }

  /**
   * Check if we need to show welcome message for user
   */
  checkWelcome() {
    this.api.get(`platforms`).then((res) => {
      if (res.length <= 0) {
        this.modal.alert(`Hi ${this.auth.user.username} and Welcome to Indeema CI. To start setuping servers, first setup platform scripts. You can use set of ready scripts in Settings/Modules. Install sets with one click.`);
      }
    });  
  }

  /**
   * Cleanup models before update
   */
  cleanup(){
    this.statuses = {
      waiting: 0,
      progress: 0,
      success: 0,
      failed: 0,
      cleanup: 0,
      cleanup_success: 0,
      cleanup_failed: 0
    };
  }

  /**
   * Get server list and update counters
   */
  getServers(){
    this.api.get('server').then((servers) => {
      this.servers = servers;
      this.cleanup();

      //Setup counters
      for(let server of this.servers){
        if(server) {
          switch(server.server_status){
            case 'waiting':
              this.statuses.waiting++;
              break;
            case 'progress':
              this.statuses.progress++;
              break;
            case 'success':
              this.statuses.success++;
              break;
            case 'failed':
              this.statuses.failed++;
              break;
            case 'cleanup':
              this.statuses.cleanup++;
              break;
            case 'cleanup_success':
              this.statuses.cleanup_success++;
              break;
            case 'cleanup_failed':
              this.statuses.cleanup_failed++;
              break;
            default:
              break;
          }
        }
      }

    }, (err) => {
      this.servers = [];
      this.cleanup();
    })
  }

  /**
   * Start to setup server
   * @param server
   */
  setupServer(server){
    this.toConsole(server, false, true);
  }

  /**
   * Start to cleanup server
   * @param server
   */
  cleanupServer(server){
    if(server.server_status === 'cleanup' || server.server_status === 'cleanup_success')
      return;

    //Ask to cleanup server
    this.modal.confirm(
        `Confirm cleanup app "${server.server_name}"`,
        "Do you really want to cleanup this app on server?<br>If yes, please input app name.",
        (value) => {
          if(value !== server.server_name)
            return 'App name is incorrect!';
        },
        'Yes, please cleanup!',
        'Don`t cleanup'
    ).then((res) => this.toConsole(server, true, true));
  }

  /**
   * Redirect method for console view
   * @param server
   * @param cleanup
   * @param autostart
   */
  toConsole(server, cleanup = false, autostart = false) {
    this.route.navigate([`console/server/${server.id}`], { queryParams: { start: autostart, cleanup: cleanup } });
  }

  /**
   * Go to server edit view
   * @param server
   */
  editServer(server){
    this.route.navigate([`servers/${server.id}`]);
  }

  /**
   * Delete server method
   * @param server
   */
  deleteServer(server) {
    if (
        server.server_status !== 'cleanup_success' &&
        server.server_status !== 'cleanup_failed' &&
        server.server_status !== 'failed' &&
        server.server_status !== 'waiting'
    ) {
      this.modal.alert('Before delete app, please cleanup this app!', 'Important!', 'I understand!');
      return;
    }

    this.modal.confirm(
        `Confirm deleting app "${server.server_name}"`,
        "Do you really want to remove this app?<br>If yes, please input app name.",
        (value) => {
          if(value !== server.server_name)
            return 'App name is incorrect!';
        }
    ).then((res) => this.deleteServerAndUpdate(server));
  }

  /**
   * Delete server action
   * @param server
   */
  deleteServerAndUpdate(server){
    this.api.remove(`server/${server.id}`).then(() => {
      this.getServers();
    });
    setTimeout(() => {
      this.getServers();
    }, 1000);
  }
}
