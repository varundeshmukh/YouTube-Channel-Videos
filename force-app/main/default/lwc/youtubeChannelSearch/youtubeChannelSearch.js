import { LightningElement, wire } from 'lwc';
import getChannelInfo from '@salesforce/apex/YoutubeChannelApiController.getChannelInfo';
import channelSearch from '@salesforce/apex/YoutubeChannelApiController.channelSearch';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { publish, MessageContext } from 'lightning/messageService';
import YouTubeChannelInfoMessageChannel from '@salesforce/messageChannel/YouTubeChannelInfoMessageChannel__c'
import YouTubeChannelListMessageChannel from '@salesforce/messageChannel/YouTubeChannelListMessageChannel__c'

export default class YoutubeChannelSearch extends LightningElement {
    channelName;
    channelInfo;
    channelList = [];

    @wire(MessageContext)
    messageContext;

    handleSearch(){
        channelSearch({searchKey : this.channelName}).then(response => {
            this.channelList = [];
            const channelListResponse = JSON.parse(response);
            console.log('VSD response :totalResults: ' + channelListResponse.pageInfo.totalResults);
            if(channelListResponse.pageInfo.totalResults === 0){
                this.showNotification('INFO', 'No channels found', 'info', 'pester');
            }
            else{
                //channelList = [];
                channelListResponse.items.forEach(item => {
                    console.log('VSD channelId :: ' + item.id.channelId);
                    console.log('VSD title :: ' + item.snippet.channelTitle);
                    console.log('VSD thumbnail default :: ' + item.snippet.thumbnails.default.url);
                    console.log('VSD thumbnail medium :: ' + item.snippet.thumbnails.medium.url);
                    console.log('VSD thumbnail high :: ' + item.snippet.thumbnails.high.url);
                    const channelInfo = {
                        channelid : item.id.channelId,
                        title : item.snippet.channelTitle,
                        description : item.snippet.description,
                        thumbnail_default : item.snippet.thumbnails.default.url,
                        thumbnail_medium : item.snippet.thumbnails.medium.url,
                        thumbnail_high : item.snippet.thumbnails.high.url,
                    };
                    this.channelList.push(channelInfo);
                });
                console.log('VSD channelList :: ' + JSON.stringify(this.channelList));
                const payload = { channelListRecords: this.channelList };

                publish(this.messageContext, YouTubeChannelListMessageChannel, payload);
            }
        }).catch(error => {
            console.log('VSD Error :: ' + JSON.stringify(error));
            this.showNotification('ERROR', JSON.stringify(error), 'error', 'pester');
        });
    }

    getChannelData(){
        getChannelInfo({channelUserName : this.channelName}).then(response => {
            const channelResponse = JSON.parse(response);
            console.log('VSD response :totalResults: ' + channelResponse.pageInfo.totalResults);
            if(channelResponse.pageInfo.totalResults === 0){
                this.showNotification('INFO', 'No channels found', 'info', 'pester');
            }
            else{
                const title = channelResponse.items[0].snippet.title;
                const id = channelResponse.items[0].id;
                const subscribers = channelResponse.items[0].statistics.subscriberCount;
                const views = channelResponse.items[0].statistics.viewCount;
                const videos = channelResponse.items[0].statistics.videoCount;
                const description = channelResponse.items[0].snippet.description;
                const playlistid = channelResponse.items[0].contentDetails.relatedPlaylists.uploads;
                this.channelInfo = {
                    title : title,
                    id : id,
                    subscribers : subscribers,
                    views : views,
                    videos : videos,
                    description : description,
                    playlistid : playlistid
                }

                const payload = { channelInfoRecord: this.channelInfo };

                publish(this.messageContext, YouTubeChannelInfoMessageChannel, payload);
            }
        }).catch(error => {
            console.log('VSD Error :: ' + JSON.stringify(error));
            this.showNotification('ERROR', JSON.stringify(error), 'error', 'pester');
        });
    }

    handleChannelNameChange(event){
        this.channelName = event.detail.value;
        console.log('VSD channelName :: ' + this.channelName);
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