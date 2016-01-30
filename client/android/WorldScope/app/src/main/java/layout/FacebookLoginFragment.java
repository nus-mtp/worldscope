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
import com.facebook.FacebookSdk;
import com.facebook.login.LoginManager;
import com.facebook.login.LoginResult;
import com.facebook.login.widget.LoginButton;
import com.litmus.worldscope.R;

import java.util.Arrays;

/**
 * A simple {@link Fragment} subclass.
 * Activities that contain this fragment must implement the
 * {@link FacebookLoginFragment.OnFragmentInteractionListener} interface
 * to handle interaction events.
 * Use the {@link FacebookLoginFragment#newInstance} factory method to
 * create an instance of this fragment.
 */
public class FacebookLoginFragment extends Fragment {

    private final String TAG = "FacebookLoginFragment";
    private final String PUBLIC_PROFILE_PERMISSION = "public_profile";
    private final String USER_FRIENDS_PERMISSION = "user_friends";
    private final String ERROR_IMPLEMENT_ON_FRAGMENT_INTERACTION_LISTENER = " must implement OnFragmentInteractionListener";
    private final String EXTRA_IS_ATTEMPT_LOGOUT = "isAttemptLogout";

    private OnFragmentInteractionListener mListener;
    private CallbackManager callbackManager;
    private Context context;
    private LoginManager loginManager;
    private LoginButton loginButton;
    public FacebookLoginFragment() {
        // Required empty public constructor
    }

    /**
     * Use this factory method to create a new instance of
     * this fragment using the provided parameters.
     *
     * @return A new instance of fragment FacebookLoginFragment.
     */

    public static FacebookLoginFragment newInstance() {
        FacebookLoginFragment fragment = new FacebookLoginFragment();
        Bundle args = new Bundle();
        return fragment;
    }

    public void logoutFromFacebook() {
        if(loginManager == null) {
            loginManager = LoginManager.getInstance();
        }

        Log.d(TAG, "Logging out of Facebook: " + loginManager);
        loginManager.logOut();
    }

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        // Initiate Facebook SDK
        FacebookSdk.sdkInitialize(this.getActivity());
    }

    @Override
    public View onCreateView(LayoutInflater inflater, ViewGroup container,
                             Bundle savedInstanceState) {
        // Inflate the layout for this fragment
        View view = inflater.inflate(R.layout.fragment_facebook_login, container, false);

        // Get login button from XML and set permissions
        loginButton = (LoginButton) view.findViewById(R.id.facebook_login_button);
        loginButton.setReadPermissions(PUBLIC_PROFILE_PERMISSION, USER_FRIENDS_PERMISSION);

        // Set Fragment of loginButton because loginButton is implemented in Fragment
        loginButton.setFragment(this);

        // Instantiate callbackManager and callback required to perform actions upon login attempts
        callbackManager = CallbackManager.Factory.create();
        FacebookCallback<LoginResult> facebookCallback = new FacebookCallback<LoginResult>() {

            @Override
            public void onSuccess(LoginResult loginResult) {
                // Pass accessToken back to FacebookLoginActivity via Interface
                ((OnFragmentInteractionListener)context).onFacebookLoginSuccess(loginResult.getAccessToken());
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

        // Register callbacks into Facebook Login button and Login manager
        loginButton.registerCallback(callbackManager, facebookCallback);
        loginManager = LoginManager.getInstance();
        loginManager.registerCallback(callbackManager, facebookCallback);

        // If user did not previously logout, check if login. Else, logout of facebook
        if(!getActivity().getIntent().getBooleanExtra(EXTRA_IS_ATTEMPT_LOGOUT , false)) {
            loginManager.logInWithReadPermissions(this, Arrays.asList(PUBLIC_PROFILE_PERMISSION, USER_FRIENDS_PERMISSION));
        } else {
            logoutFromFacebook();
        }

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
