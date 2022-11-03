﻿// Copyright (c) 2022 Sourcefuse Technologies
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT
import {Component, OnInit} from '@angular/core';
import {NgxNotificationService} from 'ngx-notification';
import {environment} from '../../environments/environment';
import {Chat, ChatMessage} from '../chat.model';
import {UserService} from '../chat.service';
import {io, SocketOptions, ManagerOptions} from 'socket.io-client';
import {AuthPayload} from '../auth.model';
import { ActivatedRoute } from '@angular/router';
import jwt_decode from 'jwt-decode';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css'],
  styles: [
    `
      /* :host {
        display: flex;
      } */
    `,
  ],
})
export class ChatComponent implements OnInit {
  payload?: AuthPayload;
  username?: string;
  constructor(
    private readonly userHttpService: UserService,
    private readonly ngxNotificationService: NgxNotificationService,
    private route: ActivatedRoute,
    private authenticationService: AuthService,
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(param => {
      this.authenticationService.getToken(param.code).subscribe(params =>{
        // this.router.navigate(['chat'], {
        //   queryParams: {code: res.accessToken},
        // });
        this.token = params.accessToken;
        this.payload = jwt_decode(this.token);
        console.log(this.payload,params.accessToken);
        this.username =
          this.payload?.user?.firstName ?? this.payload?.user?.username;
          this.channelUUID = environment.CHAT_ROOM;
          this.enterToken();
      })
    });
  }
  public messages: ChatMessage[] = [];
  public senderUUID = '';
  public channelUUID = environment.CHAT_ROOM;
  public token = '';
  public inRoom = true;

  socketIOOpts: Partial<ManagerOptions & SocketOptions> = {
    path: '/socket.io',
    transports: ['polling'],
    upgrade: false,
  };
  

  socket = io(environment.SOCKET_ENDPOINT, this.socketIOOpts);

  enterToken() {
    this.userHttpService.getUserTenantId(this.token).subscribe(data => {
      this.senderUUID = data;
    });
  }

  leaveRoom() {
    this.messages = [];
    this.inRoom = false;
  }

  getMessages() {
    this.inRoom = true;
    this.userHttpService.get(this.token, this.channelUUID).subscribe(data => {
      this.messages = [];
      for (const d of data) {
        const temp: ChatMessage = {
          body: d.body,
          subject: d.subject,
          channelType: '0',
          reply: false,
          sender: 'sender',
        };
        if (d.createdBy === this.senderUUID) {
          temp.sender = 'User';
          temp.reply = true;
        }
        this.messages.push(temp);
      }
    });

    this.subcribeToNotifications();
  }

  subcribeToNotifications() {
    this.socket.on('connect', () => {
      const channelsToAdd: string[] = [this.channelUUID];
      this.socket.emit('subscribe-to-channel', channelsToAdd);
    });

    this.socket.on('userNotif', message => {
      console.log(message); //NOSONAR
      const temp: ChatMessage = {
        body: message.body,
        subject: message.subject,
        channelType: '0',
        reply: false,
        sender: 'sender',
      };
      if(message.subject != this.senderUUID){
        this.ngxNotificationService.sendMessage('You got a message', 'success', 'top-right');
        this.messages.push(temp);
      }
    });
  }

  // sonarignore:start
  sendMessage(event: {message: string}, userName: string, avatar: string) {
    // sonarignore:end
    if (!this.inRoom) {
      return;
    }
    const chatMessage: ChatMessage = {
      body: event.message,
      subject: 'new message',
      toUserId: this.channelUUID,
      channelId: this.channelUUID,
      channelType: '0',
      reply: true,
      sender: userName,
    };

    const dbMessage: Chat = {
      body: event.message,
      subject: this.senderUUID,
      toUserId: this.channelUUID,
      channelId: this.channelUUID,
      channelType: '0',
    };

    // sonarignore:start
    this.userHttpService.post(dbMessage, this.token).subscribe(response => {
      // sonarignore:end
      this.messages.push(chatMessage);
    });
  }
}
