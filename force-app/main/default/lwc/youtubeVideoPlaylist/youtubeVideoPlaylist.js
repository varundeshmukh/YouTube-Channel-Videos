import { LightningElement, wire, track } from 'lwc';
import {
    subscribe,
    unsubscribe,
    APPLICATION_SCOPE,
    MessageContext
} from 'lightning/messageService';
import playlistRecordsMessage from '@salesforce/messageChannel/YouTubeVideoPlayListMessageChannel__c';

export default class YoutubeVideoPlaylist extends LightningElement {
    @track playlistRecordsReceived;

    @wire(MessageContext)
    messageContext;

    subscribeToMessageChannel() {
        if (!this.subscription) {
            this.subscription = subscribe(
                this.messageContext,
                playlistRecordsMessage,
                (message) => this.handleMessage(message),
                { scope: APPLICATION_SCOPE }
            );
        }
    }

    unsubscribeToMessageChannel() {
        unsubscribe(this.subscription);
        this.subscription = null;
    }

    connectedCallback() {
        this.subscribeToMessageChannel();
    }

    disconnectedCallback() {
        this.unsubscribeToMessageChannel();
    }

    handleMessage(message) {
        this.playlistRecordsReceived = message.playlistRecords;
    }

    get isPlaylistDisplayed(){
        if(this.playlistRecordsReceived){
            return true;
        }
        return false;
    }
}