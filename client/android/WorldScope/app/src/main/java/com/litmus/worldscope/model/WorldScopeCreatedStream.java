package com.litmus.worldscope.model;

import android.os.Parcel;
import android.os.Parcelable;

/**
 * Stream object returned from WorldScope App Server when creating a new stream
 */
public class WorldScopeCreatedStream extends WorldScopeStream implements Parcelable {

    private long endedAt;
    private String streamLink;

    public long getEndedAt() {return endedAt;}
    public String getStreamLink() {return streamLink;}

    public void setEndedAt(long endedAt) {this.endedAt = endedAt;}
    public void setStreamLink(String streamLink) {this.streamLink = streamLink;}

    protected WorldScopeCreatedStream(Parcel in) {
        endedAt = in.readLong();
        streamLink = in.readString();
    }

    @Override
    public int describeContents() {
        return 0;
    }

    @Override
    public void writeToParcel(Parcel dest, int flags) {
        dest.writeLong(endedAt);
        dest.writeString(streamLink);
    }

    @SuppressWarnings("unused")
    public static final Parcelable.Creator<WorldScopeCreatedStream> CREATOR = new Parcelable.Creator<WorldScopeCreatedStream>() {
        @Override
        public WorldScopeCreatedStream createFromParcel(Parcel in) {
            return new WorldScopeCreatedStream(in);
        }

        @Override
        public WorldScopeCreatedStream[] newArray(int size) {
            return new WorldScopeCreatedStream[size];
        }
    };
}