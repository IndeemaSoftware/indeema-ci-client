import { Component, OnInit } from '@angular/core';
import {Router, NavigationEnd} from '@angular/router';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css']
})
export class SettingsComponent implements OnInit {

  constructor(private router: Router) { };

  ngOnInit() {
    if(this.router.url === '/settings')
      this.router.navigate(['settings/maintenance']);

    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        if(this.router.url === '/settings')
          this.router.navigate(['settings/maintenance']);
      }
    });
  }
}
