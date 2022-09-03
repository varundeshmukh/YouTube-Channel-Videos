public with sharing class YoutubeChannelApiController {
    public static final String G_API_KEY = 'AIzaSyAKRznplBWo7VBg-YdswMIqQ6Bj8jPx8BE';
    @AuraEnabled
    public static string channelSearch(String searchKey){
        try {
            
            HttpRequest getChannelReq = new HttpRequest();
            getChannelReq.setEndpoint('callout:gapi' + '/youtube/v3/search?part=snippet&maxResults=5&q=' + EncodingUtil.urlEncode(searchKey, 'UTF-8') + '&key=' + G_API_KEY + '&type=channel');
            getChannelReq.setMethod('GET');
            Http http = new Http();
            HttpResponse response = http.send(getChannelReq);
            if(response.getStatusCode() != 200){
                throw new AuraHandledException('Response Code Received :: ' + response.getStatusCode());
            }
            return response.getBody();

        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }

    @AuraEnabled
    public static String getChannelInfo(String channelId){
        try {
            HttpRequest getChannelReq = new HttpRequest();
            getChannelReq.setEndpoint('callout:gapi' + '/youtube/v3/channels?part=snippet,contentDetails,statistics&id=' + channelId + '&key=' + G_API_KEY);
            getChannelReq.setMethod('GET');
            Http http = new Http();
            HttpResponse response = http.send(getChannelReq);
            if(response.getStatusCode() != 200){
                throw new AuraHandledException('Response Code Received :: ' + response.getStatusCode());
            }
            return response.getBody();
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }

    @AuraEnabled
    public static string getPlaylistFromChannel(String playlistId){
        try {
            HttpRequest getPlayListReq = new HttpRequest();
            getPlayListReq.setEndpoint('callout:gapi' + '/youtube/v3/playlistItems?part=snippet&playlistId=' + playlistId + '&maxResults=10&key=' + G_API_KEY);

            getPlayListReq.setMethod('GET');
            Http http = new Http();
            HttpResponse response = http.send(getPlayListReq);
            if(response.getStatusCode() != 200){
                throw new AuraHandledException('Response Code Received :: ' + response.getStatusCode());
            }
            return response.getBody();
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }
}
