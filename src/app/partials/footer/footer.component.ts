import { Component, OnInit } from '@angular/core';
import {AuthService} from '../../services/auth.service';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.css']
})
export class FooterComponent implements OnInit {

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
