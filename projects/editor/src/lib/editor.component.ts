import { Component, ViewChild, ElementRef, AfterViewInit} from '@angular/core';
import { fabric } from 'fabric';

@Component({
  selector: 'editor',
  templateUrl: './editor.component.html',
  styleUrls: ['./editor.component.css'],
})

export class EditorComponent implements AfterViewInit {
  @ViewChild('htmlCanvas') htmlCanvas: ElementRef;

  private canvas: fabric.Canvas;
  public props = {
    canvasImage: '',
    id: null,
  };

  public textString: string;
  public size: any = {
    width: 320,
    height: 568.89
  };
  
  public selected: any;
  public mousex: number = 0;
  public mousey: number = 0;
  public crop: boolean = false;
  public disabled: boolean = true;
  public pos: any[] = [0, 0];
  public el: any;
  public container : any;
  public lowercanvas: any;

  constructor(private elRefCanvas:ElementRef, private elRefLowCanvas: ElementRef) { }

  ngAfterViewInit(): void {


    // setup front side canvas
    this.canvas = new fabric.Canvas(this.htmlCanvas.nativeElement, {
      hoverCursor: 'pointer',
      selection: true,
      selectionBorderColor: 'blue',
    });

    //cropping rect
    this.el = new fabric.Rect({
      fill: 'transparent',
      originX: 'left',
      originY: 'top',
      stroke: '#ccc',
      strokeDashArray: [2, 2],
      opacity: 1,
      width: 1,
      height: 1
    });

    this.el.visible = false;
    this.canvas.bringToFront(this.el);
    this.canvas.add(this.el);

    //Object Selection in canvas
    this.canvas.on({
      'object:moving': (e) => { this.el.visible = false; },
      'object:selected': (e) => {

        const selectedObject = e.target;
        this.selected = selectedObject;
        selectedObject.hasRotatingPoint = true;
        selectedObject.transparentCorners = false;
        selectedObject.cornerColor = 'rgba(255, 87, 34, 0.7)';

        this.setCroppingEnabled();
      },
      'selection:cleared': (e) => {
        this.selected = null;
      }
    });

    this.canvas.setWidth(this.size.width);
    this.canvas.setHeight(this.size.height);

    // setting canvas in middle
    this.container = this.elRefCanvas.nativeElement.querySelector('.canvas-container');
    this.container.style.margin = "auto";

    //lower canvas to get backgrond effecr
    this.lowercanvas = this.elRefLowCanvas.nativeElement.querySelector('.lower-canvas');

    //get Initial canvas size
    this.getContainerBoundingRect();

    this.container.addEventListener('drop', (e) =>{ this.handleDrop(e); }, false);

    this.container.addEventListener('mousedown', (e) =>{ this.mousedown(e); }, false);

    this.container.addEventListener('mousemove', (e) =>{ this.mousemove(e); }, false);

    this.container.addEventListener('mouseup', (e) =>{ this.mouseup(e);}, false);

  }

  setCroppingEnabled(){
    this.disabled = false;
  }

  setCroppingDisabled(){
    this.disabled = true;
  }

  //mouse down event
  mousedown(event: MouseEvent) {
    if (this.disabled) return;
    this.el.visible = false;
    this.el.left = event.clientX - this.pos[0];
    this.el.top = event.clientY - this.pos[1];
    this.mousex = event.clientX;
    this.mousey = event.clientY;
    this.crop = true;
    this.el.visible = true;
    this.canvas.bringToFront(this.el);
  }

  mousemove(event: MouseEvent){
    if (this.crop && !this.disabled) {
        if (event.clientX - this.mousex > 0) {
            this.el.width = event.clientX - this.mousex;
        }

        if (event.clientY - this.mousey > 0) {
            this.el.height = event.clientY - this.mousey;
        }
    }
  }

  mouseup(event: MouseEvent){
    this.crop = false;
  }

  cropImage(){

    var left = this.el.left - this.selected.left;
    var top = this.el.top - this.selected.top;
  
    var width = this.el.width;
    var height = this.el.height;
  
    this.selected.clipTo = function (ctx) {
      ctx.rect(left, top, width, height);
    };

    this.setCroppingDisabled();
    this.el.visible = false;
    this.canvas.renderAll();
  }

  changeSize() {
    this.canvas.setWidth(this.size.width);
    this.canvas.setHeight(this.size.height);
  }
  
  //change Ratio
  canvasRatio(value)
  {
      if(value === "1"){
        this.size.width = 320;
        this.size.height = 568.89;
        this.changeSize();
        this.getContainerBoundingRect();
        
      }
      else if(value === "2"){
        this.size.height = 320;
        this.size.width = 568.89;
        this.changeSize(); 
        this.getContainerBoundingRect();
      }
  }


  getContainerBoundingRect()
  {
    let r = this.container.getBoundingClientRect();
        this.pos[0] = r.left;
        this.pos[1] = r.top;
  }
  

