import { Component, OnInit } from '@angular/core';
import {AuthService} from '../../services/auth.service';
import {Router} from '@angular/router';

@Component({
  selector: 'app-public',
  templateUrl: './public.component.html',
  styleUrls: ['./public.component.css']
})
export class PublicComponent implements OnInit {

  constructor(
      private auth: AuthService,
      private route: Router
  ) { }

  ngOnInit() {
    this.auth.getUser().then((user) => {
      this.route.navigate(['/projects']);
    })
    .catch(e => {

    });
  }

}
