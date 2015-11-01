package com.litmus.worldscope;

import android.content.Context;
import android.graphics.Point;
import android.graphics.Rect;
import android.hardware.Camera;
import android.media.AudioFormat;
import android.media.AudioRecord;
import android.media.MediaRecorder;
import android.support.design.widget.FloatingActionButton;
import android.support.v4.content.ContextCompat;
import android.support.v7.app.AppCompatActivity;
import android.os.Bundle;
import android.util.DisplayMetrics;
import android.util.Log;
import android.view.Display;
import android.view.LayoutInflater;
import android.view.SurfaceHolder;
import android.view.SurfaceView;
import android.view.View;
import android.view.Window;
import android.view.WindowManager;
import android.widget.FrameLayout;
import android.widget.RelativeLayout;

import org.bytedeco.javacv.FFmpegFrameRecorder;
import org.bytedeco.javacv.Frame;

import java.io.IOException;
import java.nio.ByteBuffer;
import java.nio.ShortBuffer;
import java.util.Collections;
import java.util.Comparator;
import java.util.List;

public class RecordActivity extends AppCompatActivity {

    final static String CLASS_LABEL = "RecordActivity";
    final static String LOG_TAG = CLASS_LABEL;
    final Context mContext = this;
    //Change this to stream RMTP
    String ffmpeg_link = "rtmp://worldscope.tk/dash/streamkey";

    long startTime = 0;
    boolean recording = false;
    FFmpegFrameRecorder recorder;

    //Set the rotation
    final int ROTATION_90 = 90;

    boolean isPreviewOn = false;

    int sampleAudioRateInHz = 44100;
    int imageWidth = 320;
    int imageHeight = 240;
    int frameRate = 30;

    /* audio data getting thread */
    AudioRecord audioRecord;
    AudioRecordRunnable audioRecordRunnable;
    Thread audioThread;
    volatile boolean runAudioThread = true;

    /* video data getting thread */
    Camera cameraDevice;
    CameraView cameraView;

    Frame yuvImage = null;

    /* layout setting */
    // Set the x border and y border
    final int bg_screen_bx = 0;
    final int bg_screen_by = 0;

    // Dimensions of the screen
    Display display;
    Point displayDimensions;
    int actualHeight;

    // Set the width and height for the video preview
    int bg_screen_width;
    int bg_screen_height;

    // Set the width and height for the backdrop
    int bg_width;
    int bg_height;

    int live_width;
    int live_height;
    int screenWidth, screenHeight;