  addText() {
    if (this.textString) {
      const text = new fabric.IText(this.textString, {
        left: 10,
        top: 10,
        fontFamily: 'helvetica',
        angle: 0,
        fill: '#000000',
        scaleX: 0.5,
        scaleY: 0.5,
        fontWeight: '',
        hasRotatingPoint: true
      });

      this.extend(text, this.randomId());
      this.canvas.add(text);
      this.textString = '';
    }
  }

  handleDrop(e: any){
    // this / e.target is current target element.

    if (e.stopPropagation) {
        e.stopPropagation(); // stops the browser from redirecting.
    }

    var src = e.dataTransfer.getData("text");

    this.addImageOnCanvas(src);
}

  addImageOnCanvas(url) {
    let self = this;
    if (url) {

      fabric.Image.fromURL(url, (imageObj) => {
        var imageAspectRatio = imageObj.width / imageObj.height;
        var canvasAspectRatio = this.canvas.getWidth() / this.canvas.getHeight();
        var renderableHeight, renderableWidth, xStart, yStart;
      
        // If image's aspect ratio is less than canvas's we fit on height
        // and place the image centrally along width
        if(imageAspectRatio < canvasAspectRatio) {
          renderableHeight = this.canvas.getHeight();
          renderableWidth = imageObj.width * (renderableHeight / imageObj.height);
          xStart = (this.canvas.getWidth() - renderableWidth) / 2;
          yStart = 0;
        }
      
        // If image's aspect ratio is greater than canvas's we fit on width
        // and place the image centrally along height
        else if(imageAspectRatio > canvasAspectRatio) {
          renderableWidth = this.canvas.getWidth();
          renderableHeight = imageObj.height * (renderableWidth / imageObj.width);
          xStart = 0;
          yStart = (this.canvas.getHeight() - renderableHeight) / 2;
        }
      
        // Happy path - keep aspect ratio
        else {
          renderableHeight = this.canvas.getHeight();
          renderableWidth = this.canvas.getWidth();
          xStart = 0;
          yStart = 0;
        }

        imageObj.set({
          left: xStart,
          top: yStart,
          angle: 0,
          padding: 0,
          cornerSize: 10,
          hasRotatingPoint: true
        });

        imageObj.scaleToWidth(renderableWidth);
        imageObj.scaleToHeight(renderableHeight);
        if(!self.props.canvasImage){
          imageObj.selectable = false;
          self.lowercanvas.style.background =  "url("+url+") center center no-repeat";
          self.props.canvasImage = url;
        }
        this.extend(imageObj, this.randomId());
        this.canvas.add(imageObj);
      });
    }
  }

  /*Canvas*/
  cleanSelect() {
    this.canvas.discardActiveObject().renderAll();
  }


  extend(obj, id) {
    obj.toObject = ((toObject) => {
      return function() {
        return fabric.util.object.extend(toObject.call(this), {
          id
        });
      };
    })(obj.toObject);
  }

  randomId() {
    return Math.floor(Math.random() * 999999) + 1;
  }

  clone() {
    const activeObject = this.canvas.getActiveObject();
    const activeGroup = this.canvas.getActiveObjects();

    if (activeObject) {
      let clone;
      switch (activeObject.type) {
        case 'i-text':
          clone = new fabric.IText('', activeObject.toObject());
          break;
        case 'image':
          clone = fabric.util.object.clone(activeObject);
          break;
      }
      if (clone) {
        clone.set({ left: 10, top: 10 });
        this.canvas.add(clone);
      }
    }
  }

  removeSelected() {
    const activeObject = this.canvas.getActiveObject();
    const activeGroup = this.canvas.getActiveObjects();

    if (activeObject) {
      this.canvas.remove(activeObject);
      // this.textString = '';
    } else if (activeGroup) {
      this.canvas.discardActiveObject();
      const self = this;
      activeGroup.forEach((object) => {
        self.canvas.remove(object);
      });
    }
  }

  bringToFront() {
    const activeObject = this.canvas.getActiveObject();
    const activeGroup = this.canvas.getActiveObjects();

    if (activeObject) {
      activeObject.bringToFront();
      activeObject.opacity = 1;
    } else if (activeGroup) {
      this.canvas.discardActiveObject();
      activeGroup.forEach((object) => {
        object.bringToFront();
      });
    }
  }

  sendToBack() {
    const activeObject = this.canvas.getActiveObject();
    const activeGroup = this.canvas.getActiveObjects();

    if (activeObject) {
      this.canvas.sendToBack(activeObject);
      activeObject.sendToBack();
      activeObject.opacity = 1;
    } else if (activeGroup) {
      this.canvas.discardActiveObject();
      activeGroup.forEach((object) => {
        object.sendToBack();
      });
    }
  }


  confirmClear() {
    if (confirm('Are you sure?')) {
      this.canvas.clear();
      this.lowercanvas.style.background = ""
      this.props.canvasImage = ""
    }
  }
}
