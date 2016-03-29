package com.litmus.worldscope.utility;

import android.content.Context;
import android.media.MediaCodec;
import android.media.MediaDrm;
import android.os.Handler;
import android.os.Looper;
import android.text.TextUtils;
import android.util.Log;
import android.view.Surface;

import com.google.android.exoplayer.CodecCounters;
import com.google.android.exoplayer.DummyTrackRenderer;
import com.google.android.exoplayer.ExoPlaybackException;
import com.google.android.exoplayer.ExoPlayer;
import com.google.android.exoplayer.MediaCodecAudioTrackRenderer;
import com.google.android.exoplayer.MediaCodecTrackRenderer;
import com.google.android.exoplayer.MediaCodecVideoTrackRenderer;
import com.google.android.exoplayer.TrackRenderer;
import com.google.android.exoplayer.audio.AudioTrack;
import com.google.android.exoplayer.drm.MediaDrmCallback;
import com.google.android.exoplayer.drm.StreamingDrmSessionManager;
import com.google.android.exoplayer.upstream.DefaultBandwidthMeter;
import com.google.android.exoplayer.util.PlayerControl;
import com.google.android.exoplayer.util.Util;

import java.io.IOException;
import java.util.UUID;
import java.util.concurrent.CopyOnWriteArrayList;
import java.util.concurrent.locks.Condition;
import java.util.concurrent.locks.Lock;
import java.util.concurrent.locks.ReentrantLock;