    /* The number of seconds in the continuous record loop (or 0 to disable loop). */
    //final int RECORD_LENGTH = 10;
    final int RECORD_LENGTH = 0;
    Frame[] images;
    long[] timestamps;
    int imagesIndex;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_record);
        getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);
        initializeLayout();
    }

    // Compute the layout size and set it to displayDimensions
    private void initializeLayout() {

        // Get the layout id
        FrameLayout root = (FrameLayout) findViewById(R.id.streamFrameLayout);
        root.post(new Runnable() {
            public void run() {
                // Get actual height of the activity
                getActualHeight();
                // Start camera preview
                initializeCameraPreviewLayout();
                // Add callback for record button
                addRecordButtonCallback();
            }
        });
    }

    private void getActualHeight() {
        Rect rect = new Rect();
        Window win = getWindow();  // Get the Window
        win.getDecorView().getWindowVisibleDisplayFrame(rect);
        // Get the height of Status Bar
        int statusBarHeight = rect.top;
        // Get the height occupied by the decoration contents
        int contentViewTop = win.findViewById(Window.ID_ANDROID_CONTENT).getTop();
        // Calculate titleBarHeight by deducting statusBarHeight from contentViewTop
        int titleBarHeight = contentViewTop - statusBarHeight;
        Log.i("MY", "titleHeight = " + titleBarHeight + " statusHeight = " + statusBarHeight + " contentViewTop = " + contentViewTop);

        // By now we got the height of titleBar & statusBar
        // Now lets get the screen size
        DisplayMetrics metrics = new DisplayMetrics();
        getWindowManager().getDefaultDisplay().getMetrics(metrics);
        int screenHeight = metrics.heightPixels;
        int screenWidth = metrics.widthPixels;
        Log.i("MY", "Actual Screen Height = " + screenHeight + " Width = " + screenWidth);

        // Now calculate the height that our layout can be set
        // If you know that your application doesn't have statusBar added, then don't add here also. Same applies to application bar also
        int layoutHeight = screenHeight - (titleBarHeight + statusBarHeight);
        Log.i("MY", "Layout Height = " + layoutHeight);

        actualHeight = layoutHeight;
    }

    // Create the layout
    private void initializeCameraPreviewLayout() {
        /* get size of screen */
        display = ((WindowManager) getSystemService(Context.WINDOW_SERVICE)).getDefaultDisplay();
        displayDimensions = new Point();

        //Set the size of the screen, preview and its background
        display.getSize(displayDimensions);
        displayDimensions.set(displayDimensions.x, actualHeight);

        Log.i(LOG_TAG, "x: " + displayDimensions.x + " y: " + displayDimensions.y);

        screenWidth = displayDimensions.x;
        screenHeight = displayDimensions.y;
        bg_screen_width = displayDimensions.x;
        bg_screen_height = displayDimensions.y;
        bg_width = displayDimensions.x;
        bg_height = displayDimensions.y;
        live_width = displayDimensions.x;
        live_height = displayDimensions.y;

        //Initialize the frame layout
        FrameLayout.LayoutParams frameLayoutParam;
        RelativeLayout.LayoutParams relativeLayoutParam;
        LayoutInflater myInflate;

        myInflate = (LayoutInflater) getSystemService(Context.LAYOUT_INFLATER_SERVICE);
        FrameLayout topLayout = new FrameLayout(this);
        setContentView(topLayout);

        /* add camera view */
        int display_width_d = (int) (1.0 * bg_screen_width * screenWidth / bg_width);
        int display_height_d = (int) (1.0 * bg_screen_height * screenHeight / bg_height);
        int prev_rw, prev_rh;
        if (1.0 * display_width_d / display_height_d > 1.0 * live_width / live_height) {
            prev_rh = display_height_d;
            prev_rw = (int) (1.0 * display_height_d * live_width / live_height);
        } else {
            prev_rw = display_width_d;
            prev_rh = (int) (1.0 * display_width_d * live_height / live_width);
        }
        frameLayoutParam = new FrameLayout.LayoutParams(prev_rw, prev_rh);
        frameLayoutParam.topMargin = (int) (1.0 * bg_screen_by * screenHeight / bg_height);
        frameLayoutParam.leftMargin = (int) (1.0 * bg_screen_bx * screenWidth / bg_width);

        //Set the camera to portrait mode
        cameraDevice = Camera.open();
        cameraDevice.setDisplayOrientation(ROTATION_90);

        Log.i(LOG_TAG, "Camera open");
        cameraView = new CameraView(this, cameraDevice);
        topLayout.addView(cameraView, frameLayoutParam);
        Log.i(LOG_TAG, "Camera preview start: OK");

        // TODO: Tweak start buttons
        //Add in the button bar into the FrameLayout
        relativeLayoutParam = new RelativeLayout.LayoutParams(screenWidth, screenHeight);
        RelativeLayout streamButtonBar = (RelativeLayout) myInflate.inflate(R.layout.template_stream_button_bar, null);
        topLayout.addView(streamButtonBar, relativeLayoutParam);
    }

    // Start recording
    private void startRecorder() {
        initializeRecorder();
        try {
            recording = true;
            recorder.start();
            startTime = System.currentTimeMillis();
            audioThread.start();

        } catch (FFmpegFrameRecorder.Exception e) {
            e.printStackTrace();
        }
    }

    // Stop recording
    public void stopRecording() {

        runAudioThread = false;
        try {
            audioThread.join();
        } catch (InterruptedException e) {
            e.printStackTrace();
        }
        audioRecordRunnable = null;
        audioThread = null;

        if (recorder != null && recording) {

            recording = false;
            Log.v(LOG_TAG,"Finishing recording, calling stop and release on recorder");
            try {
                recorder.stop();
                recorder.release();
            } catch (FFmpegFrameRecorder.Exception e) {
                e.printStackTrace();
            }
            recorder = null;

        }
    }

    // Create recorder
    private void initializeRecorder() {
        Log.w(LOG_TAG,"init recorder");

        if (yuvImage == null) {
            yuvImage = new Frame(imageWidth, imageHeight, Frame.DEPTH_UBYTE, 2);
            Log.i(LOG_TAG, "create yuvImage");
        }

        Log.i(LOG_TAG, "ffmpeg_url: " + ffmpeg_link);
        recorder = new FFmpegFrameRecorder(ffmpeg_link, imageWidth, imageHeight, 1);

        // Custom format
        recorder.setFormat("flv");
        recorder.setVideoCodec(28);
        recorder.setAudioCodec(86018);
        recorder.setSampleRate(22050);
        recorder.setFrameRate(30.0D);

        // Default format
        //recorder.setSampleRate(sampleAudioRateInHz);
        //recorder.setFrameRate(frameRate);
        // Set in the surface changed method

        Log.i(LOG_TAG, "recorder initialize success");

        audioRecordRunnable = new AudioRecordRunnable();
        audioThread = new Thread(audioRecordRunnable);
        runAudioThread = true;
        recorder.setVideoOption("preset", "ultrafast");
    }

    // CameraView class that contains thread to get and encode video data
    class CameraView extends SurfaceView implements SurfaceHolder.Callback, Camera.PreviewCallback {

        private SurfaceHolder mHolder;
        private Camera mCamera;

        public CameraView(Context context, Camera camera) {
            super(context);
            Log.w("camera","camera view");
            mCamera = camera;
            mHolder = getHolder();
            mHolder.addCallback(CameraView.this);
            mHolder.setType(SurfaceHolder.SURFACE_TYPE_PUSH_BUFFERS);
            mCamera.setPreviewCallback(CameraView.this);
        }

        @Override
        public void surfaceCreated(SurfaceHolder holder) {
            try {
                stopPreview();
                mCamera.setPreviewDisplay(holder);
            } catch (IOException exception) {
                mCamera.release();
                mCamera = null;
            }
        }

        public void surfaceChanged(SurfaceHolder holder, int format, int width, int height) {
            Camera.Parameters camParams = mCamera.getParameters();
            List<Camera.Size> sizes = camParams.getSupportedPreviewSizes();
            // Sort the list in ascending order
            Collections.sort(sizes, new Comparator<Camera.Size>() {

                public int compare(final Camera.Size a, final Camera.Size b) {
                    return a.width * a.height - b.width * b.height;
                }
            });

            // Pick the first preview size that is equal or bigger, or pick the last (biggest) option if we cannot
            // reach the initial settings of imageWidth/imageHeight.
            for (int i = 0; i < sizes.size(); i++) {
                if ((sizes.get(i).width >= imageWidth && sizes.get(i).height >= imageHeight) || i == sizes.size() - 1) {
                    imageWidth = sizes.get(i).width;
                    imageHeight = sizes.get(i).height;
                    Log.v(LOG_TAG, "Changed to supported resolution: " + imageWidth + "x" + imageHeight);
                    break;
                }
            }
            camParams.setPreviewSize(imageWidth, imageHeight);

            Log.v(LOG_TAG,"Setting imageWidth: " + imageWidth + " imageHeight: " + imageHeight + " frameRate: " + frameRate);

            camParams.setPreviewFrameRate(frameRate);
            Log.v(LOG_TAG,"Preview Framerate: " + camParams.getPreviewFrameRate());

            mCamera.setParameters(camParams);
            startPreview();
        }

        @Override
        public void surfaceDestroyed(SurfaceHolder holder) {
            try {
                mHolder.addCallback(null);
                mCamera.setPreviewCallback(null);
            } catch (RuntimeException e) {
                // The camera has probably just been released, ignore.
            }
        }

        public void startPreview() {
            if (!isPreviewOn && mCamera != null) {
                isPreviewOn = true;
                mCamera.startPreview();
            }
        }

        public void stopPreview() {
            if (isPreviewOn && mCamera != null) {
                isPreviewOn = false;
                mCamera.stopPreview();
            }
        }

        @Override
        public void onPreviewFrame(byte[] data, Camera camera) {
            if (audioRecord == null || audioRecord.getRecordingState() != AudioRecord.RECORDSTATE_RECORDING) {
                startTime = System.currentTimeMillis();
                return;
            }
            if (RECORD_LENGTH > 0) {
                int i = imagesIndex++ % images.length;
                yuvImage = images[i];
                timestamps[i] = 1000 * (System.currentTimeMillis() - startTime);
            }
            /* get video data */
            if (yuvImage != null && recording) {
                ((ByteBuffer)yuvImage.image[0].position(0)).put(data);

                if (RECORD_LENGTH <= 0) try {
                    Log.v(LOG_TAG,"Writing Frame");
                    long t = 1000 * (System.currentTimeMillis() - startTime);
                    if (t > recorder.getTimestamp()) {
                        recorder.setTimestamp(t);
                    }
                    recorder.record(yuvImage);
                } catch (FFmpegFrameRecorder.Exception e) {
                    Log.v(LOG_TAG,e.getMessage());
                    e.printStackTrace();
                }
            }
        }
    }

    // AudioRecordRunnable class that contains thread to get and encode audio data
    class AudioRecordRunnable implements Runnable {

        @Override
        public void run() {
            android.os.Process.setThreadPriority(android.os.Process.THREAD_PRIORITY_URGENT_AUDIO);

            // Audio
            int bufferSize;
            ShortBuffer audioData;
            int bufferReadResult;

            bufferSize = AudioRecord.getMinBufferSize(sampleAudioRateInHz,
                    AudioFormat.CHANNEL_IN_MONO, AudioFormat.ENCODING_PCM_16BIT);
            audioRecord = new AudioRecord(MediaRecorder.AudioSource.MIC, sampleAudioRateInHz,
                    AudioFormat.CHANNEL_IN_MONO, AudioFormat.ENCODING_PCM_16BIT, bufferSize);

            audioData = ShortBuffer.allocate(bufferSize);

            Log.d(LOG_TAG, "audioRecord.startRecording()");
            audioRecord.startRecording();

            /* ffmpeg_audio encoding loop */
            while (runAudioThread) {

                //Log.v(LOG_TAG,"recording? " + recording);
                bufferReadResult = audioRecord.read(audioData.array(), 0, audioData.capacity());
                audioData.limit(bufferReadResult);
                if (bufferReadResult > 0) {
                    Log.v(LOG_TAG,"bufferReadResult: " + bufferReadResult);
                    // If "recording" isn't true when start this thread, it never get's set according to this if statement...!!!
                    // Why?  Good question...
                    if (recording) {
                        try {
                            recorder.recordSamples(audioData);
                            //Log.v(LOG_TAG,"recording " + 1024*i + " to " + 1024*i+1024);
                        } catch (FFmpegFrameRecorder.Exception e) {
                            Log.v(LOG_TAG,e.getMessage());
                            e.printStackTrace();
                        }
                    }
                }
            }
            Log.v(LOG_TAG,"AudioThread Finished, release audioRecord");

            /* encoding finish, release recorder */
            if (audioRecord != null) {
                audioRecord.stop();
                audioRecord.release();
                audioRecord = null;
                Log.v(LOG_TAG,"audioRecord released");
            }
        }
    }

    private void addRecordButtonCallback() {
        final FloatingActionButton fab = (FloatingActionButton) findViewById(R.id.streamFab);
        fab.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                if (!recording) {
                    fab.setImageDrawable(ContextCompat.getDrawable(mContext, R.drawable.ic_stop));
                    startRecorder();
                } else {
                    fab.setImageDrawable(ContextCompat.getDrawable(mContext, R.drawable.ic_videocam));
                    stopRecording();
                }
            }
        });
    }

}
