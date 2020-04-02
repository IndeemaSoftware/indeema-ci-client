import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router} from '@angular/router';
import { HttpHeaders } from '@angular/common/http';
import { HttpClient } from '@angular/common/http';
import { DomSanitizer, SafeHtml, SafeStyle, SafeScript, SafeUrl, SafeResourceUrl } from '@angular/platform-browser';


@Component({
  selector: 'help',
  templateUrl: './help.component.html',
  styleUrls: ['./help.component.css']
})
export class HelpComponent implements OnInit {

    subject: any;
    desc: any;
    email: any;
    first_name: any;
    last_name: any;

    constructor(
        private httpClient: HttpClient,
        protected sanitizer: DomSanitizer,
    ) {  }
    ngOnInit() {
        this.switchSetting('Doc');
    }

    createTicket() {
        let body = `<?xml version="1.0"?>\
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
        // this.httpClient.post(`https://redmine.indeema.com/helpdesk/create_ticket.xml`, body, httpOptions);
        this.httpClient.post<any>('https://redmine.indeema.com/helpdesk/create_ticket.xml', body, httpOptions)
        .subscribe(data => {
        })
    }

    //Tab bar navigation
//Start
  switchSetting(page) {
    // Declare all variables
    var i, tabcontent, tablinks;
  
    // Get all elements with class="tabcontent" and hide them
    tabcontent = document.getElementsByClassName("tabcontent");
    for (i = 0; i < tabcontent.length; i++) {
      tabcontent[i].style.display = "none";
    }
  
    // Get all elements with class="tablinks" and remove the class "active"
    tablinks = document.getElementsByClassName("tablinks");
    for (i = 0; i < tablinks.length; i++) {
      tablinks[i].className = tablinks[i].className.replace(" active", "");
    }
  
    // Show the current tab, and add an "active" class to the button that opened the tab
    document.getElementById(page).style.display = "block";
  }
}