public class LitmusPlayer implements
        ExoPlayer.Listener,
        MediaCodecVideoTrackRenderer.EventListener,
        MediaCodecAudioTrackRenderer.EventListener, DefaultBandwidthMeter.EventListener,
        StreamingDrmSessionManager.EventListener {

    public interface PlayerEventsListener {
        void onVideoSizeChanged(int width, int height, int unappliedRotationDegrees,
                                float pixelWidthHeightRatio);
    }

    private final String TAG = "LitmusPlayer";

    private ExoPlayer player;
    private DashRendererBuilder dashRendererBuilder;
    private WidevineTestMediaDrmCallback drmCallback;
    private String mpdLink;
    private DashRendererBuilder rendererBuilder;
    private PlayerControl playerControl;
    private TrackRenderer videoRenderer;
    private MediaCodecAudioTrackRenderer audioRenderer;
    private Surface surface;
    private CodecCounters codecCounters;
    private CopyOnWriteArrayList<PlayerEventsListener> listeners;
    private boolean surfaceLock;
    private boolean rendererLock;

    // Constants for instantiating ExoPlayer
    private static final int MIN_BUFFER_MS = 1000;
    private static final int MIN_REBUFFER_MS = 1000;

    public static final int RENDERER_COUNT = 2;
    public static final int SURFACE_READY = 0;
    public static final int RENDERER_READY = 1;
    public static final int TYPE_VIDEO = 0;
    public static final int TYPE_AUDIO = 1;
    public static final int TYPE_TEXT = 2;
    public static final int TYPE_METADATA = 3;

    // Constants pulled into this class for convenience.
    public static final int STATE_IDLE = ExoPlayer.STATE_IDLE;
    public static final int STATE_PREPARING = ExoPlayer.STATE_PREPARING;
    public static final int STATE_BUFFERING = ExoPlayer.STATE_BUFFERING;
    public static final int STATE_READY = ExoPlayer.STATE_READY;
    public static final int STATE_ENDED = ExoPlayer.STATE_ENDED;
    public static final int TRACK_DISABLED = ExoPlayer.TRACK_DISABLED;
    public static final int TRACK_DEFAULT = ExoPlayer.TRACK_DEFAULT;

    // Locks and conditions for push function to execute
    final Lock pushLock = new ReentrantLock();
    final Condition noSurface = pushLock.newCondition();
    final Condition noRenderers = pushLock.newCondition();

    // Handler given to DashRendererBuilder
    private Handler mainHandler;

    // Constructor for Litmus player
    public LitmusPlayer(Context context, String mpdLink, String userAgent) {
        // Prepare player
        preparePlayer(mpdLink);
        // Start dashRendererBuilder
        dashRendererBuilder = new DashRendererBuilder(this, context, mpdLink, userAgent, drmCallback);
    }

    // Function to set variables for litmus player
    private void preparePlayer(String mpdLink) {
        this.mpdLink = mpdLink;
        player = ExoPlayer.Factory.newInstance(RENDERER_COUNT, MIN_BUFFER_MS, MIN_REBUFFER_MS);
        drmCallback = new WidevineTestMediaDrmCallback(mpdLink);
        playerControl = new PlayerControl(player);
        mainHandler = new Handler();
        listeners = new CopyOnWriteArrayList<>();
        surfaceLock = true;
        rendererLock = true;
    }

    // Function that is called by activity and renderer builder to determine if video is ready to play
    public void readyToPushSurface(int indicator){

        if(indicator == SURFACE_READY) {
            surfaceLock = false;
        }
        else if(indicator == RENDERER_READY) {
            rendererLock = false;
        }

        Log.i(TAG, surfaceLock + " " + rendererLock);

        if(!surfaceLock && !rendererLock) {
            pushSurface(false);
        }
    }

    // Player functions

    public Handler getMainHandler() {
        return this.mainHandler;
    }

    public ExoPlayer getExoPlayer() {
        return this.player;
    }

    Looper getPlaybackLooper() {
        return player.getPlaybackLooper();
    }

    public void setRendererBuilder(DashRendererBuilder rendererBuilder) {
        this.rendererBuilder = rendererBuilder;
        this.videoRenderer = rendererBuilder.getVideoRenderer();
        this.audioRenderer = rendererBuilder.getAudioRenderer();
    }

    // Function to setSurface for video rendering
    public void setSurface(Surface surface) {
        this.surface = surface;
    }

    // Function to getSurface from player
    public Surface getSurface() {
        return this.surface;
    }

    // Function to destroy surface
    public void blockingClearSurface() {
        surface = null;
        pushSurface(true);
    }

    // Function to push surface to videoRenderer so that videoRenderer can playback
    private void pushSurface(boolean blockForSurfacePush) {
        if (videoRenderer == null) {
            Log.i(TAG, "NO VIDEO RENDERER");
            return;
        }

        if(surface == null) {
            Log.i(TAG, "NO SURFACE");
            return;
        }

        Log.i(TAG, "PUSHING");

        if (blockForSurfacePush) {
            player.blockingSendMessage(
                    videoRenderer, MediaCodecVideoTrackRenderer.MSG_SET_SURFACE, surface);
        } else {
            player.sendMessage(
                    videoRenderer, MediaCodecVideoTrackRenderer.MSG_SET_SURFACE, surface);
        }
    }

    // Function to add a listener that implements LitmusPlayer
    public void addPlayerEventsListener(PlayerEventsListener listener) {
        listeners.add(listener);
    }

    public void setPlayWhenReady(boolean playWhenReady) {
        player.setPlayWhenReady(playWhenReady);
    }

    public void release() {
        dashRendererBuilder.destroy();
        player.release();
    }

    // Functions to implement Exoplayer.Listener
    public void onPlayerError(ExoPlaybackException error) {

    }

    public void onPlayerStateChanged(boolean playWhenReady, int playbackState) {
        Log.d(TAG, "Player state changed, playWhenReady: " + playWhenReady + ", playbackState: " + playbackState);
    }

    public void onPlayWhenReadyCommitted() {

    }

    // Function to get track from ExoPlayer
    public int getSelectedTrack(int type) {
        return player.getSelectedTrack(type);
    }

    // Function to be called when renderers are ready in DashRendererBuilder
    public void onRenderers(TrackRenderer[] renderers) {

        Log.d(TAG, "Number of renderers: " + RENDERER_COUNT);

        for (int i = 0; i < RENDERER_COUNT; i++) {
            if (renderers[i] == null) {
                // Convert a null renderer to a dummy renderer.
                renderers[i] = new DummyTrackRenderer();
            }
        }
        // Complete preparation
        this.videoRenderer = renderers[TYPE_VIDEO];
        this.audioRenderer = (MediaCodecAudioTrackRenderer) renderers[TYPE_AUDIO];
        this.codecCounters = videoRenderer instanceof MediaCodecTrackRenderer
                ? ((MediaCodecTrackRenderer) videoRenderer).codecCounters
                : renderers[TYPE_AUDIO] instanceof MediaCodecTrackRenderer
                ? ((MediaCodecTrackRenderer) renderers[TYPE_AUDIO]).codecCounters : null;
        Log.i(TAG, "Preparing player");
        this.player.prepare(this.videoRenderer, this.audioRenderer);
    }

    // Implement for MediaCodecAudioTrackRenderer.EventListener
    @Override
    public void onAudioTrackInitializationError(AudioTrack.InitializationException e) {
    }

    @Override
    public void onAudioTrackWriteError(AudioTrack.WriteException e) {
    }

    @Override
    public void onDecoderInitialized(String decoderName, long elapsedRealTimeMs,
                                     long initializationDurationMs) {
    }
    @Override
    public void onDecoderInitializationError(MediaCodecTrackRenderer.DecoderInitializationException e) {
    }

    @Override
    public void onCryptoError(MediaCodec.CryptoException e) {
    }

    // Implement for MediaCodecVideoTrackRenderer.EventListener
    @Override
    public void onDroppedFrames(int count, long elapsed) {
        Log.i(TAG, "Dropped frames: " + count + " for " + elapsed + " time");
    }

    @Override
    public void onDrawnToSurface(Surface surface) {
        Log.i(TAG, "ONDRAWNTOSURFACE: " + surface);
    }

    @Override
    public void onVideoSizeChanged(int width, int height, int unappliedRotationDegrees,
                                   float pixelWidthHeightRatio) {
        for (PlayerEventsListener listener : listeners) {
            listener.onVideoSizeChanged(width, height, unappliedRotationDegrees, pixelWidthHeightRatio);
        }
    }

    // Implement for DefaultBandwidthSample
    @Override
    public void onBandwidthSample(int elapsedMs, long bytes, long bitrateEstimate) {
    }

    // Implement for StreamingDrmManager
    @Override
    public void onDrmKeysLoaded() {
    }

    @Override
    public void onDrmSessionManagerError(Exception e) {
    }

    public class WidevineTestMediaDrmCallback implements MediaDrmCallback {

        private static final String WIDEVINE_GTS_DEFAULT_BASE_URI =
                "http://wv-staging-proxy.appspot.com/proxy?provider=YouTube&video_id=";

        private final String defaultUri;

        public WidevineTestMediaDrmCallback(String videoId) {
            defaultUri = WIDEVINE_GTS_DEFAULT_BASE_URI + videoId;
        }

        @Override
        public byte[] executeProvisionRequest(UUID uuid, MediaDrm.ProvisionRequest request) throws IOException {
            String url = request.getDefaultUrl() + "&signedRequest=" + new String(request.getData());
            return Util.executePost(url, null, null);
        }

        @Override
        public byte[] executeKeyRequest(UUID uuid, MediaDrm.KeyRequest request) throws IOException {
            String url = request.getDefaultUrl();
            if (TextUtils.isEmpty(url)) {
                url = defaultUri;
            }
            return Util.executePost(url, request.getData(), null);
        }
    }
}
