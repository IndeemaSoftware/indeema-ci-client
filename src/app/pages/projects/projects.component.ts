import { Component, OnInit } from '@angular/core';
import {AuthService} from '../../services/auth.service';
import {ApiService} from '../../services/api.service';
import {Router} from '@angular/router';
import {ModalService} from '../../services/modal.service';


@Component({
  selector: 'app-projects',
  templateUrl: './projects.component.html',
  styleUrls: ['./projects.component.css']
})
export class ProjectsComponent implements OnInit {
  projects: any;
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
      private modal: ModalService,
  ) { }

  ngOnInit() {
    this.modal.guide();

    this.auth.getUser().then((user) => {
      this.checkUser();
      this.getProjects();
    }, (err) => {
      this.route.navigate(['signin']);
    });
  }

  checkUser() {
    this.api.get(`services`).then((resp) => {
      if (resp.length <= 0) {
        this.modal.alert(`Hi ${this.auth.user.username} and Welcome to Indeema CI. To start setuping projects, first setup service scripts. You can use set of ready scripts in Settings/Modules. Install sets with one click.`);
      }
    });  
  }

  getProjects(){
    this.api.get('projects').then((projects) => {
      this.projects = projects;

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
      for(let project of this.projects){
        if(project.apps && project.apps.length){
          for(let app of project.apps){
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
      this.projects = [];

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

  startProject(project, app){
    if(app.app_status === 'progress' || app.app_status === 'cleanup')
      return;

    this.route.navigate([`console/${project.id}/${app.id}`], { queryParams: { start: 'true' } });
  }

  toConsole(project, app, cleanup = false, autostart = false){
    if(cleanup)
      this.route.navigate([`console/${project.id}/${app.id}`], { queryParams: { start: autostart, cleanup: 'true' } });
    else
      this.route.navigate([`console/${project.id}/${app.id}`]);
  }

  editProject(project){
    this.route.navigate([`projects/${project.id}`]);
  }

  cleanupProject(project, app){
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
      this.toConsole(project, app, true, true);
    });
  }

  deleteProject(project, app = null) {
    if (app) {
      if(app.app_status !== 'cleanup_success' && app.app_status !== 'cleanup_failed'){
        this.modal.alert('Before delete app, please cleanup this app!', 'Important!', 'I understand!');
      } else {
        this.modal.confirm(
            `Confirm deleting app "${app.app_name}"`,
            "Do you really want to remove this app?<br>If yes, please input app name.",
            (value) => {
              if(value !== app.app_name)
                return 'App name is incorrect!';
            }
        ).then((res) => {
          this.api.remove(`projects/${project.id}/${app.id}`).then(() => {
            this.getProjects();
          }, (err) => {
          });
          setTimeout(() => {
            this.getProjects();
          }, 1000);
        });
      }
    } else {
      if(!this.isAppsNeedToCleanup(project)){
        this.modal.confirm(
            `Confirm deleting project "${project.project_name}"`,
            "Do you really want to remove this project?<br>If yes, please input project name.",
            (value) => {
              if(value !== project.project_name)
                return 'Project name is incorrect!';
            }
        ).then((res) => {
          this.api.remove(`projects/remove/${project.id}`).then(() => {
            this.getProjects();
          }, (err) => {
          });
          setTimeout(() => {
            this.getProjects();
          }, 1000);
        });
      }else{
        this.modal.alert('Please first cleanup all apps in project', 'Important!', 'I understand!');
      }
    }
  }

  isAppsNeedToCleanup(project){
    let isNeed = false;
    for(let app of project.apps){
      if(app.app_status !== 'cleanup_success' && app.app_status !== 'cleanup_failed'){
        isNeed = true;
        break;
      }
    }
    return isNeed;
  }

  preview(project, app) {
    if (app.isSecure) {
      window.open(`https://${app.domain_name}:${app.app_port}`,'_blank');
    } else {
      window.open(`http://${app.domain_name}:${app.app_port}`,'_blank');
    }
  }

}
