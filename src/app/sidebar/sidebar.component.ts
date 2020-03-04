import { Component, OnInit } from '@angular/core';
@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit {
  selectedSidebarId: number;
  
  sidebar = [
    {
      id: 1,
      name: 'Home',
      font: 'fa fa-home',
      link: 'user/welcome'
    },
    {
      id: 2,
      name: 'FX Order',
      font: 'fa fa-line-chart',
      link: 'user/fxorder'
    },
  ];

  constructor() { }

  ngOnInit() {
  }

  setSelected(id: any) {
    this.selectedSidebarId = id;
  }
}
