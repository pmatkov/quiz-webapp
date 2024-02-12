import { Component, ElementRef, OnInit, Renderer2 } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css']
})
export class AdminDashboardComponent implements OnInit {

  constructor(private eref: ElementRef, private renderer: Renderer2, private router: Router) {}

  ngOnInit() {

    const paths = ['quizzes', 'categories', 'questions']

    let expand = false;
    paths.forEach(path => {
      if (this.router.url.includes(path)) {
        expand = true;
      }
    });
    this.collapse(null, expand);

  }

  collapse(event?: MouseEvent | null, expand?: boolean) {

    const selectedElement = event?.target as Element;
    const id = selectedElement?.id;
    const child = selectedElement?.classList.contains('nav-child');
    const childElements = this.eref.nativeElement.querySelectorAll('.nav-child');  
  
    if (childElements.length > 0) {
      childElements.forEach((e: HTMLElement) => {
        
        if (id === 'toggler' || expand) {
          this.renderer.removeClass(e, 'hidden');
        } else if (!child) {
          this.renderer.addClass(e, 'hidden');
        }
      });
    }  
  }

}
