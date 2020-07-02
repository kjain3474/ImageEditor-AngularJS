import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';

import {EditorComponent } from './editor.component';

@NgModule({
  declarations: [EditorComponent],
  imports: [
    BrowserModule,
    FormsModule
  ],
  exports: [EditorComponent]
})
export class EditorModule { }
