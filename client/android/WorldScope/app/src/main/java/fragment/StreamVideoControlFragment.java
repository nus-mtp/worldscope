package fragment;

import android.animation.Animator;
import android.animation.AnimatorListenerAdapter;
import android.content.Context;
import android.graphics.drawable.Drawable;
import android.os.Bundle;
import android.support.design.widget.FloatingActionButton;
import android.support.v4.app.Fragment;
import android.util.Log;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.os.Vibrator;
import com.litmus.worldscope.R;
import java.util.Timer;
import java.util.TimerTask;

/**
 * A simple {@link Fragment} subclass.
 * Activities that contain this fragment must implement the
 * {@link StreamVideoControlFragment.OnStreamVideoControlFragmentListener} interface
 * to handle interaction events.
 */
public class StreamVideoControlFragment extends Fragment {

    private final String TAG = "StreamVideoControl";

    private Drawable recordDrawable;
    private Drawable pauseDrawable;

    private View view;
    private OnStreamVideoControlFragmentListener listener;
    private FloatingActionButton fabRecordButton;
    private boolean isBlocked;
    private boolean isRecording;
    private boolean isShown;
    private Timer timer;
    private TimerTask timerTask;

    public StreamVideoControlFragment() {
        // Required empty public constructor
    }

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
    }

    @Override
    public View onCreateView(LayoutInflater inflater, ViewGroup container,
                             Bundle savedInstanceState) {
        // Inflate the layout for this fragment
        view = inflater.inflate(R.layout.fragment_stream_video_control, container, false);

        // Hide view until stream is created
        view.setVisibility(View.GONE);

        // Initialize recording
        isRecording = false;

        // Get drawable icons for record button
        recordDrawable = getResources().getDrawable(R.drawable.ic_record_button);
        pauseDrawable= getResources().getDrawable(R.drawable.ic_pause);

        // Get record button
        fabRecordButton = (FloatingActionButton) view.findViewById(R.id.fabRecordButton);

        // Add click functionality to the button
        fabRecordButton.setOnClickListener(new View.OnClickListener() {
            public void onClick(View v) {
                if(isBlocked) {
                    Log.d(TAG, "Controls are block");
                    return;
                }
                isRecording = changeRecordButtonState(isRecording);
                listener.onStreamRecordButtonShortPress();

                // Keep controls alive again
                restartHideButtonTimerTask();
            }
        });

        // Add long press functionality to the confirmStopStream Button
        fabRecordButton.setOnLongClickListener(new View.OnLongClickListener() {
            public boolean onLongClick(View v) {

                if(isBlocked) {
                   Log.d(TAG, "Controls are block");
                   return true;
                }

                // Feedback to show long click engaged
                Vibrator vibrator = (Vibrator) getActivity().getSystemService(Context.VIBRATOR_SERVICE);
                // Vibrate for 300 milliseconds
                vibrator.vibrate(500);

                // Block the UI controls until stop stream is resolved
                isBlocked = true;

                listener.onStreamRecordButtonLongPress();

                // Keep controls alive again
                restartHideButtonTimerTask();
                return true;
            }
        });

        return view;
    }

    @Override
    public void onAttach(Context context) {
        super.onAttach(context);
        if (context instanceof OnStreamVideoControlFragmentListener) {
            listener = (OnStreamVideoControlFragmentListener) context;
        } else {
            throw new RuntimeException(context.toString()
                    + " must implement OnFragmentInteractionListener");
        }
    }

    @Override
    public void onDetach() {
        super.onDetach();
        listener = null;
        if(timer != null) {
            timer.cancel();
        }
    }

    /**
     * If button is recording, change icon into "||" icon
     * else change it into the "O" icon
     * @param isRecording
     */
    private boolean changeRecordButtonState(boolean isRecording) {

        // If previously is recording (icon is pause), change to play
        if(isRecording) {
            fabRecordButton.setImageDrawable(recordDrawable);
        } else {
            fabRecordButton.setImageDrawable(pauseDrawable);
        }

        return !isRecording;
    }

    public void unBlockControls() {
        isBlocked = false;
    }

    private void startStreaming() {
        // Start recording
        isRecording = true;
        showControls();
        setFadeButtonTimerTask();
    }

    public void tutorialForceShow() {
        cancelFadeButtonTimerTask();
        showControls();
        isBlocked = true;
    }

    public void tutorialCompleted() {
        unBlockControls();
        Log.d(TAG, "isBlock: " + isBlocked);
        startStreaming();
    }

    // Initialize and run hide controls every 5 secs
    private void setFadeButtonTimerTask() {
        timer = new Timer();
        timerTask = new TimerTask() {
            public void run() {
                hideControls();
            }
        };

        // Starts hiding controls every 3000ms ~ 3s
        timer.schedule(timerTask, 3000, 3000);
    }

    public void toggleControlVisibility() {

        restartHideButtonTimerTask();
    }

    private void cancelFadeButtonTimerTask() {
        if(timer != null) {
            timer.cancel();
        }
    }

    // Interrupt and restart the hide button task
    private void restartHideButtonTimerTask() {
        showControls();
        // Touch event may occur before initialization complete
        if(timer != null) {
            timer.cancel();
        }
        setFadeButtonTimerTask();
    }

    // Show the control
    private void showControls() {
        isShown = true;
        getActivity().runOnUiThread(new Runnable() {
            @Override
            public void run() {
                view.animate()
                        .alpha(1.0f)
                        .setDuration(150)
                        .setListener(new AnimatorListenerAdapter() {
                            @Override
                            public void onAnimationEnd(Animator animation) {
                                super.onAnimationEnd(animation);
                                view.setVisibility(View.VISIBLE);
                            }
                        });
            }
        });
    }

    // Hide the control
    private void hideControls() {
        isShown = false;
        getActivity().runOnUiThread(new Runnable() {
            @Override
            public void run() {
                view.animate()
                        .alpha(0.0f)
                        .setDuration(150)
                        .setListener(new AnimatorListenerAdapter() {
                            @Override
                            public void onAnimationEnd(Animator animation) {
                                super.onAnimationEnd(animation);
                                view.setVisibility(View.GONE);
                            }
                        });
            }
        });
    }

    /**
     * This interface must be implemented by activities that contain this
     * fragment to allow an interaction in this fragment to be communicated
     * to the activity and potentially other fragments contained in that
     * activity.
     * <p/>
     * See the Android Training lesson <a href=
     * "http://developer.android.com/training/basics/fragments/communicating.html"
     * >Communicating with Other Fragments</a> for more information.
     */
    public interface OnStreamVideoControlFragmentListener {
        // Pause the video stream
        void onStreamRecordButtonShortPress();

        // Stop the video stream
        void onStreamRecordButtonLongPress();
    }
}
