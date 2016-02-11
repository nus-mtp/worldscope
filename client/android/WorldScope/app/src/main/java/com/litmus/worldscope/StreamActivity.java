package com.litmus.worldscope;

import android.content.Intent;
import android.os.Bundle;
import android.support.v7.app.AppCompatActivity;
import android.util.Log;

import layout.StreamVideoFragment;

public class StreamActivity extends AppCompatActivity implements StreamVideoFragment.OnStreamVideoFragmentListener,
        StreamCreateFragment.OnStreamCreateFragmentListener {

    private static final String TAG = "StreamActivity";
    private StreamVideoFragment.StreamVideoControls control;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_stream);

        Log.d(TAG, "Streamer activity created!");
    }

    // Implement the callback for when streamVideoFragment is ready to stream
    @Override
    public void streamVideoFragmentReady(StreamVideoFragment.StreamVideoControls control) {
        this.control = control;
        Log.d(TAG, "Streamer ready!");
    }

    @Override
    public void onStreamCreationSuccess(String rtmpLink) {
        Log.d(TAG, rtmpLink);
    }

    @Override
    public void onCancelStreamButtonClicked() {
        redirectToMainActivity();
    }

    private void redirectToMainActivity() {
        Intent intent = new Intent(this, MainActivity.class);
        startActivity(intent);
    }
}
