package fragment;

import android.content.Context;
import android.graphics.Point;
import android.graphics.Rect;
import android.hardware.Camera;
import android.media.AudioFormat;
import android.media.AudioRecord;
import android.media.MediaRecorder;
import android.os.Bundle;
import android.support.v4.app.Fragment;
import android.util.DisplayMetrics;
import android.util.Log;
import android.view.Display;
import android.view.LayoutInflater;
import android.view.SurfaceHolder;
import android.view.SurfaceView;
import android.view.View;
import android.view.ViewGroup;
import android.view.Window;
import android.view.WindowManager;
import android.widget.FrameLayout;

import com.litmus.worldscope.R;

import org.bytedeco.javacv.FFmpegFrameRecorder;
import org.bytedeco.javacv.FFmpegFrameFilter;
import org.bytedeco.javacv.Frame;

import java.io.IOException;
import java.nio.BufferOverflowException;
import java.nio.ByteBuffer;
import java.nio.ShortBuffer;
import java.util.Collections;
import java.util.Comparator;
import java.util.List;

/**
 * Fragment containing video streaming functionality from JavaCV
 * Contains an interface to be implemented by the Activity containing it
 */
public class StreamVideoFragment extends Fragment {

    private static final String TAG = "StreamVideoFragment";
    private final String ERROR_IMPLEMENT_ON_FRAGMENT_INTERACTION_LISTENER = " must implement OnStreamVideoFragmentListener";
    private final int MAX_SUPPORTED_IMAGE_WIDTH = 1024;
    private final int MAX_SUPPORTED_IMAGE_HEIGHT = 768;
    private final boolean FRONT_CAMERA = true;
    private final boolean BACK_CAMERA = false;

    private StreamVideoControls controls;

    //Change this to stream RMTP
    private String rtmpLink;
    private OnStreamVideoFragmentListener listener;
    private Context context;

    private FrameLayout root;
    private FrameLayout topLayout;

    // States for recorder
    long startTime;
    boolean streamWhenReady = false;
    boolean isInitialized = false;
    boolean recording = false;
    boolean isFrontCamera = true;
    boolean isToggle = false;

    // Recorder and camera objects
    private FFmpegFrameRecorder recorder;
    private FFmpegFrameFilter filter;
    private Camera cameraDevice;
    private CameraView cameraView;

    // Video and audio codec settings
    private String VIDEO_FORMAT = "flv";
    private int VIDEO_CODEC_H264 = 28;
    private int AUDIO_CODEC_AAC = 86018;
    private int VIDEO_FRAME_RATE = 30;

    // From javacpp-presets -> avutil.java
    private int AV_PIX_FMT_NV21 = 26;
    private Frame yuvImage = null;

    // Rotation constant
    final int ROTATION_90 = 90;

    // Audio and video initial setting
    boolean isPreviewOn;
    int sampleAudioRateInHz = 44100;
    int imageWidth = 320;
    int imageHeight = 240;
    int frameRate = 30;
    private int actualHeight;

    // Audio data getting thread
    private AudioRecord audioRecord;
    private AudioRecordRunnable audioRecordRunnable;
    private Thread audioThread;

    volatile boolean runAudioThread = true;

    public StreamVideoFragment() {
    }

    /**
     * Use this factory method to create a new instance of
     * this fragment using the provided parameters.
     *
     * @return A new instance of fragment StreamVideoFragment.
     */
    // TODO: Rename and change types and number of parameters
    public static StreamVideoFragment newInstance() {
        StreamVideoFragment fragment = new StreamVideoFragment();
        return fragment;
    }

