import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
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
import { RunnerComponent } from './pages/runner/runner.component';
import { SigninComponent } from './pages/signin/signin.component';
import { HeaderComponent } from './partials/header/header.component';
import { ProjectsComponent } from './pages/projects/projects.component';
import { UsersComponent } from './pages/users/users.component';
import { EditComponent } from './pages/projects/edit/edit.component';
import { ConsoleComponent } from './pages/console/console.component';
import { SettingsComponent } from './pages/settings/settings.component';


@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    RunnerComponent,
    SigninComponent,
    HeaderComponent,
    ProjectsComponent,
    UsersComponent,
    EditComponent,
    ConsoleComponent,
    SettingsComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    AppRoutingModule,
    FormsModule,
    SocketIoModule.forRoot(config),
    FileUploadModule,
    RestangularModule.forRoot(RestangularConfigFactory),
    BrowserAnimationsModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
