package com.litmus.worldscope;

import android.content.Intent;
import android.os.Bundle;
import android.support.v7.app.AppCompatActivity;
import android.util.Log;
import android.view.MotionEvent;
import android.view.View;

import layout.StreamVideoControlFragment;
import layout.StreamVideoFragment;

public class StreamActivity extends AppCompatActivity implements StreamVideoFragment.OnStreamVideoFragmentListener,
        StreamCreateFragment.OnStreamCreateFragmentListener,
        StreamVideoControlFragment.OnStreamVideoControlFragmentListener{

    private static final String TAG = "StreamActivity";
    private StreamVideoFragment.StreamVideoControls control;
    private StreamCreateFragment streamCreateFragment;
    private StreamVideoControlFragment streamVideoControlFragment;
    private android.support.v4.app.FragmentManager sfm;
    private boolean streamWhenReady = false;
    private boolean isRecording = false;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_stream);
        sfm = getSupportFragmentManager();

        // Get streamCreateFragment
        streamCreateFragment = (StreamCreateFragment) sfm.findFragmentById(R.id.streamCreateFragment);
        // Get streamVideoControlFragment
        streamVideoControlFragment = (StreamVideoControlFragment) sfm.findFragmentById(R.id.streamVideoControlFragment);

        Log.d(TAG, "Streamer activity created!");
    }

    @Override
    public boolean onTouchEvent(MotionEvent event) {
        // On touch, calls the video control fragment back into view if hidden
        Log.d(TAG, "Touch detected, showing controls");
        streamVideoControlFragment.restartHideButtonTimerTask();
        return true;
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
    public void onStreamCreationSuccess(String rtmpLink) {
        Log.d(TAG, rtmpLink);

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
}
