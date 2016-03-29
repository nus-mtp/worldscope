package com.litmus.worldscope;

import android.content.Intent;
import android.os.Bundle;
import android.preference.PreferenceManager;
import android.support.v7.app.AppCompatActivity;
import android.util.Log;
import android.view.GestureDetector;
import android.view.KeyEvent;
import android.view.MotionEvent;

import com.litmus.worldscope.model.WorldScopeCreatedStream;

import fragment.CommentFragment;
import fragment.StreamCreateFragment;
import fragment.StreamVideoControlFragment;
import fragment.StreamVideoFragment;
import fragment.TitleFragment;

public class StreamActivity extends AppCompatActivity implements StreamVideoFragment.OnStreamVideoFragmentListener,
        StreamCreateFragment.OnStreamCreateFragmentListener,
        StreamVideoControlFragment.OnStreamVideoControlFragmentListener,
        CommentFragment.OnCommentFragmentInteractionListener,
        TitleFragment.OnTitleFragmentToggleButtonListener {

    private static final String TAG = "StreamActivity";
    private static final boolean IS_STREAMER = true;
    private String streamWhenReadyTag = "streamWhenReady";
    private String isRecordingTag = "isRecordingTag";
    private String alias;
    private String rtmpLink;
    private StreamVideoFragment.StreamVideoControls control;
    private StreamCreateFragment streamCreateFragment;
    private StreamVideoControlFragment streamVideoControlFragment;
    private CommentFragment commentFragment;
    private TitleFragment titleFragment;
    private android.support.v4.app.FragmentManager sfm;
    private boolean streamWhenReady = false;
    private boolean isRecording = false;
    private GestureDetector gestureDetector;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        if(savedInstanceState != null) {
            savedInstanceState.getBoolean(streamWhenReadyTag);
            savedInstanceState.getBoolean(isRecordingTag);
        }

        alias = getIntent().getStringExtra("alias");

        setContentView(R.layout.activity_stream);
        sfm = getSupportFragmentManager();

        // Create GestureDetector
        gestureDetector = new GestureDetector(this, new GestureListener());

        // Get streamCreateFragment
        streamCreateFragment = (StreamCreateFragment) sfm.findFragmentById(R.id.streamCreateFragment);
        // Get streamVideoControlFragment
        streamVideoControlFragment = (StreamVideoControlFragment) sfm.findFragmentById(R.id.streamVideoControlFragment);
        // Get commentFragment
        commentFragment = (CommentFragment) sfm.findFragmentById(R.id.commentFragment);
        // Get titleFragment
        titleFragment = (TitleFragment) sfm.findFragmentById(R.id.titleFragment);

        Log.d(TAG, "Streamer activity created!");
    }

    @Override
    public void onSaveInstanceState(Bundle outState) {
        super.onSaveInstanceState(outState);
        outState.putBoolean(streamWhenReadyTag, streamWhenReady);
        outState.putBoolean(isRecordingTag , isRecording);
    }

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


    /**
     * Implementing StreamVideoFragment
     */
    @Override
    public void streamVideoFragmentReady(StreamVideoFragment.StreamVideoControls control) {
        this.control = control;
        Log.d(TAG, "Streamer ready!");
        if(streamWhenReady) {
            control.startStreaming();
        }
    }

    /**
     * Implementing StreamCreateFragment
     */

    @Override
    public void onStreamCreationSuccess(WorldScopeCreatedStream stream) {
        this.rtmpLink = stream.getStreamLink();

        this.rtmpLink = rtmpLink;
        // Find streamVideoFragment and set the rtmp link from streamCreateFragment
        StreamVideoFragment streamVideoFragment = (StreamVideoFragment) sfm.findFragmentById(R.id.streamVideoFragment);
        streamVideoFragment.setRTMPLink(rtmpLink);

        // If control is ready, start streaming, else stream when ready
        if(control != null) {
            isRecording = true;
            control.startStreaming();
        } else {
            streamWhenReady = true;
        }

        // Start the streamVideoControls
        streamVideoControlFragment.startStreaming();

        // Join room and show comment UI
        commentFragment.setupRoom(stream.getAppInstance(), stream.getStreamId(), alias);
        commentFragment.initialize();

        // Show titlebar
        titleFragment.loadStreamDetails(IS_STREAMER, stream.getStreamer().getIsSubscribed(), stream.getStreamer().getPlatformId(),
                stream.getStreamer().getAlias(), stream.getTitle());

        titleFragment.showTitleUI();
    }

    @Override
    public void onCancelStreamButtonClicked() {
        control.destroyStreamer();

        redirectToMainActivity();
    }


    @Override
    public void onStreamTerminationResolved(boolean isTerminated) {
        if(isTerminated) {
            redirectToMainActivity();
        } else {
            // Release the controls back
            streamVideoControlFragment.unBlockControls();
        }
    }

    /**
     * Implementing StreamVideoControlFragment
     */

    @Override
    public void onStreamRecordButtonShortPress() {
        // Signal to StreamVideoFragment to pause the stream
        if(isRecording) {
            control.stopStreaming();
        } else {
            control.startStreaming();
        }

        // Toggle the isRecording boolean
        isRecording = !isRecording;
    }

    @Override
    public void onStreamRecordButtonLongPress() {
        // Signal to StreamCreateFragment to do a confirmation and stop stream
        streamCreateFragment.confirmStreamTermination();
    }

    private void redirectToMainActivity() {
        Intent intent = new Intent(this, MainActivity.class);
        startActivity(intent);
    }

    @Override
    public boolean onKeyDown(int keyCode, KeyEvent event)  {
        if (keyCode == KeyEvent.KEYCODE_BACK && event.getRepeatCount() == 0 && isRecording) {
            streamCreateFragment.confirmStreamTermination();
            return true;
        }

        return super.onKeyDown(keyCode, event);
    }

    // For CommentFragment
    // TODO: Update
    @Override
    public void onFragmentInteraction() {

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
            streamVideoControlFragment.toggleControlVisibility();
            return true;
        }
    }

    @Override
    public void onToggleButtonClicked() {
        control.toggleCamera();
    }
}
