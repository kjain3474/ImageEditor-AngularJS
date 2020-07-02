import { Component, ViewChild, ElementRef, OnInit} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { EditorComponent } from 'projects/editor/src/public-api';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit{

  @ViewChild('canvas', {static: false}) canvas: EditorComponent;

  constructor(private http: HttpClient) {}

  public page: number = 1;
  public pagelimit: number = 5;
  public imgListLength: number = 0;
  public imgList: any[];
  public collection: any[];  

  ngOnInit(): void {

    this.loadImgData();

  }

  public loadImgData(): void{

    this.http.get('https://picsum.photos/v2/list')
      .subscribe( (data: any) => {
        this.collection = data;
        this.imgListLength = data.length;
        this.imgList = data.slice(0, this.pagelimit);
      });
  }

  drag(ev: any): void{
      ev.dataTransfer.setData("text/plain", ev.target.src);
  }

  onScroll(event: any) {
    // visible height + pixel scrolled >= total height 
    if (event.target.offsetHeight + event.target.scrollTop >= (event.target.scrollHeight - 1)) {
      if (this.page * this.pagelimit < this.imgListLength) {
        this.page++;
        let pagination: any[] = this.collection.slice((this.page * this.pagelimit) - this.pagelimit,  (this.page * this.pagelimit))
        this.imgList = [...this.imgList, ...pagination]
      }   
    }
  }

  public confirmClear() {
    this.canvas.confirmClear();
  }

  public canvasRatio(value) {
    this.canvas.canvasRatio(value);
  }

  public cropImage() {
    this.canvas.cropImage();
  }

  public changeSize() {
    this.canvas.changeSize();
  }

  public addText() {
    this.canvas.addText();
  }

  public removeSelected() {
    this.canvas.removeSelected();
  }

  public sendToBack() {
    this.canvas.sendToBack();
  }

  public bringToFront() {
    this.canvas.bringToFront();
  }

  public clone() {
    this.canvas.clone();
  }

  public cleanSelect() {
    this.canvas.cleanSelect();
  }

}
