import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {OAuthService} from 'angular-oauth2-oidc';
import {FormBuilder} from '@angular/forms';
import {ChatService} from '../../services/chat.service';
import {ChatHistoryData} from '../../models/ChatHistoryData';
import {AuthService} from '../../services/auth.service';
import {ActivatedRoute, Router} from '@angular/router';
import {ChatMessage} from '../../models/ChatMessage';
import {Subscription} from 'rxjs';
import {environment} from '../../../environments/environment';
import {SocketService} from '../../services/socket.service';
import {UserService} from '../../services/user.service';
import {MatDialog} from '@angular/material/dialog';
import {StartChatComponent} from './dialog/start-chat/start-chat.component';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})
export class ChatComponent implements OnInit {
  @ViewChild('msgHistory') msgHistory: ElementRef;
  chatHistoryData: ChatHistoryData[];
  currentUserUsername = this.authService.getUsername();
  chatWithUsername;
  chatMessages: ChatMessage[] = [];
  newChatMessageText = '';
  subscription: Subscription;
  anotherUserAvatar;
  defaultAvatarUrl = environment.defaultAvatarUrl;

  constructor(
    private oAuthService: OAuthService,
    private socketService: SocketService,
    private chatService: ChatService,
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private userService: UserService,
    private dialog: MatDialog,
    private route: ActivatedRoute,
    private router: Router
  ) {
  }

  onMessageReceived(chatMessage) {
    if (chatMessage !== null) {
      if (chatMessage.sender.username === this.chatWithUsername) {
        this.chatMessages.unshift(chatMessage);
        this.updateLastMessageInChatHistory(chatMessage, false);
      } else {
        this.updateLastMessageInChatHistory(chatMessage);
      }
    }
    this.scrollToBottom();
  }

  onSendMessage() {
    this.socketService.send(this.chatWithUsername, this.newChatMessageText);
    const chatMessage = ChatService.createChatMessage(
      this.currentUserUsername, this.chatWithUsername, this.newChatMessageText, new Date()
    );
    this.chatMessages.unshift(chatMessage);
    this.updateLastMessageInChatHistory(chatMessage, false);
    this.newChatMessageText = '';
  }

  ngOnInit(): void {
    this.subscription = this.socketService.message.subscribe(message => {
      if (message != null) {
        this.onStompMessageReceived(message);
      }
    });

    this.loadChatHistory();
    this.route.queryParams.subscribe(params => {
      this.chatWithUsername = params.with;
      if (this.chatWithUsername !== undefined) {
        this.loadChatMessages(this.chatWithUsername);
        this.initChatBoxAvatar(this.chatWithUsername);
      }
    });
    this.scrollToBottom();
  }

  onStompMessageReceived(message: string) {
    const parsedMessage = JSON.parse(message);
    if (parsedMessage.sender !== undefined) {
      this.onMessageReceived(parsedMessage);
    }
  }

  loadChatHistory() {
    this.chatService.getChatHistory().subscribe(chatHistoryData => {
      this.chatHistoryData = chatHistoryData;
      this.chatHistoryData.forEach(chatHistoryEl => this.prepareChatHistoryData(chatHistoryEl));
      this.chatHistoryData.forEach(chatHistoryEl => this.getAvatar(chatHistoryEl));
    });
  }

  getAvatar(chatHistoryDataEl: ChatHistoryData) {
    this.userService.getAvatar(chatHistoryDataEl.anotherUserUsername).subscribe(blob => {
      const reader = new FileReader();
      reader.readAsDataURL(blob);
      reader.onloadend = () => {
        chatHistoryDataEl.avatar = reader.result;
      };
    });
  }

  initChatBoxAvatar(username: string) {
    this.userService.getAvatar(username).subscribe(blob => {
      const reader = new FileReader();
      reader.readAsDataURL(blob);
      reader.onloadend = () => {
        this.anotherUserAvatar = reader.result;
      };
    });
  }

  loadChatMessages(username: string) {
    this.chatService.getChatMessages(username).subscribe(chatMessages => {
      this.chatMessages = chatMessages.content;
      ChatService.resetUnreadMessageCounterForUsername(username, this.chatHistoryData);
    }, () => {
      this.router.navigate([], {
        relativeTo: this.route,
      });
    });
  }

  prepareChatHistoryData(chatHistoryData: ChatHistoryData) {
    chatHistoryData.anotherUserUsername = ChatService.getAnotherUserUsername(chatHistoryData.lastMessage, this.currentUserUsername);
    chatHistoryData.lastMessage.sendDate = new Date(chatHistoryData.lastMessage.sendDate);
  }

  updateLastMessageInChatHistory(chatMessage: ChatMessage, incrementUnreadCounter: boolean = true) {
    const anotherUserUsername = ChatService.getAnotherUserUsername(chatMessage, this.currentUserUsername);
    for (const chatHistory of this.chatHistoryData) {
      if (chatHistory.anotherUserUsername === anotherUserUsername) {
        chatHistory.lastMessage = chatMessage;
        if (incrementUnreadCounter) {
          chatHistory.unreadMessageCount += 1;
        }
        return;
      }
    }
    this.chatHistoryData.push(ChatService.createNewChatHistoryData(chatMessage, anotherUserUsername));
  }

  onChatSelected(chatData: ChatHistoryData) {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {with: chatData.anotherUserUsername},
    });
    this.anotherUserAvatar = chatData.avatar;
  }

  scrollToBottom(): void {
    try {
      this.msgHistory.nativeElement.scrollTop = this.msgHistory.nativeElement.scrollHeight;
    } catch (e) {

    }
  }

  onChatMessagesScrolled(event: any) {
    if (event.target.scrollTop === 0) {
      this.chatService.getChatMessages(this.chatWithUsername, this.chatMessages.length, environment.message_buffer).subscribe(data => {
        this.chatMessages.push(...data.content);
        event.target.scrollTop = 30 * data.content.length;
      });
    }
  }

  onTextTyping() {
    this.scrollToBottom();
  }

  openStartChatDialog() {
    const dialogRef = this.dialog.open(StartChatComponent, {
      width: '500px'
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.router.navigate([], {
          relativeTo: this.route,
          queryParams: {with: result},
        });
      }
    });
  }
}
