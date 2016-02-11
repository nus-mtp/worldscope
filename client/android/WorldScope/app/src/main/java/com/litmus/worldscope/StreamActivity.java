package com.litmus.worldscope;

import android.os.Bundle;
import android.support.v7.app.AppCompatActivity;
import android.util.Log;

import layout.StreamVideoFragment;

public class StreamActivity extends AppCompatActivity implements StreamVideoFragment.OnStreamVideoFragmentListener{

    private static final String TAG = "StreamActivity";
    private StreamVideoFragment.StreamVideoControls control;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_stream);

        Log.d(TAG, "Streamer activity created!");
    }

    @Override
    public void streamVideoFragmentReady(StreamVideoFragment.StreamVideoControls control) {
        this.control = control;
        control.startStreaming();
        Log.d(TAG, "Streamer ready!");
    }
}
