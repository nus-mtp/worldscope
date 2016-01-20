package com.litmus.worldscope;

import android.support.v4.app.FragmentActivity;
import android.os.Bundle;
import android.util.Log;

import com.facebook.AccessToken;

import layout.FacebookLoginFragment;

public class FacebookLoginActivity extends FragmentActivity implements FacebookLoginFragment.OnFragmentInteractionListener {

    private static final String TAG = "FacebookLoginActivity";

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_facebook_login);
    }

    @Override
    public void onFacebookLoginSuccess(AccessToken accessToken) {
        //TODO: Redirect to MainActivity
        Log.d(TAG, "Login Sucess!");
        Log.d(TAG, "AccessToken: " + accessToken.getToken());
    }
}