    @Override
    public void onAttach(Context context) {
        super.onAttach(context);
        this.context = context;
        if (context instanceof OnStreamVideoFragmentListener) {
            listener = (OnStreamVideoFragmentListener) context;
        } else {
            throw new RuntimeException(context.toString()
                    + ERROR_IMPLEMENT_ON_FRAGMENT_INTERACTION_LISTENER );
        }
    }

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
    }

    @Override
    public View onCreateView(LayoutInflater inflater, ViewGroup container,
                             Bundle savedInstanceState) {
        // Inflate the layout for this fragment

        // Get the layout id
        View view = inflater.inflate(R.layout.fragment_stream_video, container, false);
        return view;
    }

    // Toggle camera
    private void toggleCameraFromFragment() {
        // Remove old camera instance and view
        ((ViewGroup) getView()).removeView(topLayout);
        // Save a previous state whether it is recording or not
        // If recording, set isToggle to true else false
        // If isToggle is true, initializeLayout will immediately start streaming
        // Else it will wait
        isToggle = recording;
        stopRecorder();
        destroyStreamerFromFragment();
        // Toggle the boolean
        isFrontCamera = !isFrontCamera;
        isInitialized = false;
        isPreviewOn = false;
        initializeLayout(isToggle);
    }

    @Override
    public void onResume() {
        super.onResume();
        isInitialized = false;
        isPreviewOn = false;
        root = (FrameLayout) getView();
        controls = new StreamVideoControls();
        listener.streamVideoFragmentReady(controls);
        // Prevent the window from turning dark
        getActivity().getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);
        // Set isToggle to false
        isToggle = false;
        initializeLayout(isToggle);
        // If received signal from outside to stream, start streaming
        if(streamWhenReady) {
            startRecorder();
        }
    }

    @Override
    public void onPause() {
        super.onPause();
        // Remove the previous view and add a new one on resume
        ((ViewGroup) getView()).removeView(topLayout);
        if(cameraDevice != null) {
            cameraDevice.release();
        }
        stopRecorder();
    }


    @Override
    public void onDestroy() {
        super.onDestroy();
        destroyRecorder();
    }

    // Compute the layout size and set it to displayDimensions
    // If isToggle is true, there will be no outside signal to start recording
    private void initializeLayout(boolean isToggle) {
        final boolean startRecording = isToggle;
        root.post(new Runnable() {
            public void run() {
                // Get actual height of the activity
                getActualHeight();
                // Start camera preview
                initializeCameraPreviewLayout();
                if(startRecording) {
                    startRecorder();
                }
            }
        });
    }

    private void getActualHeight() {
        Rect rect = new Rect();
        Window win = getActivity().getWindow();  // Get the Window
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
        getActivity().getWindowManager().getDefaultDisplay().getMetrics(metrics);
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
        // Dimensions of the screen
        Display display;
        Point displayDimensions;

        // Set the width and height for the video preview
        int bg_screen_width;
        int bg_screen_height;

        // Set the width and height for the backdrop
        int bg_width;
        int bg_height;

        int live_width;
        int live_height;
        int screenWidth, screenHeight;

        // x border and y border
        final int bg_screen_bx = 0;
        final int bg_screen_by = 0;

        /* get size of screen */
        display = ((WindowManager) getActivity().getSystemService(Context.WINDOW_SERVICE)).getDefaultDisplay();
        displayDimensions = new Point();

        //Set the size of the screen, preview and its background
        display.getSize(displayDimensions);
        displayDimensions.set(displayDimensions.x, actualHeight);

        Log.i(TAG, "x: " + displayDimensions.x + " y: " + displayDimensions.y);

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

        topLayout = new FrameLayout(context);
        // Add topLayout into view
        ((ViewGroup) getView()).addView(topLayout);

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
        if(!isFrontCamera) {
            cameraDevice = openCamera(BACK_CAMERA);
            Log.d(TAG, "Opening back camera");
        } else {
            cameraDevice = openCamera(FRONT_CAMERA);
            Log.d(TAG, "Opening front camera");
        }

        cameraDevice.setDisplayOrientation(ROTATION_90);

        Log.i(TAG, "Camera open");
        cameraView = new CameraView(context, cameraDevice);
        topLayout.addView(cameraView, frameLayoutParam);
        isInitialized = true;
    }

    // Create the filter required to rotate the camera output to portrait
    private void initializeFilter() {
        Log.d(TAG, "Filter initialized, width: " + imageWidth + " height: " + imageHeight);
        if(isFrontCamera) {
            filter = new FFmpegFrameFilter("transpose=2:portrait", imageWidth, imageHeight);
        } else {
            filter = new FFmpegFrameFilter("transpose=1:portrait", imageWidth, imageHeight);
        }
        filter.setPixelFormat(AV_PIX_FMT_NV21); // default camera format on Android
        try {
            filter.start();
        } catch(FFmpegFrameFilter.Exception e) {
            e.printStackTrace();
        }
    }

    private Camera openCamera(boolean front) {
        int cameraCount = 0;
        Camera cam = null;
        Camera.CameraInfo cameraInfo = new Camera.CameraInfo();
        cameraCount = Camera.getNumberOfCameras();
        for (int camIdx = 0; camIdx < cameraCount; camIdx++) {
            Camera.getCameraInfo(camIdx, cameraInfo);
            if (cameraInfo.facing == Camera.CameraInfo.CAMERA_FACING_FRONT && front) {
                try {
                    cam = Camera.open(camIdx);
                } catch (RuntimeException e) {
                    Log.e(TAG, "Camera failed to open: " + e.getLocalizedMessage());
                }
            } else if(cameraInfo.facing == Camera.CameraInfo.CAMERA_FACING_BACK && !front){
                try {
                    cam = Camera.open(camIdx);
                } catch (RuntimeException e) {
                    Log.e(TAG, "Camera failed to open: " + e.getLocalizedMessage());
                }
            }
        }

        return cam;
    }

    // CameraView class that contains thread to get and encode video data
    class CameraView extends SurfaceView implements SurfaceHolder.Callback, Camera.PreviewCallback {

        private SurfaceHolder holder;
        private Camera camera;

        public CameraView(Context context, Camera camera) {
            super(context);
            this.camera = camera;
            Log.d(TAG,"CameraView surface created");
            holder = getHolder();
            holder.addCallback(CameraView.this);
            holder.setType(SurfaceHolder.SURFACE_TYPE_PUSH_BUFFERS);
        }

        public Camera getCamera() {
            return this.camera;
        }

        public void setCamera(Camera camera) {
            this.camera = camera;
        }

        @Override
        public void surfaceCreated(SurfaceHolder holder) {
            try {
                stopCameraPreview();
                camera.setPreviewDisplay(holder);
                camera.setPreviewCallback(CameraView.this);

            } catch (IOException e) {
                e.printStackTrace();
                camera.release();
                camera = null;
            }
        }

        @Override
        public void surfaceChanged(SurfaceHolder holder, int format, int width, int height) {
            startCameraPreview();
        }


        @Override
        public void surfaceDestroyed(SurfaceHolder holder) {
            try {
                holder.addCallback(null);
                camera.setPreviewCallback(null);
            } catch (RuntimeException e) {
                // The camera has probably just been released, ignore.
            }
        }

        public void startCameraPreview() {

            try {
                Camera.Parameters camParams = camera.getParameters();
            } catch (Exception e) {
                Log.d(TAG, "Camera is released! Assigning new camera!");
                if(!isFrontCamera) {
                    this.camera = openCamera(BACK_CAMERA);
                } else {
                    this.camera = openCamera(FRONT_CAMERA);
                }
                this.camera.setDisplayOrientation(ROTATION_90);
                this.camera.setPreviewCallback(CameraView.this);
            }

            Camera.Parameters camParams = camera.getParameters();

            // Enable auto focus
            if (camParams.getSupportedFocusModes().contains(
                    Camera.Parameters.FOCUS_MODE_CONTINUOUS_VIDEO)) {
                camParams.setFocusMode(Camera.Parameters.FOCUS_MODE_CONTINUOUS_VIDEO);
            }

            // Sort the list in ascending order
            List<Camera.Size> sizes = camParams.getSupportedPreviewSizes();
            Collections.sort(sizes, new Comparator<Camera.Size>() {

                public int compare(final Camera.Size a, final Camera.Size b) {
                    return a.width * a.height - b.width * b.height;
                }
            });

            // Pick the first preview size that is equal or bigger, or pick the last (biggest) option if we cannot
            // reach the initial settings of imageWidth/imageHeight.
            Log.d(TAG, "Sizes: " + (sizes.size()));
            for (int i = sizes.size() - 1; i >= 0; i--) {
                Log.d(TAG, "Looking at " + sizes.get(i).width + " x " + sizes.get(i).height);
                if ((sizes.get(i).width <= MAX_SUPPORTED_IMAGE_WIDTH && sizes.get(i).height <= MAX_SUPPORTED_IMAGE_HEIGHT) || i == 0) {
                    imageWidth = sizes.get(i).width;
                    imageHeight = sizes.get(i).height;
                    Log.d(TAG, "Changed to supported resolution: " + imageWidth + "x" + imageHeight);
                    break;
                }
            }

            camParams.setPreviewSize(imageWidth, imageHeight);

            Log.v(TAG, "Setting imageWidth: " + imageWidth + " imageHeight: " + imageHeight + " frameRate: " + frameRate);

            camParams.setPreviewFrameRate(frameRate);
            Log.v(TAG, "Preview Framerate: " + camParams.getPreviewFrameRate());

            camera.setParameters(camParams);

            initializeFilter();

            if (!isPreviewOn && camera != null) {
                Log.i(TAG, "Camera preview started");
                isPreviewOn = true;
                camera.startPreview();
            }
        }

        public void stopCameraPreview() {
            if (isPreviewOn && camera != null) {
                isPreviewOn = false;
                camera.stopPreview();
            }
        }

        @Override
        public void onPreviewFrame(byte[] data, Camera camera) {
            Log.v(TAG, "Preview Frame received");
            if (audioRecord == null || audioRecord.getRecordingState() != AudioRecord.RECORDSTATE_RECORDING) {
                startTime = System.currentTimeMillis();
                return;
            }

            /* get video data */
            if (yuvImage != null && recording) {
                /* Try to set data into Frame */
                try {
                    ((ByteBuffer)yuvImage.image[0].position(0)).put(data);
                } catch (BufferOverflowException e) {
                    /* Reinitialize yuvImage to correct size */
                    e.printStackTrace();
                    Log.e(TAG, "Incorrect buffer size in yuvImage, resetting to " + imageWidth + " x " + imageHeight);
                    yuvImage = new Frame(imageWidth, imageHeight, Frame.DEPTH_UBYTE, 2);
                    ((ByteBuffer)yuvImage.image[0].position(0)).put(data);
                }

                try {
                    Log.v(TAG, "Writing Frame");
                    long t = 1000 * (System.currentTimeMillis() - startTime);
                    if (t > recorder.getTimestamp()) {
                        recorder.setTimestamp(t);
                    }

                    try {
                        filter.push(yuvImage);
                        Frame frame;
                        while ((frame = filter.pull()) != null) {
                            Log.d(TAG, "Recording frame");
                            recorder.record(frame);
                        }
                    } catch(FFmpegFrameFilter.Exception e) {
                        e.printStackTrace();
                    }

                } catch (FFmpegFrameRecorder.Exception e) {
                    Log.v(TAG,e.getMessage());
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

            Log.d(TAG, "audioRecord.startRecording()");
            audioRecord.startRecording();

            /* ffmpeg_audio encoding loop */
            while (runAudioThread) {

                //Log.v(TAG,"recording? " + recording);
                bufferReadResult = audioRecord.read(audioData.array(), 0, audioData.capacity());
                audioData.limit(bufferReadResult);
                if (bufferReadResult > 0) {
                    Log.v(TAG,"bufferReadResult: " + bufferReadResult);
                    // If "recording" isn't true when start this thread, it never get's set according to this if statement...!!!
                    // Why?  Good question...
                    if (recording) {
                        try {
                            Log.d(TAG, "Recording audio");
                            recorder.recordSamples(audioData);
                            //Log.v(TAG,"recording " + 1024*i + " to " + 1024*i+1024);
                        } catch (FFmpegFrameRecorder.Exception e) {
                            Log.v(TAG,e.getMessage());
                            e.printStackTrace();
                        }
                    }
                }
            }
            Log.v(TAG,"AudioThread Finished, release audioRecord");

            /* encoding finish, release recorder */
            if (audioRecord != null) {
                audioRecord.stop();
                audioRecord.release();
                audioRecord = null;
                Log.v(TAG,"audioRecord released");
            }
        }
    }

    // Create recorder
    private void initializeRecorder() {
        Log.d(TAG, "init recorder");

        yuvImage = new Frame(imageWidth, imageHeight, Frame.DEPTH_UBYTE, 2);

        if(recorder == null) {
            Log.i(TAG, "Creating recorder");
            recorder = new FFmpegFrameRecorder(rtmpLink, imageWidth, imageHeight, 1);
        }

        // In case toggling is done and image size changes
        recorder.setImageHeight(imageHeight);
        recorder.setImageWidth(imageWidth);

        // Custom format
        recorder.setFormat(VIDEO_FORMAT);
        recorder.setVideoCodec(VIDEO_CODEC_H264);
        recorder.setAudioCodec(AUDIO_CODEC_AAC);
        recorder.setSampleRate(sampleAudioRateInHz);
        recorder.setFrameRate(VIDEO_FRAME_RATE);
        recorder.setVideoOption("preset", "ultrafast");

        // Default format
        //recorder.setSampleRate(sampleAudioRateInHz);
        //recorder.setFrameRate(frameRate);
        // Set in the surface changed method

        Log.i(TAG, "recorder initialize success");

        if(audioRecordRunnable == null) {
            audioRecordRunnable = new AudioRecordRunnable();
            audioThread = new Thread(audioRecordRunnable);
            runAudioThread = true;
        }
    }

    // Start recording
    private void startRecorder() {
        Log.d(TAG, "Recorder started");
        initializeRecorder();

        try {
            recording = true;
            recorder.start();
            startTime = System.currentTimeMillis();
            audioThread.start();
            cameraView.startCameraPreview();
        } catch (FFmpegFrameRecorder.Exception e) {
            e.printStackTrace();
        }
    }

    // Stop recording
    private void stopRecorder() {

        runAudioThread = false;
        try {
            if(audioThread != null) {
                audioThread.join();
            }
        } catch (InterruptedException e) {
            e.printStackTrace();
        }
        audioRecordRunnable = null;
        audioThread = null;

        if (recorder != null && recording) {

            recording = false;
            Log.v(TAG,"Finishing recording, calling stop and release on recorder");
            try {
                recorder.stop();
            } catch (FFmpegFrameRecorder.Exception e) {
                e.printStackTrace();
            }
        }
    }

    private void destroyStreamerFromFragment() {
        destroyCamera();
        destroyRecorder();
    }

    private void destroyRecorder() {
        if(recorder != null) {
            try {
                recorder.stop();
                recorder.release();
                recorder = null;
            } catch (FFmpegFrameRecorder.Exception e) {
                e.printStackTrace();
            }
        }
    }

    private void destroyCamera() {
        if(cameraDevice != null) {
            Log.d(TAG, "Camera released!");
            cameraDevice.stopPreview();
            cameraView.getHolder().removeCallback(cameraView);
            cameraDevice.setPreviewCallback(null);
            cameraView.getCamera().release();
            cameraView.setCamera(null);
            cameraDevice.release();
            cameraDevice = null;
        }
    }

    public void setRTMPLink(String rtmpLink) {
        this.rtmpLink = rtmpLink;
    }

    /**
     * This set of public functions control the video streamer within the fragment
     */
    public class StreamVideoControls {

        public void startStreaming() {
            if(isInitialized) {
                Log.d(TAG, "Initialize completed");
                startRecorder();
            } else {
                Log.d(TAG, "Initialize not complete, streamWhenReady");
                streamWhenReady = true;
            }
        }

        public void stopStreaming() {
            stopRecorder();
        }

        public void destroyStreamer() {
            destroyStreamerFromFragment();
        }

        public void toggleCamera() {
            toggleCameraFromFragment();
        }

    }

    public interface OnStreamVideoFragmentListener {
        void streamVideoFragmentReady(StreamVideoControls control);
    }
}