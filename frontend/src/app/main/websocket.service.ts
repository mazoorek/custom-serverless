import {Inject, Injectable} from '@angular/core';
import {fromEvent, Observable} from 'rxjs';
import {DOCUMENT} from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class WebsocketService {

  public onOpen$!: Observable<Event>;
  public onMessage$!: Observable<Event>;
  public onClose$!: Observable<Event>;
  private webSocket!: WebSocket;
  private window: Window;

  constructor(@Inject(DOCUMENT) private document: Document) {
    this.window = this.document.defaultView as Window;
    // this.connect();
  }

  public connect(): void {
    this.webSocket = new WebSocket(`ws://${this.window.location.hostname}/ws`);
    this.onOpen$ = fromEvent(this.webSocket, 'open');
    this.onMessage$ = fromEvent(this.webSocket, 'message');
    this.onClose$ = fromEvent(this.webSocket, 'close');
    console.log("ws connection opened");
  }

  public sendMessage (message: string): void {
    this.webSocket.send(message);
  }

  public closeWebSocket(): void {
    this.webSocket.close();
  }
}
