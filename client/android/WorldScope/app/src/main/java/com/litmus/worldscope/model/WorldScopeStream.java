package com.litmus.worldscope.model;

import android.os.Parcel;
import android.os.Parcelable;

import java.util.Date;

/**
 * Generic Stream object model returned by WorldScope API Service
 */
public class WorldScopeStream implements Parcelable {
    private String streamId;
    private String appInstance;
    private String title;
    private String roomId;
    private int totalStickers;
    private int totalViewers;
    private boolean live;
    private String duration;
    private String description;
    private long createdAt;
    private long deletedAt;
    private String owner;
    private WorldScopeUser streamer;

    public WorldScopeStream() {
        // Default empty constructor
    }

    public String getStreamId() {return streamId;}
    public String getAppInstance() {return appInstance;}
    public String getTitle() {return title;}
    public String getRoomId() {return roomId;}
    public int getTotalStickers() {return totalStickers;}
    public int getTotalViewers() {return totalViewers;}
    public boolean getLive() {return live;}
    public String getDuration() {return duration;}
    public String getDescription() {return description;}
    public long getCreatedAt() {return createdAt;}
    public long getDeletedAt() {return deletedAt;}
    public String getOwner() {return owner;}
    public WorldScopeUser getStreamer() {return streamer;}

    public void setStreamId(String streamId) {this.streamId = streamId;}
    public void setAppInstance(String appInstance) {this.appInstance = appInstance;}
    public void setTitle(String title) {this.title = title;}
    public void setRoomId(String roomId) {this.roomId = roomId;}
    public void setTotalStickers(int totalStickers) {this.totalStickers = totalStickers;}
    public void setTotalViewers(int totalViewers) {this.totalViewers = totalViewers;}
    public void setLive(boolean live) {this.live = live;}
    public void setDuration(String duration) {this.duration = duration;}
    public void setDescription(String description) {this.description = description;}

    public void setCreatedAt(long createdAt) {this.createdAt = createdAt;}
    public void setDeletedAt(long deletedAt) {this.deletedAt = deletedAt;}
    public void setOwner(String owner) {this.owner = owner;}

    public void setStreamer(WorldScopeUser streamer) {this.streamer = streamer;}


    @Override
    public String toString() {
        return "streamId: " + getStreamId() + "\n"
                + "appInstance: " + getAppInstance() + "\n"
                + "title: " + getTitle() + "\n"
                + "roomId: " + getRoomId() + "\n"
                + "totalStickers: " + getTotalStickers() + "\n"
                + "totalViewers: " + getTotalViewers() + "\n"
                + "live: " + getLive() + "\n"
                + "duration: " + getDuration() + "\n"
                + "description: " + getDescription() + "\n"
                + "createdAt: " + getCreatedAt() + "\n"
                + "deletedAt: " + getDeletedAt() + "\n"
                + "owner: " + getOwner();
    }

    protected WorldScopeStream(Parcel in) {
        streamId = in.readString();
        appInstance = in.readString();
        title = in.readString();
        roomId = in.readString();
        totalStickers = in.readInt();
        totalViewers = in.readInt();
        live = in.readByte() != 0x00;
        duration = in.readString();
        description = in.readString();
        createdAt = in.readLong();
        deletedAt = in.readLong();
        owner = in.readString();
        streamer = (WorldScopeUser) in.readValue(WorldScopeUser.class.getClassLoader());
    }

    @Override
    public int describeContents() {
        return 0;
    }

    @Override
    public void writeToParcel(Parcel dest, int flags) {
        dest.writeString(streamId);
        dest.writeString(appInstance);
        dest.writeString(title);
        dest.writeString(roomId);
        dest.writeInt(totalStickers);
        dest.writeInt(totalViewers);
        dest.writeByte((byte) (live ? 0x01 : 0x00));
        dest.writeString(duration);
        dest.writeString(description);
        dest.writeLong(createdAt);
        dest.writeLong(deletedAt);
        dest.writeString(owner);
        dest.writeValue(streamer);
    }

    @SuppressWarnings("unused")
    public static final Parcelable.Creator<WorldScopeStream> CREATOR = new Parcelable.Creator<WorldScopeStream>() {
        @Override
        public WorldScopeStream createFromParcel(Parcel in) {
            return new WorldScopeStream(in);
        }

        @Override
        public WorldScopeStream[] newArray(int size) {
            return new WorldScopeStream[size];
        }
    };
}