import { BrowserModule } from '@angular/platform-browser';
import { NgModule, ElementRef } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { FileUploadModule } from 'ng2-file-upload';
import { RestangularModule, Restangular } from 'ngx-restangular';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

//Socket io
import { SocketIoModule, SocketIoConfig } from 'ngx-socket-io';
import {environment} from "../environments/environment";

//Configure socket
const config: SocketIoConfig = {
  url: environment.SOCKET,
  options: {
    "force new connection": true,
    reconnectionAttempts: 'Infinity',
    timeout: 10000,
    transports: ['websocket']
  }
};

//REST Setup
export function RestangularConfigFactory (RestangularProvider) {
  RestangularProvider.setBaseUrl(environment.API_URL);
}

import { AppComponent } from './app.component';

import { AppRoutingModule } from './app-routing.module';
import { HomeComponent } from './pages/home/home.component';
import { SigninComponent } from './pages/signin/signin.component';
import { HeaderComponent } from './partials/header/header.component';
import { FooterComponent } from './partials/footer/footer.component';
import { ProjectsComponent } from './pages/projects/projects.component';
import { UsersComponent } from './pages/users/users.component';
import { EditComponent } from './pages/projects/edit/edit.component';
import { ConsoleComponent } from './pages/console/console.component';
import { ServersComponent } from './pages/servers/servers.component';
import { EditServerComponent } from './pages/servers/edit/edit_server.component';
import { SettingsComponent } from './pages/settings/settings.component';
import { CITemplatesComponent } from './pages/settings/ci-templates/ci-templates.component';
import { ServerDepComponent } from './pages/settings/server-dep/server-dep.component';
import { CustomDepComponent } from './pages/settings/custom-dep/custom-dep.component';
import { PlatformsComponent } from './pages/settings/platforms/platforms.component';
import { ServicesComponent } from './pages/settings/services/services.component';
import { MaintenanceComponent } from './pages/settings/maintenance/maintenance.component';
import { MigrationComponent } from './pages/settings/migration/migration.component';
import { MaintenancePreviewComponent } from './pages/settings/maintenance/maintenance-preview.component';
import { HelpComponent } from './pages/help/help.component';
import { SignupComponent } from './pages/signup/signup.component';
import { ForgotPasswordComponent } from './pages/signin/forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './pages/signin/reset-password/reset-password.component';
import { PublicComponent } from './containers/public/public.component';
import { TermsComponent } from './pages/terms/terms.component';
import { PrivateComponent } from './containers/private/private.component';
import { HeaderBottomComponent } from './pages/settings/header-bottom/header-bottom.component';
import { PrivateFullwidthComponent } from './containers/private-fullwidth/private-fullwidth.component';
import { DocumentationComponent } from './pages/help/documentation/documentation.component';
import { CustomSetupComponent } from './pages/help/custom-setup/custom-setup.component';
import { AccessConfigurationComponent } from './pages/help/access-configuration/access-configuration.component';
import { HelpDeskComponent } from './pages/help/help-desk/help-desk.component';
import { HelpHeaderBottomComponent } from './pages/help/help-header-bottom/help-header-bottom.component';

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    SigninComponent,
    HeaderComponent,
    FooterComponent,
    ProjectsComponent,
    UsersComponent,
    EditComponent,
    ConsoleComponent,
    ServersComponent,
    EditServerComponent,
    SettingsComponent,
    ServerDepComponent,
    CustomDepComponent,
    PlatformsComponent,
    CITemplatesComponent,
    ServicesComponent,
    MaintenanceComponent,
    MigrationComponent,
    MaintenancePreviewComponent,
    HelpComponent,
    SignupComponent,
    ForgotPasswordComponent,
    ResetPasswordComponent,
    PublicComponent,
    TermsComponent,
    PrivateComponent,
    HeaderBottomComponent,
    PrivateFullwidthComponent,
    DocumentationComponent,
    CustomSetupComponent,
    AccessConfigurationComponent,
    HelpDeskComponent,
    HelpHeaderBottomComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    SocketIoModule.forRoot(config),
    FileUploadModule,
    RestangularModule.forRoot(RestangularConfigFactory),
    BrowserAnimationsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
