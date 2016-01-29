package com.litmus.worldscope.model;

import java.util.Date;

/**
 * Generic Stream object model returned by WorldScope API Service
 */
public class WorldScopeStream {
    private String streamId;
    private String appInstance;
    private String title;
    private String roomId;
    private int totalStickers;
    private int totalViewers;
    private boolean live;
    private String duration;
    private String description;
    private Date createdAt;
    private Date deletedAt;
    private WorldScopeUser owner;

    public String getStreamId() {return streamId;}
    public String getAppInstance() {return appInstance;}
    public String getTitle() {return title;}
    public String getRoomId() {return roomId;}
    public int getTotalStickers() {return totalStickers;}
    public int getTotalViewers() {return totalViewers;}
    public boolean getLive() {return live;}
    public String getDuration() {return duration;}
    public String getDescription() {return description;}
    public Date getCreatedAt() {return createdAt;}
    public Date getDeletedAt() {return deletedAt;}
    public WorldScopeUser getOwner() {return owner;}

    public void setStreamId(String streamId) {this.streamId = streamId;}
    public void setAppInstance(String appInstance) {this.appInstance = appInstance;}
    public void setTitle(String title) {this.title = title;}
    public void setRoomId(String roomId) {this.roomId = roomId;}
    public void setTotalStickers(int totalStickers) {this.totalStickers = totalStickers;}
    public void setTotalViewers(int totalViewers) {this.totalViewers = totalViewers;}
    public void setLive(boolean live) {this.live = live;}
    public void setDuration(String duration) {this.duration = duration;}
    public void setDescription(String description) {this.description = description;}
    public void setCreatedAt(Date createdAt) {this.createdAt = createdAt;}
    public void setDeletedAt(Date deletedAt) {this.deletedAt = deletedAt;}
    public void setOwner(WorldScopeUser owner) {this.owner = owner;}
}
