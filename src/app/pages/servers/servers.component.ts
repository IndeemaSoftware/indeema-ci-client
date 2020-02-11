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
      this.getServers();
    }, (err) => {
      this.route.navigate(['signin']);
    });
  }

  getServers(){
    this.api.get('server').then((servers) => {
      this.servers = servers;

      this.statuses = {
        waiting: 0,
        progress: 0,
        success: 0,
        failed: 0,
        cleanup: 0,
        cleanup_success: 0,
        cleanup_failed: 0
      };

      //Setup counters
      for(let server of this.servers){
        if(server.apps && server.apps.length){
          for(let app of server.apps){
            if(app.app_status === 'waiting')
              this.statuses.waiting++;

            if(app.app_status === 'progress')
              this.statuses.progress++;

            if(app.app_status === 'success')
              this.statuses.success++;

            if(app.app_status === 'failed')
              this.statuses.failed++;

            if(app.app_status === 'cleanup')
              this.statuses.cleanup++;

            if(app.app_status === 'cleanup_success')
              this.statuses.cleanup_success++;

            if(app.app_status === 'cleanup_failed')
              this.statuses.cleanup_failed++;
          }
        }
      }

    }, (err) => {
      console.error(err);
      this.servers = [];

      this.statuses = {
        waiting: 0,
        progress: 0,
        success: 0,
        failed: 0,
        cleanup: 0,
        cleanup_success: 0,
        cleanup_failed: 0
      };
    })
  }

  startProject(server, app){
    if(app.app_status === 'progress' || app.app_status === 'cleanup')
      return;

    this.route.navigate([`console/${server.id}/${app.id}`], { queryParams: { start: 'true' } });
  }

  toConsole(server, app, cleanup = false){
    if(cleanup)
      this.route.navigate([`console/${server.id}/${app.id}`], { queryParams: { cleanup: 'true' } });
    else
      this.route.navigate([`console/${server.id}/${app.id}`]);
  }

  editServer(server){
    this.route.navigate([`servers/${server.id}`]);
  }

  cleanupProject(server, app){
    if(app.app_status === 'cleanup' || app.app_status === 'cleanup_success')
      return;

    //Ask to cleanup server
    this.modal.confirm(
        `Confirm cleanup app "${app.app_name}"`,
        "Do you really want to cleanup this app on server?<br>If yes, please input app name.",
        (value) => {
          if(value !== app.app_name)
            return 'App name is incorrect!';
        },
        'Yes, please cleanup!',
        'Don`t cleanup'
    ).then((res) => {
      this.api.remove(`servers/cleanup/${server.id}/${app.id}`).then(() => {
        this.toConsole(server, app, true);
      }, (err) => {
        this.modal.alert(err);
      })
      setTimeout(() => {
        this.toConsole(server, app, true);
      }, 500);
    });
  }

  deleteProject(server, app = null) {
    if (app){
      if(app.app_status !== 'cleanup_success' && app.app_status !== 'cleanup_failed'){
        this.modal.alert('Before delete app, please cleanup this app!', 'Important!', 'I understand!');
      }else{
        this.modal.confirm(
            `Confirm deleting app "${app.app_name}"`,
            "Do you really want to remove this app?<br>If yes, please input app name.",
            (value) => {
              if(value !== app.app_name)
                return 'App name is incorrect!';
            }
        ).then((res) => {
          this.api.remove(`servers/${server.id}/${app.id}`).then(() => {
            this.getServers();
          }, (err) => {
          });
          setTimeout(() => {
            this.getServers();
          }, 1000);
        });
      }
    } else {
      this.modal.confirm(
          `Confirm deleting server "${server.server_name}"`,
          "Do you really want to remove this server?<br>If yes, please input server name.",
          (value) => {
            if(value !== server.server_name)
              return 'server name is incorrect!';
          }
      ).then((res) => {
        this.api.remove(`server/remove/${server.id}`).then(() => {
          this.getServers();
        }, (err) => {
        });
        setTimeout(() => {
          this.getServers();
        }, 1000);
      });
    }
  }

}
