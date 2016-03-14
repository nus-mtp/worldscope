package fragment;

import android.animation.Animator;
import android.animation.AnimatorListenerAdapter;
import android.content.Context;
import android.graphics.drawable.Drawable;
import android.net.Uri;
import android.os.Bundle;
import android.support.design.widget.FloatingActionButton;
import android.support.v4.app.Fragment;
import android.util.Log;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;

import com.litmus.worldscope.R;

import java.util.Timer;
import java.util.TimerTask;

/**
 * ViewVideoControlFragment contains the button to pause or continue a stream
 * Auto disappear within three seconds unless timer is reset
 */
public class ViewVideoControlFragment extends Fragment {


    private final String TAG = "StreamVideoControl";

    private Drawable playDrawable;
    private Drawable pauseDrawable;

    private View view;
    private OnViewVideoControlFragmentListener listener;
    private FloatingActionButton fabPauseButton;
    private boolean isShown;
    private boolean isWatching;
    private Timer timer;
    private TimerTask timerTask;

    public ViewVideoControlFragment() {
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
        view =  inflater.inflate(R.layout.fragment_view_video_control, container, false);

        //Get drawable icons for pause button
        playDrawable = getResources().getDrawable(R.drawable.ic_play_arrow);
        pauseDrawable = getResources().getDrawable(R.drawable.ic_pause);

        // Get pause button
        fabPauseButton = (FloatingActionButton) view.findViewById(R.id.fabPauseButton);

        // Set to watching state
        isWatching = true;

        // Add functionality to pauseButton
        fabPauseButton.setOnClickListener(new View.OnClickListener() {
            public void onClick(View v) {
                isWatching = changePauseButtonState(isWatching);
                listener.onViewPauseButtonPress();
                // Keep controls alive again
                restartHideButtonTimerTask();
            }
        });

        setFadeButtonTimerTask();

        return view;
    }

    @Override
    public void onAttach(Context context) {
        super.onAttach(context);
        if (context instanceof OnViewVideoControlFragmentListener) {
            listener = (OnViewVideoControlFragmentListener) context;
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

    private boolean changePauseButtonState(boolean isWatching) {

        // If previously is recording (icon is pause), change to play
        if(isWatching) {
            fabPauseButton.setImageDrawable(playDrawable);
        } else {
            fabPauseButton.setImageDrawable(pauseDrawable);
        }

        return !isWatching;
    }

    // Initialize and run hide controls every 5 secs
    private void setFadeButtonTimerTask() {
        timer = new Timer();
        timerTask = new TimerTask() {
            public void run() {
                hideControls();
            }
        };

        // Starts hiding controls every 5000ms ~ 5s
        timer.schedule(timerTask, 5000, 5000);
    }

    public void toggleControlVisibility() {
        if(isShown) {
            // Hide control
            hideControls();
        } else {
            // Show control and reset the timer
            restartHideButtonTimerTask();
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
    public interface OnViewVideoControlFragmentListener {
        // TODO: Update argument type and name
        void onViewPauseButtonPress();
    }
}
