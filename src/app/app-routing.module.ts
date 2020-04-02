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
import { HelpComponent } from './pages/help/help.component';
import {PublicComponent} from './containers/public/public.component';
import {SignupComponent} from './pages/signup/signup.component';
import {ForgotPasswordComponent} from './pages/signin/forgot-password/forgot-password.component';
import {ResetPasswordComponent} from './pages/signin/reset-password/reset-password.component';
import {TermsComponent} from './pages/terms/terms.component';

const routes: Routes = [
  {
    path: '',
    component: HomeComponent
  },
  {
    path: 'signin',
    component: PublicComponent,
    children: [
      {
        path: '',
        component: SigninComponent,
        pathMatch: 'full'
      }
    ]
  },
  {
    path: 'signup',
    component: PublicComponent,
    children: [
      {
        path: '',
        component: SignupComponent,
        pathMatch: 'full'
      }
    ]
  },
  {
    path: 'forgot-password',
    component: PublicComponent,
    children: [
      {
        path: '',
        component: ForgotPasswordComponent,
        pathMatch: 'full'
      }
    ]
  },
  {
    path: 'reset-password',
    component: PublicComponent,
    children: [
      {
        path: '',
        component: ResetPasswordComponent,
        pathMatch: 'full'
      }
    ]
  },
  {
    path: 'terms',
    component: PublicComponent,
    children: [
      {
        path: '',
        component: TermsComponent,
        pathMatch: 'full'
      }
    ]
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
  },
  {
    path: 'help',
    component: HelpComponent,
    pathMatch: 'full'
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)], 
  exports: [RouterModule]
})
export class AppRoutingModule { }
