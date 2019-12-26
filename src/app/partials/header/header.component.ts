import { Component, OnInit } from '@angular/core';
import {AuthService} from '../../services/auth.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {

  user: any;

  constructor(
      private auth: AuthService
  ) { }

  ngOnInit() {
    this.auth.getUser().then((user) => {
      this.user = user;
    });
  }

  logout(){
    this.auth.logout();
  }

}
