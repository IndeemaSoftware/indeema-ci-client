import { Component, OnInit } from '@angular/core';
import {NavigationEnd, Router} from '@angular/router';


@Component({
  selector: 'help',
  templateUrl: './help.component.html',
  styleUrls: ['./help.component.css']
})
export class HelpComponent implements OnInit {

    constructor(private router: Router) {  }

    ngOnInit() {
        if(this.router.url === '/help')
            this.router.navigate(['help/documentation']);

        this.router.events.subscribe((event) => {
            if (event instanceof NavigationEnd) {
            }
        });
    }
}
