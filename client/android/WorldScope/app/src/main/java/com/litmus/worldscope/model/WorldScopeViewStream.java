package com.litmus.worldscope.model;

import android.os.Parcel;
import android.os.Parcelable;
import android.util.Log;

/**
 * Stream object model returned from WorldScope App Server for viewing of streams
 */
public class WorldScopeViewStream extends WorldScopeStream implements Parcelable {
    private String TAG = "WorldScopeViewStream";

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
        viewLink = in.readString();
        thumbnailLink = in.readString();
    }

    @Override
    public int describeContents() {
        return 0;
    }

    @Override
    public void writeToParcel(Parcel dest, int flags) {
        Log.d(TAG, this.toString());
        dest.writeString(this.getAppInstance());
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