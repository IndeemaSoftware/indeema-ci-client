import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {HomeComponent} from "./pages/home/home.component";
import {RunnerComponent} from "./pages/runner/runner.component";
import {SigninComponent} from "./pages/signin/signin.component";
import {ProjectsComponent} from './pages/projects/projects.component';
import {UsersComponent} from './pages/users/users.component';
import {EditComponent} from './pages/projects/edit/edit.component';
import {ConsoleComponent} from './pages/console/console.component';
import {SettingsComponent} from './pages/settings/settings.component';

const routes: Routes = [
  {
    path: '',
    component: HomeComponent
  },
  {
    path: 'signin',
    component: SigninComponent
  },
  {
    path: 'runner',
    component: RunnerComponent
  },
  {
    path: 'projects',
    component: ProjectsComponent
  },
  {
    path: 'projects/:id',
    component: EditComponent
  },
  {
    path: 'console/:id/:app_id',
    component: ConsoleComponent
  },
  {
    path: 'users',
    component: UsersComponent
  },
  {
    path: 'settings',
    component: SettingsComponent
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
