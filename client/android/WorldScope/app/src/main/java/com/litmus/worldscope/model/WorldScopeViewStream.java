package com.litmus.worldscope.model;

import android.os.Parcel;
import android.os.Parcelable;
import android.util.Log;

/**
 * Stream object model returned from WorldScope App Server for viewing of streams
 */
public class WorldScopeViewStream extends WorldScopeStream implements Parcelable {
    private static final String TAG = "WorldScopeViewStream";

    private String viewLink;
    private String thumbnailLink;

    public String getViewLink() {return viewLink;}
    public String getThumbnailLink() {return thumbnailLink;}

    public void setViewLink(String viewLink) {this.viewLink = viewLink;}
    public void setThumbnailLink(String thumbnailLink) {this.thumbnailLink = thumbnailLink;}

    public WorldScopeViewStream() {
        // Default empty constructor
    }

    @Override
    public String toString() {
        return super.toString() + "\n"
                + "viewLink: " + this.getViewLink()
                + "thumbnailLink: " + this.getThumbnailLink();
    }


    protected WorldScopeViewStream(Parcel in) {
        this.setAppInstance(in.readString());
        this.setStreamId(in.readString());
        this.setTitle(in.readString());
        this.setRoomId(in.readString());
        this.setTotalStickers(in.readInt());
        this.setTotalViewers(in.readInt());
        this.setDuration(in.readString());
        this.setDescription(in.readString());
        this.setCreatedAt(in.readLong());
        this.setDeletedAt(in.readLong());
        this.setOwner(in.readString());
        this.setStreamer((WorldScopeUser)in.readValue(WorldScopeUser.class.getClassLoader()));
        viewLink = in.readString();
        thumbnailLink = in.readString();
    }

    @Override
    public int describeContents() {
        return 0;
    }

    @Override
    public void writeToParcel(Parcel dest, int flags) {
        dest.writeString(this.getAppInstance());
        dest.writeString(this.getStreamId());
        dest.writeString(this.getTitle());
        dest.writeString(this.getRoomId());
        dest.writeInt(this.getTotalStickers());
        dest.writeInt(this.getTotalViewers());
        dest.writeString(this.getDuration());
        dest.writeString(this.getDescription());
        dest.writeLong(this.getCreatedAt());
        dest.writeLong(this.getDeletedAt());
        dest.writeString(this.getOwner());
        dest.writeValue(this.getStreamer());
        dest.writeString(viewLink);
        dest.writeString(thumbnailLink);
    }

    @SuppressWarnings("unused")
    public static final Parcelable.Creator<WorldScopeViewStream> CREATOR = new Parcelable.Creator<WorldScopeViewStream>() {
        @Override
        public WorldScopeViewStream createFromParcel(Parcel in) {
            return new WorldScopeViewStream(in);
        }

        @Override
        public WorldScopeViewStream[] newArray(int size) {
            return new WorldScopeViewStream[size];
        }
    };
}