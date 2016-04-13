package fragment;


import android.content.SharedPreferences;
import android.os.Bundle;
import android.preference.PreferenceManager;
import android.support.v4.app.Fragment;
import android.util.Log;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.CheckBox;

import com.litmus.worldscope.R;

import java.util.HashSet;

/**
 * A simple {@link Fragment} subclass.
 */
public class TutorialFragment extends Fragment {

    final String TAG = "TutorialFragment";
    final String SHOW_TUTORIAL_KEY = "SHOW_TUTORIAL";
    final boolean NO_SHOW = false;
    final boolean DEFAULT_VALUE = true;
    TutorialFragmentCompletionListener listener;
    View view;
    android.content.SharedPreferences pm;

    public TutorialFragment() {
        // Required empty public constructor
    }


    @Override
    public View onCreateView(LayoutInflater inflater, ViewGroup container,
                             Bundle savedInstanceState) {
        // Inflate the layout for this fragment
        view  = inflater.inflate(R.layout.fragment_tutorial, container, false);
        view.setVisibility(View.GONE);

        view.findViewById(R.id.tutorialButton).setOnClickListener(new View.OnClickListener() {
            public void onClick(View v) {
                hideTutorial();
            }
        });

        return view;
    }

    // If preference says do not show, hide the view
    public void initialize() {
        pm = PreferenceManager.getDefaultSharedPreferences(getActivity());

        boolean toShow = pm.getBoolean(SHOW_TUTORIAL_KEY, DEFAULT_VALUE);

        if(toShow) {
            Log.i(TAG, "Showing tutorial");
            view.setVisibility(View.VISIBLE);
        } else {
            Log.i(TAG, "Not showing tutorial");
            listener.onCompletedTutorial();
        }
    }

    public void setListener(TutorialFragmentCompletionListener listener) {
        this.listener = listener;
    }

    private void hideTutorial() {
        boolean hidePermanently = ((CheckBox)(view.findViewById(R.id.noShowCheckBox))).isChecked();
        SharedPreferences.Editor editor = PreferenceManager.getDefaultSharedPreferences(getActivity()).edit();

        if(hidePermanently) {
            Log.d(TAG, "Checked!");
            editor.clear();
            editor.putBoolean(SHOW_TUTORIAL_KEY, NO_SHOW);
            editor.apply();
        } else {
            Log.d(TAG, "No checked!");
        }

        pm = PreferenceManager.getDefaultSharedPreferences(getActivity());
        Log.d(TAG, "Have key? " + pm.contains(SHOW_TUTORIAL_KEY));
        Log.d(TAG, "Show tutorial? " + pm.getBoolean(SHOW_TUTORIAL_KEY, DEFAULT_VALUE));

        view.setVisibility(View.GONE);

        listener.onCompletedTutorial();
    }

    public interface TutorialFragmentCompletionListener {
        void onCompletedTutorial();
    }

}
