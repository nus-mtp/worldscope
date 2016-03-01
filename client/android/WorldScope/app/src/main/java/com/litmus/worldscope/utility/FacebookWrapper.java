package com.litmus.worldscope.utility;

import android.app.Activity;
import android.os.Bundle;
import android.support.v4.app.Fragment;
import android.content.Context;
import android.util.Log;

import com.facebook.AccessToken;
import com.facebook.CallbackManager;
import com.facebook.FacebookCallback;
import com.facebook.FacebookSdk;
import com.facebook.GraphRequest;
import com.facebook.GraphResponse;
import com.facebook.HttpMethod;
import com.facebook.login.LoginManager;
import com.facebook.login.LoginResult;

import org.json.JSONException;
import org.json.JSONObject;

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
    private String facebookUserId;
    private FacebookWrapperProfilePictureCallback facebookWrapperProfilePictureCallback;

    private boolean loadProfilePicture;

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

    public void setFacebookWrapperProfilePictureCallbackListener(FacebookWrapperProfilePictureCallback listener) {
        this.facebookWrapperProfilePictureCallback = listener;
    }

    public void getProfilePictureUrl() {

        if(facebookUserId == null) {
            loadProfilePicture = true;
            return;
        }

        Bundle facebookGraphParams = new Bundle();
        facebookGraphParams.putInt("height", 400);
        facebookGraphParams.putInt("width", 400);
        facebookGraphParams.putBoolean("redirect", false);
        /* make the API call */
        new GraphRequest(
                AccessToken.getCurrentAccessToken(),
                "/" + facebookUserId + "/picture",
                facebookGraphParams,
                HttpMethod.GET,
                new GraphRequest.Callback() {
                    public void onCompleted(GraphResponse response) {
                        /* handle the result */
                        try {
                            String profilePictureUrl = response.getJSONObject().getJSONObject("data").get("url").toString();
                            facebookWrapperProfilePictureCallback.onProfilePictureUrl(profilePictureUrl);
                        } catch (JSONException e) {
                            e.printStackTrace();
                        }
                    }
                }
        ).executeAsync();
    }

    public interface FacebookWrapperProfilePictureCallback {
        void onProfilePictureUrl(String profilePictureUrl);
    }

    public void getUserData() {

        Log.d(TAG, "Getting User data");
        GraphRequest.newMeRequest(
                AccessToken.getCurrentAccessToken(),
                new GraphRequest.GraphJSONObjectCallback() {
                    public void onCompleted(JSONObject object, GraphResponse response) {
                        /* handle the result */
                        try {
                            facebookUserId = object.getString("id");
                            Log.d(TAG, "Facebook User Id: " + facebookUserId);
                            // Check if profile picture is required
                            if(loadProfilePicture) {
                                getProfilePictureUrl();
                                loadProfilePicture = false;
                            }
                        } catch (JSONException e) {
                            e.printStackTrace();
                        }
                    }
                }).executeAsync();
    }

    private LoginManager getLoginManager() {
        if(loginManager == null) {
            loginManager = LoginManager.getInstance();
        }
        return loginManager;
    }

}