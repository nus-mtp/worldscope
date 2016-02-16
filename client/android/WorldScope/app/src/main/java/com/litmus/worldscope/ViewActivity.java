package com.litmus.worldscope;

import android.content.Context;
import android.support.design.widget.FloatingActionButton;
import android.support.v4.content.ContextCompat;
import android.support.v7.app.AppCompatActivity;
import android.os.Bundle;
import android.util.Log;
import android.view.SurfaceHolder;
import android.view.SurfaceView;
import android.view.View;

import com.google.android.exoplayer.AspectRatioFrameLayout;
import com.google.android.exoplayer.util.Util;
import com.litmus.worldscope.model.WorldScopeViewStream;

public class ViewActivity extends AppCompatActivity implements
        SurfaceHolder.Callback,
        LitmusPlayer.PlayerEventsListener {

    private final String TAG = "ViewActivity";

    // Reference to LitmusPlayer
    private LitmusPlayer litmusPlayer;
    // Stream currently viewing
    private WorldScopeViewStream viewStream;
    // String of mpd link
    private String mpdLink;
    private Context context;
    // User Agent string
    private String userAgent;
    // SurfaceView for video playback
    private SurfaceView surfaceView;
    private View shutterView;
    private AspectRatioFrameLayout videoFrame;
    private boolean viewing;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        viewStream = getIntent().getParcelableExtra("stream");
        mpdLink = viewStream.getViewLink();
        Log.d(TAG, "mpdLink: " + mpdLink);
        setContentView(R.layout.activity_view);
    }

    @Override
    protected void onStart() {
        super.onStart();
        prepareLitmusPlayer();
        prepareSurfaceView();
        addRecordButtonCallback();
    }

    // Function to initialize LitmusPlayer by passing in .mpd URI
    private void prepareLitmusPlayer() {
        context = this;
        userAgent = Util.getUserAgent(this, "ViewActivity");
        litmusPlayer = new LitmusPlayer(this, mpdLink, userAgent);
        litmusPlayer.addPlayerEventsListener(this);
        shutterView = findViewById(R.id.shutter);
        videoFrame = (AspectRatioFrameLayout) findViewById(R.id.video_frame);
        litmusPlayer.setPlayWhenReady(true);
    }

    // Function to prepare the SurfaceView by setting up the holder
    private void prepareSurfaceView() {
        surfaceView = (SurfaceView) findViewById(R.id.surface_view);
        surfaceView.getHolder().addCallback(this);
    }

    private void addRecordButtonCallback() {
        // Automatically start stream
        viewing = true;
        final FloatingActionButton fab = (FloatingActionButton) findViewById(R.id.viewFab);
        fab.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                // Toggle the state
                viewing = !viewing;
                if (!viewing) {
                    fab.setImageDrawable(ContextCompat.getDrawable(context, R.drawable.ic_stop));
                    litmusPlayer.setPlayWhenReady(true);
                } else {
                    fab.setImageDrawable(ContextCompat.getDrawable(context, R.drawable.ic_play_arrow));
                    litmusPlayer.setPlayWhenReady(false);
                }
            }
        });
    }

    // Implementation of PlayerEventListener
    @Override
    public void onVideoSizeChanged(int width, int height, int unappliedRotationDegrees,
                            float pixelWidthHeightRatio) {
        //Do nothing for now
        shutterView.setVisibility(View.GONE);
        videoFrame.setAspectRatio(height == 0 ? 1 : (width * pixelWidthHeightRatio) / height);
    }

    // Implementation of SurfaceHolder Callback
    @Override
    public void surfaceCreated (SurfaceHolder holder) {

        Log.i(TAG, "Surface created");

        if (litmusPlayer != null) {
            litmusPlayer.setSurface(holder.getSurface());
            litmusPlayer.readyToPushSurface(litmusPlayer.SURFACE_READY);
        }

    }

    @Override
    public void surfaceChanged(SurfaceHolder holder, int format, int width, int height) {
    }

    @Override
    public void surfaceDestroyed(SurfaceHolder holder) {
        if (litmusPlayer != null) {
            litmusPlayer.blockingClearSurface();
        }
    }
}
