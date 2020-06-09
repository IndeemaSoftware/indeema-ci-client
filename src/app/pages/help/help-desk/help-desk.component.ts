import { Component, OnInit } from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {DomSanitizer} from '@angular/platform-browser';

@Component({
  selector: 'app-help-desk',
  templateUrl: './help-desk.component.html',
  styleUrls: ['./help-desk.component.css']
})
export class HelpDeskComponent implements OnInit {

  subject: any;
  desc: any;
  email: any;
  first_name: any;
  last_name: any;

  constructor(
      private httpClient: HttpClient,
  ) { }

  ngOnInit() {

  }

  /**
   * Create new ticket
   */
  createTicket() {
    const body = `<?xml version="1.0"?>\
        <ticket>\
          <issue>\
            <project_id>indeema-ci</project_id>\
            <tracker_id>1</tracker_id>\
            <subject>New ticket subject</subject>\
            <description>New ticket description</description>\
            <assigned_to_id>1</assigned_to_id>\
          </issue>\
          <contact>\
            <email>test@example.com</email>\
            <first_name>John</first_name>\
            <last_name_name>John</last_name_name>\
          </contact>\
        </ticket>`;

    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type':  'application/xml',
        'Authorization': 'Basic aW5kZWVtYS5jaTppbmRlZW1hLmNp',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': 'true'
      })
    };

    this.httpClient.post<any>('https://redmine.indeema.com/helpdesk/create_ticket.xml', body, httpOptions);
  }

}
