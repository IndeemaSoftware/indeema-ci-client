import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../../services/api.service';
import {ActivatedRoute} from '@angular/router';
import { DomSanitizer } from '@angular/platform-browser';


@Component({
  selector: 'maintenance-preview',
  templateUrl: './maintenance-preview.component.html'
})
export class MaintenancePreviewComponent implements OnInit {

  data: any;
  id : any;

  constructor(
    private api: ApiService,
    private activatedRoute: ActivatedRoute,
    protected sanitizer: DomSanitizer,
  ) {
    this.activatedRoute.queryParams.subscribe(params => {
      this.id = params['id'];
    });
  }

  ngOnInit() {
    this.api.get(`maintenances/${this.id}`).then((res) => {
      this.data = this.sanitizer.bypassSecurityTrustHtml(res.html_code);
    });
  }
}
