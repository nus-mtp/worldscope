package com.litmus.worldscope.model;

import java.util.Date;

/**
 * Stream object returned from WorldScope App Server when creating a new stream
 */
public class WorldScopeCreatedStream extends WorldScopeStream {

    private Date endedAt;
    private String streamLink;

    public Date getEndedAt() {return endedAt;}
    public String getStreamLink() {return streamLink;};

    public void setEndedAt(Date endedAt) {this.endedAt = endedAt;}
    public void setStreamLink(String streamLink) {this.streamLink = streamLink;}
}
