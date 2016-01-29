package com.litmus.worldscope;

import android.os.Parcel;
import android.os.Parcelable;

/**
 * Implementation of WorldScope User with information detailed in API
 * Implements Parcelable to easily pass WorldScopeUser object in intents
 * Created by kylel on 21/1/2016.
 */
public class WorldScopeUser implements Parcelable {

    private String userId;
    private String platformType;
    private String platformId;
    private String alias;
    private String email;
    private String description;
    private String location;
    private String permissions;
    private String createdAt;
    private String updatedAt;
    private String deletedAt;
    private String userName;

    public String getUserId() {return userId;}
    public String getPlatformType() {return platformType;}
    public String getPlatformId() {return platformId;}
    public String getAlias() {return alias;}
    public String getEmail() {return email;}
    public String getDescription() {return description;}
    public String getLocation() {return location;}
    public String getPermissions() {return permissions;}
    public String getCreatedAt() {return createdAt;}
    public String getUpdatedAt() {return updatedAt;}
    public String getDeletedAt() {return deletedAt;}
    public String getuserName() {return userName;}

    public void setUserId(String userId) {this.userId = userId;}
    public void setPlatformType(String platformType) {this.platformType = platformType;}
    public void setPlatformId(String platformId) {this.platformId = platformId;}
    public void setAlias(String alias) {this.alias = alias;}
    public void setEmail(String email) {this.email = email;}
    public void setDescription(String description) {this.description = description;}
    public void setLocation(String location) {this.location = location;}
    public void setPermissions(String permissions) {this.permissions = permissions;}
    public void setCreatedAt(String createdAt) {this.createdAt = createdAt;}

    public void setUpdatedAt(String updatedAt) {this.updatedAt = updatedAt;}
    public void setDeletedAt(String deletedAt) {this.deletedAt = deletedAt;}
    public void setuserName(String userName) {this.userName = userName;}

    @Override
    public String toString() {
        return this.getUserId() + " " + this.getPlatformType() + " " + this.getPlatformId() + " "
                + this.getAlias() + " " + this.getEmail() + " " + this.getDescription() + " "
                + this.getLocation() + " " + this.getPermissions() + " " + this.getCreatedAt() + " "
                + this.getUpdatedAt() + " " + this.getDeletedAt() + " " + this.getuserName();
    }


    protected WorldScopeUser(Parcel in) {
        userId = in.readString();
        platformType = in.readString();
        platformId = in.readString();
        alias = in.readString();
        email = in.readString();
        description = in.readString();
        location = in.readString();
        permissions = in.readString();
        createdAt = in.readString();
        updatedAt = in.readString();
        deletedAt = in.readString();
        userName = in.readString();
    }

    @Override
    public int describeContents() {
        return 0;
    }

    @Override
    public void writeToParcel(Parcel dest, int flags) {
        dest.writeString(userId);
        dest.writeString(platformType);
        dest.writeString(platformId);
        dest.writeString(alias);
        dest.writeString(email);
        dest.writeString(description);
        dest.writeString(location);
        dest.writeString(permissions);
        dest.writeString(createdAt);
        dest.writeString(updatedAt);
        dest.writeString(deletedAt);
        dest.writeString(userName);
    }

    @SuppressWarnings("unused")
    public static final Parcelable.Creator<WorldScopeUser> CREATOR = new Parcelable.Creator<WorldScopeUser>() {
        @Override
        public WorldScopeUser createFromParcel(Parcel in) {
            return new WorldScopeUser(in);
        }

        @Override
        public WorldScopeUser[] newArray(int size) {
            return new WorldScopeUser[size];
        }
    };
}