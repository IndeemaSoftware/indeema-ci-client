import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../../services/api.service';
import {ActivatedRoute, Router} from '@angular/router';
import { DomSanitizer, SafeHtml, SafeStyle, SafeScript, SafeUrl, SafeResourceUrl } from '@angular/platform-browser';


@Component({
  selector: 'maintenance-preview',
  templateUrl: './maintenance-preview.component.html'
})
export class MaintenancePreviewComponent implements OnInit {

    constructor(
        private api: ApiService,
        private activatedRoute: ActivatedRoute,
        protected sanitizer: DomSanitizer,
        ) { 
            this.activatedRoute.queryParams.subscribe(params => {
                this.id = params['id'];
            });    
        };

    data: any;
    id : any;

    ngOnInit() {
        this.api.get(`maintenance/download/${this.id}`).then((resp) => {
            console.log(resp.data);
            this.data = this.sanitizer.bypassSecurityTrustHtml(resp.data);
          });  
    }
}