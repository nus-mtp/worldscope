package com.litmus.worldscope;

/**
 * Wrapper class for interfacing with Facebook API
 */
public abstract class SocialMediaWrapper {

    // These methods must be implemented by any form of social media that WorldScope uses
    abstract void login();
    abstract void logout();
    abstract void getProfilePictureUrl();
}
