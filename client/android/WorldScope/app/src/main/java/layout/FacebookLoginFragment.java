package layout;

import android.content.Context;
import android.content.Intent;
import android.os.Bundle;
import android.support.v4.app.Fragment;
import android.util.Log;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;

import com.facebook.AccessToken;
import com.facebook.CallbackManager;
import com.facebook.FacebookCallback;
import com.facebook.FacebookException;
import com.facebook.login.LoginResult;
import com.facebook.login.widget.LoginButton;
import com.litmus.worldscope.FacebookWrapper;
import com.litmus.worldscope.R;

/**
 * FacebookLoginFragment - Contains Facebook login button
 *
 * Activities that contain this fragment must implement the
 * {@link FacebookLoginFragment.OnFragmentInteractionListener} interface
 * to handle interaction events.
 */
public class FacebookLoginFragment extends Fragment {

    private final String TAG = "FacebookLoginFragment";
    private final String ERROR_IMPLEMENT_ON_FRAGMENT_INTERACTION_LISTENER = " must implement OnFragmentInteractionListener";
    private final String EXTRA_IS_ATTEMPT_LOGOUT = "isAttemptLogout";

    private FacebookWrapper facebookWrapper = FacebookWrapper.getInstance();
    private OnFragmentInteractionListener mListener;
    private View view;
    private CallbackManager callbackManager;
    private FacebookCallback<LoginResult> facebookCallback;
    private Context context;
    private LoginButton loginButton;

    public FacebookLoginFragment() {
        // Required empty public constructor
    }

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        // Initiate Facebook SDK
        facebookWrapper.initializeFacebookSDK(context);
        facebookWrapper.setFragment(this);
    }

    @Override
    public View onCreateView(LayoutInflater inflater, ViewGroup container,
                             Bundle savedInstanceState) {

        inflateFacebookLoginButton(inflater, container);
        setUpLoginButton(view);
        createLoginCallback();
        setLoginCallback();
        tryInitialLogin();

        return view;
    }

    @Override
    public void onAttach(Context context) {
        super.onAttach(context);
        this.context = context;
        if (context instanceof OnFragmentInteractionListener) {
            mListener = (OnFragmentInteractionListener) context;
        } else {
            throw new RuntimeException(context.toString()
                    + ERROR_IMPLEMENT_ON_FRAGMENT_INTERACTION_LISTENER );
        }
    }

    @Override
    public void onDetach() {
        super.onDetach();
        mListener = null;
    }

    @Override
    public void onActivityResult(int requestCode, int resultCode, Intent data) {
        super.onActivityResult(requestCode, resultCode, data);
        callbackManager.onActivityResult(requestCode, resultCode, data);
    }

    public void logoutFromFacebook() {
        facebookWrapper.logout();
    }

    private void inflateFacebookLoginButton(LayoutInflater inflater, ViewGroup container) {
        // Inflate the layout for this fragment
        view = inflater.inflate(R.layout.fragment_facebook_login, container, false);
    }

    private void setUpLoginButton(View view) {
        // Get login button from XML and set permissions
        loginButton = (LoginButton) view.findViewById(R.id.facebook_login_button);
        loginButton.setReadPermissions(facebookWrapper.getFacebookPermission());
        // Set Fragment of loginButton because loginButton is implemented in Fragment
        loginButton.setFragment(this);
    }

    private void createLoginCallback() {
        // Instantiate callbackManager and callback required to perform actions upon login attempts
        callbackManager = CallbackManager.Factory.create();
        facebookCallback = new FacebookCallback<LoginResult>() {

            @Override
            public void onSuccess(LoginResult loginResult) {
                // Get Facebook User's data
                facebookWrapper.getUserData();
                // Pass accessToken back to FacebookLoginActivity via Interface
                mListener.onFacebookLoginSuccess(loginResult.getAccessToken());
            }

            @Override
            public void onCancel() {
                Log.d(TAG, "Login cancelled!");
            }

            @Override
            public void onError(FacebookException exception) {
                Log.d(TAG, "Error logging in!");
            }
        };
    }

    private void tryInitialLogin() {

        // If user did not previously logout, check if login. Else, logout of facebook
        if(!getActivity().getIntent().getBooleanExtra(EXTRA_IS_ATTEMPT_LOGOUT, false)) {
            facebookWrapper.login();
        } else {
            facebookWrapper.logout();
        }
    }

    private void setLoginCallback() {
        // Register callbacks into Facebook Login button and Login manager
        loginButton.registerCallback(callbackManager, facebookCallback);
        facebookWrapper.setFacebookCallback(callbackManager, facebookCallback);
    }


    /**
     * This interface must be implemented by activities that contain this
     * fragment to allow an interaction in this fragment to be communicated
     * to the activity and potentially other fragments contained in that
     * activity.
     */
    public interface OnFragmentInteractionListener {
        void onFacebookLoginSuccess(AccessToken accessToken);
    }
}
