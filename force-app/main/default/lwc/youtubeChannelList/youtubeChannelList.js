import { LightningElement, wire, track } from 'lwc';
import {
    publish,
    subscribe,
    unsubscribe,
    APPLICATION_SCOPE,
    MessageContext
} from 'lightning/messageService';
import channelListRecordMessage from '@salesforce/messageChannel/YouTubeChannelListMessageChannel__c';
import playlistRecordsMessage from '@salesforce/messageChannel/YouTubeVideoPlayListMessageChannel__c';
import getChannelInfo from '@salesforce/apex/YoutubeChannelApiController.getChannelInfo';
import getPlaylistFromChannel from '@salesforce/apex/YoutubeChannelApiController.getPlaylistFromChannel';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class YoutubeChannelList extends LightningElement {
    @track channelListRecords;

    @wire(MessageContext)
    messageContext;

    playlistRecord = [];

    subscribeToMessageChannel() {
        if (!this.subscription) {
            this.subscription = subscribe(
                this.messageContext,
                channelListRecordMessage,
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
        this.channelListRecords = null;
        this.channelListRecords = message.channelListRecords;
        console.log('VSD this.channelListRecords :: ' + this.channelListRecords);
    }

    get isChannelListDisplayed(){
        if(this.channelListRecords){
            return true;
        }
        return false;
    }

    handleChannelClick(event){
        const clickedChannelId = event.currentTarget.dataset.item;
        getChannelInfo({channelId : clickedChannelId}).then(response => {
            const channelResponse = JSON.parse(response);
            console.log('VSD response :totalResults: ' + channelResponse.pageInfo.totalResults);
            if(channelResponse.pageInfo.totalResults === 0){
                this.showNotification('INFO', 'No channels found', 'info', 'pester');
            }
            else{
                console.log('VSD Before uploads');
                console.log('VSD response :uploads: ' + channelResponse.items[0].contentDetails.relatedPlaylists.uploads);
                const playlistid = channelResponse.items[0].contentDetails.relatedPlaylists.uploads;
                console.log('VSD After uploads');
                this.handleVisitChannelAction(playlistid);
            }
        }).catch(error => {
            console.log('VSD Error :handleChannelClick: ' + JSON.stringify(error));
            this.showNotification('ERROR', JSON.stringify(error), 'error', 'pester');
        });
    }

    handleVisitChannelAction(receivedPlaylistId){
        console.log('VSD Playlist ID :: ' + receivedPlaylistId);
        this.playlistRecord = [];
        getPlaylistFromChannel({playlistId : receivedPlaylistId}).then(response => {
            const playListResponse = JSON.parse(response);
            
            playListResponse.items.forEach(item => {
                console.log('VSD title :: ' + item.snippet.title);
                console.log('VSD videoid :: ' + item.snippet.resourceId.videoId);
                const videoInfo = {
                    title : item.snippet.title,
                    videoid : item.snippet.resourceId.videoId,
                    videosrc : 'https://www.youtube.com/embed/' + item.snippet.resourceId.videoId
                };
                this.playlistRecord.push(videoInfo);
            });
            const payload = { playlistRecords: this.playlistRecord };
            publish(this.messageContext, playlistRecordsMessage, payload);
        }).catch(error => {
            console.log('VSD Error :handleVisitChannelAction: ' + JSON.stringify(error));
            this.showNotification('ERROR', JSON.stringify(error), 'error', 'pester');
        });
    }

    showNotification(title, message, variant, mode) {
        const evt = new ShowToastEvent({
            title: title,
            message: message,
            variant: variant,
            mode: mode
        });
        this.dispatchEvent(evt);
    }
}