import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, NavigationEnd, PRIMARY_OUTLET } from '@angular/router';
import { filter, distinctUntilChanged, map } from 'rxjs/operators';
import { Observable } from 'rxjs';

export interface BreadCrumb {
    label: string;
    url: string;
}

@Component({
    selector: 'app-breadcrumb',
    templateUrl: './breadcrumb.component.html',
    styleUrls: ['./breadcrumb.component.scss']
})
export class BreadcrumbComponent implements OnInit {

    breadcrumbs$: Observable<BreadCrumb[]>;

    constructor(private activatedRoute: ActivatedRoute,
        private router: Router) { }

    ngOnInit() {
        this.breadcrumbs$ = this.router.events.pipe(
            filter(event => event instanceof NavigationEnd),
            distinctUntilChanged(),
            map(event => this.buildBreadCrumb(this.activatedRoute.root))
        );
    }

    buildBreadCrumb(route: ActivatedRoute, url: string = '', breadcrumbs: Array<BreadCrumb> = []): Array<BreadCrumb> {

        const ROUTE_DATA_BREADCRUMB = 'breadcrumb';
        const ROUTE_DATA_BREADCRUMB_NAME = 'name';
        const ROUTE_DATA_BASEURL = 'baseUrl';
        const ROUTE_DATA_DETAILPAGE = 'detailName';

        const children: ActivatedRoute[] = route.children;
        if (children.length === 0) {
            return breadcrumbs;
        }

        let surl = '';
        let lastindex = 0;

        for (const child of children) {

            if (child.outlet !== PRIMARY_OUTLET) {
                continue;
            }
            // debugger;
            if (!child.snapshot.data.hasOwnProperty(ROUTE_DATA_BREADCRUMB)) {
                return this.buildBreadCrumb(child, url, breadcrumbs);
            }
            // console.log(decodeURIComponent(child.snapshot.url[child.snapshot.url.length - 1].path));
            const routeURL: string = child.snapshot.url.map(segment => segment.path).join('/');
            // const baseurl: string = child.snapshot.data[ROUTE_DATA_BASEURL]
            url += `/${routeURL}`;

            if (surl.length === 0) {
                if (routeURL.includes('/')) {
                    if (child.snapshot.data[ROUTE_DATA_BASEURL].includes('/')) {
                        const index = child.snapshot.data[ROUTE_DATA_BASEURL].split('/').length;
                        if (index === routeURL.split('/').length) {
                            surl = '/' + routeURL;
                        } else {
                            surl = '/' + routeURL.substring(0, routeURL.split('/', index).join('/').length);
                        }
                    } else {
                        surl = '/' + routeURL.substring(0, routeURL.indexOf('/'));
                    }
                } else {
                    surl = '/' + routeURL;
                }
            }

            surl = url.substring(lastindex, surl.length);
            lastindex = surl.length;

            const baseBreadcrumb = {
                label: child.snapshot.data[ROUTE_DATA_BREADCRUMB],
                url: surl
            };
            breadcrumbs.push(baseBreadcrumb);

            if (child.snapshot.data[ROUTE_DATA_BREADCRUMB_NAME] === true) {
                const nameBreadcrumb = {
                    label: child.snapshot.url[child.snapshot.url.length - 1].path,
                    url: url
                };
                breadcrumbs.push(nameBreadcrumb);
            }

            if (child.snapshot.data[ROUTE_DATA_DETAILPAGE] && child.snapshot.data[ROUTE_DATA_DETAILPAGE].length > 0) {
                const detailBreadcrumb = {
                    label: child.snapshot.data[ROUTE_DATA_DETAILPAGE],
                    url: url
                };
                breadcrumbs.push(detailBreadcrumb);
            }

            return this.buildBreadCrumb(child, url, breadcrumbs);
        }
    }

}


