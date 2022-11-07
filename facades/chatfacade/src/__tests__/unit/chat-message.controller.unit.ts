import { expect, sinon } from "@loopback/testlab";
import { PubnubMessageController } from "../../controllers";
import { SocketMessage } from "../../models";
import { Messageservice, Notificationservice} from "../../services";



describe('Socket-message Controller (unit)', () => {
    let messageService : Messageservice;
    let notifService : Notificationservice;
    let getMessage: sinon.SinonStub;
    let updateMsgRecipients: sinon.SinonStub;
    beforeEach(givenStubbedMessageService);
    beforeEach(givenStubbedNotifService);
    let mockToken:'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImZhMzQ2YjVmLWIzMWMtN2EzYy1hODUzLTk4MTIwNjBkM2I0YSIsImZpcnN0TmFtZSI6IkFkbWluIiwibGFzdE5hbWUiOiJVc2VyIiwibWlkZGxlTmFtZSI6bnVsbCwidXNlcm5hbWUiOiJhZG1pbkBleGFtcGxlLmNvbSIsImVtYWlsIjoiYWRtaW5AZXhhbXBsZS5jb20iLCJwaG9uZSI6bnVsbCwibGFzdExvZ2luIjpudWxsLCJkb2IiOm51bGwsImdlbmRlciI6bnVsbCwiZGVmYXVsdFRlbmFudElkIjoiMWQ2ZTYwY2ItYTAxNy0xZWI3LTg4N2EtMzZkY2ZiYWQzNDM0IiwicGVybWlzc2lvbnMiOlsiQ3JlYXRlVG9kbyIsIlVwZGF0ZVRvZG8iLCJEZWxldGVUb2RvIiwiVmlld01lc3NhZ2UiLCJDcmVhdGVNZXNzYWdlIiwiVXBkYXRlTWVzc2FnZSIsIkRlbGV0ZU1lc3NhZ2UiLCIxIiwiMiIsIjMiLCI0IiwiNSIsIjYiLCI3IiwiOCIsIkNyZWF0ZU1lc3NhZ2VSZWNpcGllbnQiLCJWaWV3TWVzc2FnZVJlY2lwaWVudCIsIlVwZGF0ZU1lc3NhZ2VSZWNpcGllbnQiLCJEZWxldGVNZXNzYWdlUmVjaXBpZW50IiwiVmlld05vdGlmaWNhdGlvbiIsIkNyZWF0ZU5vdGlmaWNhdGlvbiIsIlVwZGF0ZU5vdGlmaWNhdGlvbiIsIkRlbGV0ZU5vdGlmaWNhdGlvbiIsIkNhbkdldE5vdGlmaWNhdGlvbkFjY2VzcyIsIlZpZXdDaGFubmVsIiwiQ3JlYXRlQ2hhbm5lbCIsIlVwZGF0ZUNoYW5uZWwiLCJEZWxldGVDaGFubmVsIl0sInVzZXJQcmVmZXJlbmNlcyI6eyJsb2NhbGUiOiJlbiJ9LCJ0ZW5hbnRJZCI6IjFkNmU2MGNiLWEwMTctMWViNy04ODdhLTM2ZGNmYmFkMzQzNCIsInVzZXJUZW5hbnRJZCI6ImEyZDE0ZmQ4LTVkY2QtYTk3YS1iODcwLTk3ZGFlNTc4ZmNmZiIsInN0YXR1cyI6MSwicm9sZSI6IkFkbWluIiwiaWF0IjoxNjY3NTQ4Mzk5LCJleHAiOjE2Njc1NDkyOTksImlzcyI6ImhlbGxvIn0.YZbBoQp-pH9UWHYXsHlHGf64xQ12GvibjYb0Y4cf8bw'

    const mockMessage =[
        new SocketMessage({
            id: "8f1caf64-869a-3116-d688-9cfec25ca7f5",
            body: "Calling ...",
            channelId: "7f1a3734-a063-4fdc-3d23-169c22d08b6b",
            channelType: "0",
            subject: "",
            toUserId: "7f1a3734-a063-4fdc-3d23-169c22d08b6b",
          })
    ];
 
    it('patches the messages of a group ', async () => {
        const controller = new PubnubMessageController(messageService,notifService);
        updateMsgRecipients.resolves(mockMessage);
  
        const messages = await controller.patchMessageRecipients(mockToken,'8f1caf64-869a-3116-d688-9cfec25ca7f5');
        expect(messages).to.deepEqual(mockMessage);
        sinon.assert.calledWithMatch(updateMsgRecipients,'8f1caf64-869a-3116-d688-9cfec25ca7f5');
    });

    it('fetch the messages of a group ', async () => {
        const controller = new PubnubMessageController(messageService,notifService);
        getMessage.resolves(mockMessage);
  
        const messages = await controller.find(mockToken,'7f1a3734-a063-4fdc-3d23-169c22d08b6b');
        expect(messages).to.deepEqual(mockMessage);
        sinon.assert.calledWithMatch(getMessage);
      });

   

    function givenStubbedMessageService() {
        messageService = {getMessage: sinon.stub(),createMessage: sinon.stub(), getMessageRecipients: sinon.stub(),createMessageRecipients:sinon.stub() , updateMsgRecipients:sinon.stub()};
        getMessage = messageService.getMessage as sinon.SinonStub;
        updateMsgRecipients = messageService.updateMsgRecipients as sinon.SinonStub;
    }
    function givenStubbedNotifService() {
        notifService = {getNotification: sinon.stub(),createNotification: sinon.stub()};
    }


});