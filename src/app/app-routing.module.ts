import { NgModule } from '@angular/core';
import { PreloadAllModules, Routes, RouterModule } from '@angular/router';
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
import {PrivateComponent} from './containers/private/private.component';
import {MaintenanceComponent} from './pages/settings/maintenance/maintenance.component';
import {CITemplatesComponent} from './pages/settings/ci-templates/ci-templates.component';
import {ServerDepComponent} from './pages/settings/server-dep/server-dep.component';
import {CustomDepComponent} from './pages/settings/custom-dep/custom-dep.component';
import {PlatformsComponent} from './pages/settings/platforms/platforms.component';
import {ServicesComponent} from './pages/settings/services/services.component';
import {MigrationComponent} from './pages/settings/migration/migration.component';
import {PrivateFullwidthComponent} from './containers/private-fullwidth/private-fullwidth.component';
import {DocumentationComponent} from './pages/help/documentation/documentation.component';
import {CustomSetupComponent} from './pages/help/custom-setup/custom-setup.component';
import {AccessConfigurationComponent} from './pages/help/access-configuration/access-configuration.component';
import {HelpDeskComponent} from './pages/help/help-desk/help-desk.component';

const routes: Routes = [
  {
    path: '',
    component: HomeComponent
  },
  {
    path: '',
    component: PrivateComponent,
    children: [
      {
        path: 'projects',
        component: ProjectsComponent,
        pathMatch: 'full'
      },
      {
        path: 'servers',
        component: ServersComponent,
        pathMatch: 'full'
      }
    ]
  },
  {
    path: '',
    component: PrivateFullwidthComponent,
    children: [
      {
        path: 'settings',
        component: SettingsComponent,
        children: [
          {
            path: 'maintenance',
            component: MaintenanceComponent,
            pathMatch: 'full'
          },
          {
            path: 'ci-templates',
            component: CITemplatesComponent,
            pathMatch: 'full'
          },
          {
            path: 'server-dependencies',
            component: ServerDepComponent,
            pathMatch: 'full'
          },
          {
            path: 'custom-dependencies',
            component: CustomDepComponent,
            pathMatch: 'full'
          },
          {
            path: 'platforms',
            component: PlatformsComponent,
            pathMatch: 'full'
          },
          {
            path: 'services',
            component: ServicesComponent,
            pathMatch: 'full'
          },
          {
            path: 'modules',
            component: MigrationComponent,
            pathMatch: 'full'
          },
        ]
      },
      {
        path: 'help',
        component: HelpComponent,
        children: [
          {
            path: 'documentation',
            component: DocumentationComponent,
            pathMatch: 'full'
          },
          {
            path: 'custom-setup',
            component: CustomSetupComponent,
            pathMatch: 'full'
          },
          {
            path: 'access',
            component: AccessConfigurationComponent,
            pathMatch: 'full'
          },
          {
            path: 'help-desk',
            component: HelpDeskComponent,
            pathMatch: 'full'
          },
        ]
      }
    ]
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
    path: 'preview',
    component: MaintenancePreviewComponent,
    pathMatch: 'full'
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules, scrollPositionRestoration: 'enabled' })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
