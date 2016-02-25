package com.litmus.worldscope;

import android.app.Activity;
import android.support.v4.app.Fragment;
import android.content.Context;
import android.util.Log;

import com.facebook.CallbackManager;
import com.facebook.FacebookCallback;
import com.facebook.FacebookSdk;
import com.facebook.login.LoginManager;
import com.facebook.login.LoginResult;

import java.util.Arrays;
import java.util.List;

/**
 * Wrapper for Facebook API
 */
public class FacebookWrapper extends SocialMediaWrapper {

    private static final String TAG = "FacebookWrapper";
    private final String PUBLIC_PROFILE_PERMISSION = "public_profile";
    private final String USER_FRIENDS_PERMISSION = "user_friends";

    private Activity activity;
    private Fragment fragment;
    private static FacebookWrapper instance;
    private LoginManager loginManager;

    protected FacebookWrapper(){
        // Empty constructor
    }

    public static FacebookWrapper getInstance() {
        if(instance == null) {
            instance = new FacebookWrapper();
        }
        return instance;
    }

    // Called before everything else to initialize Facebook
    public void initializeFacebookSDK(Context context) {
        FacebookSdk.sdkInitialize(context);
    }

    public void setActivity(Activity activity) {
        this.activity = activity;
    }

    public void setFragment(Fragment fragment) {
        this.fragment = fragment;
    }

    /* Login function, must set context using either setActivity or setFragment
     * and set callback first using 'setFacebookCallback'
     */
    public void login() {
        if(activity != null) {
            getLoginManager().logInWithReadPermissions(activity, getFacebookPermission());
        } else if (fragment != null) {
            getLoginManager().logInWithReadPermissions(fragment, getFacebookPermission());
        }
    }

    public void logout() {
        Log.d(TAG, "Logging out of Facebook: " + loginManager);
        getLoginManager().logOut();
    }

    public List<String> getFacebookPermission() {
        return Arrays.asList(PUBLIC_PROFILE_PERMISSION, USER_FRIENDS_PERMISSION);
    }

    public void setFacebookCallback(CallbackManager callbackManager, FacebookCallback<LoginResult> facebookCallback) {
        getLoginManager().registerCallback(callbackManager, facebookCallback);
    }


    public void getProfilePictureUrl() {

    }

    public interface FacebookWrapperProfilePictureCallback {
        void onProfilePicture(String profilePictureUrl);
    }

    private LoginManager getLoginManager() {
        if(loginManager == null) {
            loginManager = LoginManager.getInstance();
        }
        return loginManager;
    }

}
