package com.litmus.worldscope;

import android.os.Bundle;
import android.support.v7.app.AppCompatActivity;
import android.util.Log;
import com.litmus.worldscope.model.WorldScopeViewStream;
import fragment.ViewVideoFragment;

public class ViewActivity extends AppCompatActivity implements
        ViewVideoFragment.OnViewVideoFragmentInteractionListener {

    private final String TAG = "ViewActivity";

    // Stream currently viewing
    private WorldScopeViewStream viewStream;
    // String of mpd link
    private String mpdLink;
    private android.support.v4.app.FragmentManager sfm;
    private ViewVideoFragment viewVideoFragment;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_view);

        viewStream = getIntent().getParcelableExtra("stream");
        mpdLink = viewStream.getViewLink();
        sfm = getSupportFragmentManager();
        // Get viewVideoFragment
        viewVideoFragment = (ViewVideoFragment) sfm.findFragmentById(R.id.viewVideoFragment);

        Log.d(TAG, "Link to watch: " + mpdLink);
    }

    @Override
    public void onViewVideoFragmentReady() {
        // Sets the .mpd link
        viewVideoFragment.setMPDLink(mpdLink);
    }

}
