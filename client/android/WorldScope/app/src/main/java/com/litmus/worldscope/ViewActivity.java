package com.litmus.worldscope;

import android.content.Context;
import android.os.Bundle;
import android.support.v7.app.AppCompatActivity;
import android.util.Log;
import android.view.GestureDetector;
import android.view.MotionEvent;
import android.widget.Toast;

import com.litmus.worldscope.model.WorldScopeViewStream;
import com.litmus.worldscope.utility.WorldScopeAPIService;
import com.litmus.worldscope.utility.WorldScopeRestAPI;

import fragment.CommentFragment;
import fragment.TitleFragment;
import fragment.ViewVideoControlFragment;
import fragment.ViewVideoFragment;
import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class ViewActivity extends AppCompatActivity implements
        ViewVideoFragment.OnViewVideoFragmentInteractionListener,
        ViewVideoControlFragment.OnViewVideoControlFragmentListener,
        CommentFragment.OnCommentFragmentInteractionListener,
        TitleFragment.OnTitleFragmentToggleButtonListener {

    private final String TAG = "ViewActivity";
    private final boolean IS_OWNER = true;
    private final boolean IS_FOLLOWING = true;

    // Stream currently viewing
    private WorldScopeViewStream viewStream;
    // String of mpd link
    private String mpdLink;
    private android.support.v4.app.FragmentManager sfm;
    private ViewVideoFragment viewVideoFragment;
    private ViewVideoControlFragment viewVideoControlFragment;
    private CommentFragment commentFragment;
    private TitleFragment titleFragment;
    private GestureDetector gestureDetector;
    private Context context;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_view);

        context = this;

        // Create GestureDetector
        gestureDetector = new GestureDetector(this, new GestureListener());

        // Get mpdLink
        viewStream = getIntent().getParcelableExtra("stream");

        Log.d(TAG, viewStream.toString());

        mpdLink = viewStream.getViewLink();
        sfm = getSupportFragmentManager();

        // Get viewVideoFragment and viewVideoControlFragment
        viewVideoFragment = (ViewVideoFragment) sfm.findFragmentById(R.id.viewVideoFragment);
        viewVideoControlFragment = (ViewVideoControlFragment) sfm.findFragmentById(R.id.viewVideoControlFragment);

        // Get commentFragment
        commentFragment = (CommentFragment) sfm.findFragmentById(R.id.commentFragment);

        // Get titleFragment
        titleFragment = (TitleFragment) sfm.findFragmentById(R.id.titleFragment);

        // Join room and show comment UI
        Log.d(TAG, viewStream.toString());
        commentFragment.setupRoom(viewStream.getAppInstance(), viewStream.getStreamId(), getIntent().getStringExtra("alias"));
        commentFragment.initialize();

        // Show titlebar
        titleFragment.loadStreamDetails(isCreator(), viewStream.getStreamer().getIsSubscribed(), viewStream.getStreamer().getPlatformId(),
                viewStream.getStreamer().getAlias(), viewStream.getTitle());

        titleFragment.showTitleUI();

        Log.d(TAG, "Room: " + viewStream.toString());

        Log.d(TAG, "Joining room: " + viewStream.getAppInstance());

        Log.d(TAG, "Link to watch: " + mpdLink);
    }

    @Override
    public void onViewVideoFragmentReady() {
        // Sets the .mpd link
        viewVideoFragment.setMPDLink(mpdLink);
    }

    @Override
    public void onViewPauseButtonPress() {
        viewVideoFragment.togglePause();
    }

    // Detect double tap
    @Override
    public boolean onTouchEvent(MotionEvent event) {
        return gestureDetector.onTouchEvent(event);
    }

    // Override to intercept all touch events, required as listView was consuming touch events
    @Override
    public boolean dispatchTouchEvent(MotionEvent event) {
        gestureDetector.onTouchEvent(event);
        return super.dispatchTouchEvent(event);
    }

    // Gesture Listener to listen for double taps
    private class GestureListener extends GestureDetector.SimpleOnGestureListener {

        @Override
        public boolean onDown(MotionEvent e) {
            return true;
        }

        @Override
        public boolean onDoubleTap(MotionEvent e) {
            // On Double Tap, calls the video control fragment back into view if hidden
            Log.d(TAG, "Double Tap detected, showing controls");
            viewVideoControlFragment.toggleControlVisibility();
            return true;
        }
    }

    // For CommentFragment TODO: Update
    @Override
    public void onFragmentInteraction() {

    }

    // For TitleFragment
    @Override
    public void onToggleButtonClicked() {
        // Optimistic UI, toggle first, talk later
        titleFragment.changeFollowButtonState(!viewStream.getStreamer().getIsSubscribed());
        if(viewStream.getStreamer().getIsSubscribed()) {
            unFollowStreamer(viewStream.getStreamer().getUserId());
        } else {
            followStreamer(viewStream.getStreamer().getUserId());
        }
    }

    private void followStreamer(String userId) {
        // Instantiate an instance of the call with the parameters
        Call<Object> call = new WorldScopeRestAPI(context)
                .buildWorldScopeAPIService()
                .postSubscribe(userId);

        // Make call to create stream
        call.enqueue(new Callback<Object>() {
            @Override
            public void onResponse(Response<Object> response) {
                if (response.isSuccess()) {
                    Log.d(TAG, "Success: " + response.body().toString());
                    Toast toast = Toast.makeText(context, "You followed " + viewStream.getStreamer().getAlias() + "!", Toast.LENGTH_SHORT);
                    toast.show();
                    viewStream.getStreamer().setIsSubscribed(IS_FOLLOWING);
                    titleFragment.changeFollowButtonState(IS_FOLLOWING);
                } else {
                    Log.d(TAG, "Failure: " + response.code() + ": " + response.message());
                    Toast toast = Toast.makeText(context, "Oops! Please try to follow " + viewStream.getStreamer().getAlias() + " later!", Toast.LENGTH_SHORT);
                    toast.show();
                    viewStream.getStreamer().setIsSubscribed(!IS_FOLLOWING);
                    titleFragment.changeFollowButtonState(!IS_FOLLOWING);
                }
            }

            @Override
            public void onFailure(Throwable t) {
                Log.d(TAG, "Failure: " + t.getMessage());
                Toast toast = Toast.makeText(context, "Oops! Please try to follow " + viewStream.getStreamer().getAlias() + " later!", Toast.LENGTH_SHORT);
                toast.show();
                viewStream.getStreamer().setIsSubscribed(!IS_FOLLOWING);
                titleFragment.changeFollowButtonState(!IS_FOLLOWING);
            }
        });
    }

    private void unFollowStreamer(String userId) {
        // Instantiate an instance of the call with the parameters
        Call<Object> call = new WorldScopeRestAPI(context)
                .buildWorldScopeAPIService()
                .deleteSubscribe(userId);

        // Make call to create stream
        call.enqueue(new Callback<Object>() {
            @Override
            public void onResponse(Response<Object> response) {
                if (response.isSuccess()) {
                    Log.d(TAG, "Success: " + response.body().toString());
                    Toast toast = Toast.makeText(context, "You have unfollowed " + viewStream.getStreamer().getAlias() + "!", Toast.LENGTH_SHORT);
                    toast.show();
                    viewStream.getStreamer().setIsSubscribed(!IS_FOLLOWING);
                    titleFragment.changeFollowButtonState(!IS_FOLLOWING);
                } else {
                    Log.d(TAG, "Failure: " + response.code() + ": " + response.message());
                    Toast toast = Toast.makeText(context, "Oops! Please try to unfollow " + viewStream.getStreamer().getAlias() + " later!", Toast.LENGTH_SHORT);
                    toast.show();
                    viewStream.getStreamer().setIsSubscribed(IS_FOLLOWING);
                    titleFragment.changeFollowButtonState(IS_FOLLOWING);
                }
            }

            @Override
            public void onFailure(Throwable t) {
                Log.d(TAG, "Failure: " + t.getMessage());
                Toast toast = Toast.makeText(context, "Oops! Please try to unfollow " + viewStream.getStreamer().getAlias() + " later!", Toast.LENGTH_SHORT);
                toast.show();
                viewStream.getStreamer().setIsSubscribed(IS_FOLLOWING);
                titleFragment.changeFollowButtonState(IS_FOLLOWING);
            }
        });
    }

    private boolean isCreator() {
        if(WorldScopeAPIService.getUser() == null || WorldScopeAPIService.getUser().getUserId() == null) {
            Log.d(TAG, "No user found");
            return !IS_OWNER;
        } else if(WorldScopeAPIService.getUser().getUserId().equals(viewStream.getStreamer().getUserId())){
            Log.d(TAG, "Is owner");
            return IS_OWNER;
        } else {
            Log.d(TAG, "Not owner");
            return !IS_OWNER;
        }
    }
}