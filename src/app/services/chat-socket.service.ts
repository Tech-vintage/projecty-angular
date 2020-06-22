import {Injectable} from '@angular/core';
import {OAuthService} from 'angular-oauth2-oidc';
import {environment} from '../../environments/environment';
import {UserService} from './user.service';
import {BehaviorSubject} from 'rxjs';
import {ChatMessage} from '../models/ChatMessage';

declare var SockJS;
declare var Stomp;

@Injectable({
  providedIn: 'root'
})
export class ChatSocketService {
  stompClient;
  private chatMessageSource = new BehaviorSubject<ChatMessage>(null);
  chatMessage = this.chatMessageSource.asObservable();

  constructor(private oauthService: OAuthService, private userService: UserService) {

  }

  connect() {
    const endpoint = environment.chatUrl + '?access_token=' + this.oauthService.getAccessToken();
    const socket = new SockJS(endpoint);
    this.stompClient = Stomp.over(socket);
    let sessionId = '';
    const that = this;
    this.stompClient.connect({}, function(frame) {
      console.log(that.stompClient.ws._transport.url);
      let url = that.stompClient.ws._transport.url;
      url = url.replace(
        'ws://localhost:8080/secured/room/', '');
      url = url.replace('/websocket', '');
      url = url.replace(/^[0-9]+\//, '');
      url = url.replace(/\?.*/, '');
      console.log('Your current session is: ' + url);
      sessionId = url;

      that.stompClient.subscribe('/secured/user/queue/specific-user'
        + '-user' + sessionId, message => {
        const chatMessage = JSON.parse(message.body);
        that.chatMessageSource.next(chatMessage);
      });
    });
  }

  sendMessage(recipient: string, text: string) {
    this.stompClient.send('/spring-security-mvc-socket/secured/room', {},
      JSON.stringify({'sender': 'Sender', 'recipient': recipient, 'text': text}));
  }
}
