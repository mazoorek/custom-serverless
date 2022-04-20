import {Inject, Injectable} from '@angular/core';
import {fromEvent, Observable} from 'rxjs';
import {DOCUMENT} from '@angular/common';
import {environment} from '../../environments/environment';

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
  }

  public connect(): void {
    const url = environment.production ? `ws://${this.window.location.hostname}/ws` : 'ws://localhost:8080/ws';
    this.webSocket = new WebSocket(url);
    this.onOpen$ = fromEvent(this.webSocket, 'open');
    this.onMessage$ = fromEvent(this.webSocket, 'message');
    this.onClose$ = fromEvent(this.webSocket, 'close');
  }

  public sendMessage (message: string): void {
    this.webSocket.send(message);
    console.log(`message: ${message} has been sent`);
  }

  public closeWebSocket(): void {
    this.webSocket.close();
  }
}
