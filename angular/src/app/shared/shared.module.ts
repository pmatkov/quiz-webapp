import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from './navbar/navbar.component';
import { FooterComponent } from './footer/footer.component';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { FilterPipe } from './filter.pipe';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SortPipe } from './sort.pipe';

@NgModule({
  declarations: [
    NavbarComponent,
    FooterComponent,
    FilterPipe,
    SortPipe,
    
  ],
  imports: [
    CommonModule,
    HttpClientModule,
    RouterModule, 
    FormsModule,
    ReactiveFormsModule
  ],
  exports: [NavbarComponent, FooterComponent, FilterPipe, SortPipe, FormsModule, ReactiveFormsModule]
})
export class SharedModule { }
