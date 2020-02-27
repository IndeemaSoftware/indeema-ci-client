import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { HomeComponent } from "./pages/home/home.component";
import { SigninComponent } from "./pages/signin/signin.component";
import { ProjectsComponent } from './pages/projects/projects.component';
import { UsersComponent } from './pages/users/users.component';
import { EditComponent } from './pages/projects/edit/edit.component';
import { ConsoleComponent } from './pages/console/console.component';
import { ServersComponent } from './pages/servers/servers.component';
import { EditServerComponent } from './pages/servers/edit/edit_server.component';
import { SettingsComponent } from './pages/settings/settings.component';
import { MaintenancePreviewComponent } from './pages/settings/maintenance/maintenance-preview.component';

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
    path: 'console/server/:id',
    component: ConsoleComponent
  },
  {
    path: 'users',
    component: UsersComponent
  },
  {
    path: 'servers/:id',
    component: EditServerComponent
  },
  {
    path: 'servers',
    component: ServersComponent
  },
  {
    path: 'settings',
    component: SettingsComponent,
  },
  {
    path: 'preview',
    component: MaintenancePreviewComponent,
    pathMatch: 'full'
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)], 
  exports: [RouterModule]
})
export class AppRoutingModule { }
