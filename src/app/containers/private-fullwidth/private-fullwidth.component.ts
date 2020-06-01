import { Component, OnInit } from '@angular/core';
import {AuthService} from '../../services/auth.service';
import {Router} from '@angular/router';

@Component({
  selector: 'app-private-fullwidth',
  templateUrl: './private-fullwidth.component.html',
  styleUrls: ['./private-fullwidth.component.css']
})
export class PrivateFullwidthComponent implements OnInit {

  constructor(
      private auth: AuthService,
      private route: Router
  ) { }

  ngOnInit() {
    this.auth.getUser().then((user) => {

    }, (err) => {
      this.route.navigate(['signin']);
    });
  }

}
