import { Component, OnInit } from '@angular/core';
import {AuthService} from '../../services/auth.service';
import {ApiService} from '../../services/api.service';
import {Router} from '@angular/router';

@Component({
  selector: 'app-projects',
  templateUrl: './projects.component.html',
  styleUrls: ['./projects.component.css']
})
export class ProjectsComponent implements OnInit {
  projects = null as  any;
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
  ) { }

  ngOnInit() {
    this.auth.getUser().then((user) => {
      this.getProjects();
    }, (err) => {
      this.route.navigate(['signin']);
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
        if(project.project_status === 'waiting')
          this.statuses.waiting++;

        if(project.project_status === 'progress')
          this.statuses.progress++;

        if(project.project_status === 'success')
          this.statuses.success++;

        if(project.project_status === 'failed')
          this.statuses.failed++;

        if(project.project_status === 'cleanup')
          this.statuses.cleanup++;

        if(project.project_status === 'cleanup_success')
          this.statuses.cleanup_success++;

        if(project.project_status === 'cleanup_failed')
          this.statuses.cleanup_failed++;
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

  startProject(project){
    if(project.project_status === 'progress' || project.project_status === 'cleanup')
      return;

    this.route.navigate([`console/${project.id}`], { queryParams: { start: 'true' } });
  }

  toConsole(project){
    this.route.navigate([`console/${project.id}`]);
  }

  editProject(project){
    this.route.navigate([`projects/${project.id}`]);
  }

  cleanupProject(project){
    if(project.project_status === 'cleanup' || project.project_status === 'cleanup_success')
      return;

    this.api.remove(`projects/cleanup/${project.id}`).then(() => {
      this.toConsole(project);
    }, (err) => {
      alert(err);
    })
  }

  deleteProject(project){
    this.api.remove(`projects/${project.id}`).then(() => {
      this.toConsole(project);
    }, (err) => {
      alert(err);
    })
  }

}
