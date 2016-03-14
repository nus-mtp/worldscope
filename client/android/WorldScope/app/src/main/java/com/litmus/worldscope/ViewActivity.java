package com.litmus.worldscope;

import android.os.Bundle;
import android.support.v7.app.AppCompatActivity;
import android.util.Log;
import android.view.GestureDetector;
import android.view.MotionEvent;

import com.litmus.worldscope.model.WorldScopeViewStream;
import com.litmus.worldscope.utility.WorldScopeAPIService;

import fragment.CommentFragment;
import fragment.ViewVideoControlFragment;
import fragment.ViewVideoFragment;

public class ViewActivity extends AppCompatActivity implements
        ViewVideoFragment.OnViewVideoFragmentInteractionListener,
        ViewVideoControlFragment.OnViewVideoControlFragmentListener,
        CommentFragment.OnCommentFragmentInteractionListener{

    private final String TAG = "ViewActivity";

    // Stream currently viewing
    private WorldScopeViewStream viewStream;
    // String of mpd link
    private String mpdLink;
    private android.support.v4.app.FragmentManager sfm;
    private ViewVideoFragment viewVideoFragment;
    private ViewVideoControlFragment viewVideoControlFragment;
    private CommentFragment commentFragment;
    private GestureDetector gestureDetector;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_view);

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

        // Join room
        // Join room and show comment UI
        commentFragment.joinRoom(viewStream.getAppInstance(), getIntent().getStringExtra("alias"));
        commentFragment.initialize();

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
}
