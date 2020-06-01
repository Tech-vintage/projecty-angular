import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';

import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {LoginComponent} from './components/login/login.component';
import {OAuthModule} from 'angular-oauth2-oidc';
import {HttpClientModule} from '@angular/common/http';
import {ProjectsComponent} from './components/project/projects/projects.component';
import {NavbarComponent} from './layout/navbar/navbar.component';
import {AddProjectComponent} from './components/project/add-project/add-project.component';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {ManageProjectComponent} from './components/project/manage-project/manage-project.component';
import {AddTaskComponent} from './components/task/add-task/add-task.component';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatButtonModule} from '@angular/material/button';
import {MatDatepickerModule} from '@angular/material/datepicker';
import {MatNativeDateModule} from '@angular/material/core';
import {TasksComponent} from './components/task/tasks/tasks.component';
import {TaskInfoComponent} from './components/task/tasks/task-info/task-info.component';
import {ManageTaskComponent} from './components/task/manage-task/manage-task.component';
import {MatSelectModule} from '@angular/material/select';
import {EditTaskComponent} from './components/task/manage-task/edit-task/edit-task.component';
import {ManageAssignmentsComponent} from './components/task/manage-task/manage-assignments/manage-assignments.component';
import {DynamicUsernamesFormComponent} from './components/dynamic-usernames-form/dynamic-usernames-form.component';
import {MatDividerModule} from '@angular/material/divider';
import {DeleteDialogComponent} from './components/dialogs/delete-dialog/delete-dialog.component';
import {MatDialogModule} from '@angular/material/dialog';
import {AddTeamComponent} from './components/teams/add-team/add-team.component';
import {TeamsComponent} from './components/teams/teams/teams.component';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    ProjectsComponent,
    NavbarComponent,
    AddProjectComponent,
    ManageProjectComponent,
    AddTaskComponent,
    TasksComponent,
    TaskInfoComponent,
    ManageTaskComponent,
    ManageAssignmentsComponent,
    EditTaskComponent,
    DynamicUsernamesFormComponent,
    DeleteDialogComponent,
    AddTeamComponent,
    TeamsComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    OAuthModule.forRoot({
      resourceServer: {
        sendAccessToken: true,
        allowedUrls: ['http://localhost:8080']
      }
    }),
    AppRoutingModule,
    ReactiveFormsModule,
    FormsModule,
    BrowserAnimationsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSelectModule,
    MatDividerModule,
    MatDialogModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
