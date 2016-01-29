package com.litmus.worldscope;

import android.content.Context;
import android.content.Intent;
import android.os.Bundle;
import android.support.v7.app.AppCompatActivity;
import android.util.Log;
import android.widget.Toast;

import com.facebook.AccessToken;
import com.litmus.worldscope.model.WorldScopeUser;

import layout.FacebookLoginFragment;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class FacebookLoginActivity extends AppCompatActivity implements FacebookLoginFragment.OnFragmentInteractionListener {

    private static final String TAG = "FacebookLoginActivity";
    private static final String APP_SERVER_AUTH_FAILED_MSG = "Authentication with WorldScope's server has failed, please check that you have internet connections and try again.";
    private static Context context;
    private FacebookLoginFragment facebookLoginFragment;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_facebook_login);
        context = this;

    }

    @Override
    public void onFacebookLoginSuccess(AccessToken accessToken) {
        // Successful login -> Redirect to main activity
        Log.d(TAG, "Login Success!");
        Log.d(TAG, "AccessToken: " + accessToken.getToken());

        // Instantiate and make a call to login user into WorldScope servers
        Call<WorldScopeUser> call = WorldScopeRestAPI.buildWorldScopeAPIService().loginUser(new WorldScopeAPIService.LoginUserRequest(accessToken.getToken()));
        call.enqueue(new Callback<WorldScopeUser>() {
            @Override
            public void onResponse(Response<WorldScopeUser> response) {
                if (response.isSuccess()) {
                    Log.d(TAG, "Success!");
                    Log.d(TAG, "" + response.body().toString());

                    // Redirect to MainActivty if successful
                    Intent intent = new Intent(context, MainActivity.class);
                    intent.putExtra("loginUser", response.body());
                    startActivity(intent);
                } else {
                    Log.d(TAG, "Failure" + response.code() + ": " + response.body().toString());
                    // Logout of Facebook
                    logoutOfFacebook();
                }
            }

            @Override
            public void onFailure(Throwable t) {
                Log.d(TAG, "Failure: " + t.getMessage());
                // Logout of Facebook
                logoutOfFacebook();
            }
        });

    }

    // Called to logout of Facebook when attempt to authenticate with App server fails
    private void logoutOfFacebook() {
        if(facebookLoginFragment == null) {
            // Get FacebookLoginFragment if missing
            facebookLoginFragment = (FacebookLoginFragment) getSupportFragmentManager().findFragmentById(R.id.facebookLoginButtonFragment);
        }

        // Toast to inform user
        Toast toast = Toast.makeText(context, APP_SERVER_AUTH_FAILED_MSG, Toast.LENGTH_LONG);
        toast.show();
        facebookLoginFragment.logoutFromFacebook();

    }
}
