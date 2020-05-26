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
    this.auth.getUser().then((user) => {
      this.checkGuide();
      this.getProjects();
    }, (err) => {
      this.route.navigate(['signin']);
    });
  }

  /**
   * Check if user have avaliable guide to show
   */
  checkGuide() {
    this.api.get(`services`).then((res) => {
      if (res.length <= 0) {
        this.modal.guide();
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
   * Get list of project and update counters
   */
  getProjects(){
    this.api.get('projects').then((projects) => {
      this.projects = projects;

      this.cleanup();

      //Setup counters
      for(let project of this.projects){
        if(project.apps && project.apps.length){
          for(let app of project.apps){
            switch(app.app_status){
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
      }

    }, (err) => {
      this.projects = [];
      this.cleanup();
    })
  }

  /**
   * Proceed to start project setup
   * @param project
   * @param app
   */
  setupProject(project, app){
    if(app.app_status === 'progress' || app.app_status === 'cleanup')
      return;

    this.toConsole(project, app, false, true);
  }

  /**
   * Redirect method for console view
   * @param project
   * @param app
   * @param cleanup
   * @param autostart
   */
  toConsole(project, app, cleanup = false, autostart = false){
    this.route.navigate([`console/${project.id}/${app.id}`], { queryParams: { start: autostart, cleanup: cleanup } });
  }

  /**
   * Go to project edit view
   * @param project
   */
  editProject(project){
    this.route.navigate([`projects/${project.id}`]);
  }

  /**
   * Start to cleanup project
   * @param project
   * @param app
   */
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
    ).then((res) => this.toConsole(project, app, true, true));
  }

  /**
   * Delete project method
   * @param project
   * @param app
   */
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
        ).then((res) => this.deleteProjectAndUpdate(project));
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
        ).then((res) => this.deleteProjectAndUpdate(project));
      }else{
        this.modal.alert('Please first cleanup all apps in project', 'Important!', 'I understand!');
      }
    }
  }

  /**
   * Delete project request and update
   * @param project
   */
  deleteProjectAndUpdate(project){
    this.api.remove(`projects/remove/${project.id}`).then(() => this.getProjects());
    setTimeout(() => this.getProjects(), 1000);
  }

  /**
   * Check if apps can cleanup
   * @param project
   */
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

  /**
   * Go to preview of project app
   * @param project
   * @param app
   */
  preview(project, app) {
    window.open(`http://${app.domain_name}:${(app.isSecure)? '433' : app.app_port}`,'_blank');
  }

}
