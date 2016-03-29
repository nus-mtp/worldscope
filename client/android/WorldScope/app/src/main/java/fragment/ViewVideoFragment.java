package fragment;

import android.content.Context;
import android.os.Bundle;
import android.support.v4.app.Fragment;
import android.util.DisplayMetrics;
import android.util.Log;
import android.util.Pair;
import android.view.LayoutInflater;
import android.view.SurfaceHolder;
import android.view.SurfaceView;
import android.view.View;
import android.view.ViewGroup;

import com.google.android.exoplayer.AspectRatioFrameLayout;
import com.google.android.exoplayer.util.Util;
import com.litmus.worldscope.R;
import com.litmus.worldscope.model.WorldScopeViewStream;
import com.litmus.worldscope.utility.LitmusPlayer;

/**
 * A simple {@link Fragment} subclass.
 * Activities that contain this fragment must implement the
 * {@link ViewVideoFragment.OnViewVideoFragmentInteractionListener} interface
 * to handle interaction events.
 */

public class ViewVideoFragment extends Fragment implements
        SurfaceHolder.Callback,
        LitmusPlayer.PlayerEventsListener {

    private final String TAG = "ViewVideoFragment";

    private OnViewVideoFragmentInteractionListener mListener;
    private String mpdLink;
    private View view;
    // Reference to LitmusPlayer
    private LitmusPlayer litmusPlayer;
    // Stream currently viewing
    private WorldScopeViewStream viewStream;
    private Context context;
    // User Agent string
    private String userAgent;
    // SurfaceView for video playback
    private SurfaceView surfaceView;
    private View shutterView;
    private AspectRatioFrameLayout videoFrame;
    private boolean isPlaying;


    public ViewVideoFragment() {
        // Required empty public constructor
    }


    @Override
    public View onCreateView(LayoutInflater inflater, ViewGroup container,
                             Bundle savedInstanceState) {

        super.onCreate(savedInstanceState);

        // Inflate the layout for this fragment
        view = inflater.inflate(R.layout.fragment_view_video, container, false);
        return view;
    }

    @Override
    public void onStart() {
        super.onStart();
        // Need to have mpdLink before preparing
        mListener.onViewVideoFragmentReady();
        prepareLitmusPlayer();
        prepareSurfaceView();
    }

    public void setMPDLink(String mpdLink) {
        this.mpdLink = mpdLink;
    }

    // Function to initialize LitmusPlayer by passing in .mpd URI
    private void prepareLitmusPlayer() {
        context = this.getActivity();
        userAgent = Util.getUserAgent(context, "ViewActivity");
        litmusPlayer = new LitmusPlayer(context, mpdLink, userAgent);
        litmusPlayer.addPlayerEventsListener(this);
        shutterView = view.findViewById(R.id.shutter);
        videoFrame = (AspectRatioFrameLayout) view.findViewById(R.id.video_frame);
        isPlaying = true;
        litmusPlayer.setPlayWhenReady(true);
    }

    // Function to prepare the SurfaceView by setting up the holder
    private void prepareSurfaceView() {
        surfaceView = (SurfaceView) view.findViewById(R.id.surface_view);
        surfaceView.getHolder().addCallback(this);
    }


    @Override
    public void onAttach(Context context) {
        super.onAttach(context);
        if (context instanceof OnViewVideoFragmentInteractionListener) {
            mListener = (OnViewVideoFragmentInteractionListener) context;
        } else {
            throw new RuntimeException(context.toString()
                    + " must implement OnFragmentInteractionListener");
        }
    }

    @Override
    public void onDetach() {
        super.onDetach();
        mListener = null;
        litmusPlayer.release();
    }


    // Implementation of LitmusPlayer PlayerEventListener
    @Override
    public void onVideoSizeChanged(int width, int height, int unappliedRotationDegrees,
                                   float pixelWidthHeightRatio) {

        Log.d(TAG, "Video width: " + height + ", video height: " + width);
        DisplayMetrics displaymetrics = new DisplayMetrics();
        getActivity().getWindowManager().getDefaultDisplay().getMetrics(displaymetrics);
        int deviceHeight = displaymetrics.heightPixels;
        int deviceWidth = displaymetrics.widthPixels;

        surfaceView.setLayoutParams(new android.widget.FrameLayout.LayoutParams(deviceWidth, deviceHeight));

        shutterView.setVisibility(View.GONE);
        //videoFrame.setAspectRatio(height == 0 ? 1 : (width * pixelWidthHeightRatio) / height);
    }

    // Implementation of SurfaceHolder Callback
    @Override
    public void surfaceCreated (SurfaceHolder holder) {

        Log.i(TAG, "Surface created");

        if (litmusPlayer != null) {
            litmusPlayer.setSurface(holder.getSurface());
            litmusPlayer.readyToPushSurface(LitmusPlayer.SURFACE_READY);
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

    // Function to toggle play / pause
    public void togglePause() {
        isPlaying = !isPlaying;
        litmusPlayer.setPlayWhenReady(isPlaying);
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

    public interface OnViewVideoFragmentInteractionListener {
        // TODO: Update argument type and name
        void onViewVideoFragmentReady();
    }
}