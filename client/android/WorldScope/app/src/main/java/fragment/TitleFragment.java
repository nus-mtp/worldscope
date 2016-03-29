package fragment;

import android.content.Context;
import android.os.Bundle;
import android.support.v4.app.Fragment;
import android.util.Log;
import android.view.LayoutInflater;
import android.view.MenuItem;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ImageButton;
import android.widget.ImageView;
import android.widget.PopupMenu;
import android.widget.TextView;

import com.litmus.worldscope.R;
import com.litmus.worldscope.utility.CircleTransform;
import com.litmus.worldscope.utility.FacebookWrapper;
import com.squareup.picasso.Picasso;

/**
 * Fragment that contains picture, stream title, stream owner and menu button
 */
public class TitleFragment extends Fragment implements FacebookWrapper.FacebookWrapperProfilePictureCallback {

    private static final String TAG = "TitleFragment";
    private OnTitleFragmentToggleButtonListener mListener;
    private View view;

    public TitleFragment() {
        // Required empty public constructor
    }

    public static TitleFragment newInstance() {
        TitleFragment fragment = new TitleFragment();
        Bundle args = new Bundle();
        return fragment;
    }

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
    }

    @Override
    public View onCreateView(LayoutInflater inflater, ViewGroup container,
                             Bundle savedInstanceState) {
        // Inflate the layout for this fragment
        view = inflater.inflate(R.layout.fragment_title, container, false);
        // Hide until stream is created
        view.setVisibility(View.GONE);

        return view;
    }

    @Override
    public void onAttach(Context context) {
        super.onAttach(context);
        if (context instanceof OnTitleFragmentToggleButtonListener) {
            mListener = (OnTitleFragmentToggleButtonListener) context;
        }
    }

    @Override
    public void onDetach() {
        super.onDetach();
        mListener = null;
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

    // Loads in Profile Picture Url, alias and stream title
    public void loadStreamDetails(boolean isCreator, boolean isSubscribed, String userId, String alias, String title) {

        if(!isCreator) {
            changeFollowButtonState(isSubscribed);
        } else {
            Log.d(TAG, "Changing to camera");
            view.findViewById(R.id.toggleButton).setVisibility(View.GONE);
            //view.findViewById(R.id.toggleButton).setBackgroundResource(R.drawable.ic_camera_alt);
        }

        view.findViewById(R.id.toggleButton).setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                mListener.onToggleButtonClicked();
            }
        });

        if(userId != null && !userId.isEmpty()) {
            FacebookWrapper.getInstance().setFacebookWrapperProfilePictureCallbackListener(this);
            FacebookWrapper.getInstance().getProfilePictureUrl(userId);
        }

        if(alias != null && !alias.isEmpty()) {
            ((TextView)view.findViewById(R.id.titleNameTextView)).setText(alias);
        }


        if(title != null && !title.isEmpty()) {
            ((TextView)view.findViewById(R.id.titleTextView)).setText(title);
        }
    }

    public void showTitleUI() {
        view.setVisibility(View.VISIBLE);
    }

    private void loadProfilePictureIntoView(String profilePictureUrl) {
        // Get the view for profile picture
        final ImageView profilePicture = (ImageView) view.findViewById(R.id.titleImageView);

        // Set the image to the imageView and trim it to a circle
        Picasso.with(profilePicture.getContext())
                .load(profilePictureUrl)
                .transform(new CircleTransform())
                .into(profilePicture);
    }

    public void changeFollowButtonState(boolean isSubcribed) {
        if(isSubcribed) {
            view.findViewById(R.id.toggleButton).setBackgroundResource(R.drawable.ic_heart_full);
        } else {
            view.findViewById(R.id.toggleButton).setBackgroundResource(R.drawable.ic_heart_hollow);
        }
    }

    // On Facebook Profile Picture retrieval
    @Override
    public void onProfilePictureUrl(String profilePictureUrl) {
        loadProfilePictureIntoView(profilePictureUrl);
    }

    public interface OnTitleFragmentToggleButtonListener {
        void onToggleButtonClicked();
    }
}
