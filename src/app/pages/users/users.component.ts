import { Component, OnInit } from '@angular/core';
import {AuthService} from '../../services/auth.service';
import {Router} from '@angular/router';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.css']
})
export class UsersComponent implements OnInit {
  user: any;

  constructor(
      private auth: AuthService,
      private route: Router
  ) { }

  ngOnInit() {
    this.auth.getUser().then((user) => {
      //Only admin has access
      if(user.role.type !== 'administrator') {
        this.route.navigate(['/projects']);
        return;
      }

      this.user = user;
    });
  }

}
