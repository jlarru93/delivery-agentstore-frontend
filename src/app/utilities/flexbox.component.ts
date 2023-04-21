import {Component} from '@angular/core';
import {BreadcrumbService} from '../breadcrumb.service';

@Component({
    templateUrl: './flexbox.component.html',
    styleUrls: ['./flexbox.scss']
})
export class FlexboxComponent {
    constructor(private breadcrumbService: BreadcrumbService) {
        this.breadcrumbService.setItems([
            { label: 'Utilities' },
            { label: 'FlexBox', routerLink: ['/utilities/flexbox'] }
        ]);
    }
}
