package fragment;

import android.animation.Animator;
import android.animation.AnimatorListenerAdapter;
import android.content.Context;
import android.os.Bundle;
import android.support.v4.app.Fragment;
import android.text.Html;
import android.util.Log;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ArrayAdapter;
import android.widget.EditText;
import android.widget.ImageButton;
import android.widget.ListView;
import android.widget.TextView;
import android.view.View.OnClickListener;

import com.litmus.worldscope.R;
import com.litmus.worldscope.utility.WorldScopeSocketService;

import org.json.JSONException;
import org.json.JSONObject;

import java.util.ArrayList;
import java.util.List;

/**
 * A simple {@link Fragment} subclass.
 * Activities that contain this fragment must implement the
 * {@link CommentFragment.OnCommentFragmentInteractionListener} interface
 * to handle interaction events.
 * Use the {@link CommentFragment#newInstance} factory method to
 * create an instance of this fragment.
 */
public class CommentFragment extends Fragment implements WorldScopeSocketService.OnJoinEventListener,
        WorldScopeSocketService.OnCommentEventListener,
        WorldScopeSocketService.OnLeaveEventListener {

    private static String TAG = "CommentFragment";

    private static int NO_RESOURCE_ID = -1;

    private Context context;

    private ImageButton sendButton;

    private EditText commentEditText;

    private View view;

    private String roomId;

    private String alias;

    private ListView commentListView;

    private List<WorldScopeComment> commentsList;

    private CommentArrayAdapter commentArrayAdapter;

    private OnCommentFragmentInteractionListener listener;

    public CommentFragment() {
        // Required empty public constructor
    }

    /**
     * Use this factory method to create a new instance of
     * this fragment using the provided parameters.
     *
     * @return A new instance of fragment CommentFragment.
     */
    // TODO: Rename and change types and number of parameters
    public static CommentFragment newInstance() {
        CommentFragment fragment = new CommentFragment();
        Bundle args = new Bundle();
        fragment.setArguments(args);
        return fragment;
    }

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        context = this.getActivity();
        Log.d(TAG, "CommentFragment created!");
    }

    @Override
    public View onCreateView(LayoutInflater inflater, ViewGroup container,
                             Bundle savedInstanceState) {
        // Inflate the layout for this fragment
        view = inflater.inflate(R.layout.fragment_comment, container, false);

        // Hide view until stream is created
        view.setVisibility(View.GONE);

        sendButton = (ImageButton) view.findViewById(R.id.send_button);

        commentEditText = (EditText) view.findViewById(R.id.commentEditText);

        // Get commentListView
        commentListView = (ListView) view.findViewById(R.id.commentListView);

        commentsList = new ArrayList<>();

        commentArrayAdapter = new CommentArrayAdapter(context, commentsList);

        commentListView.setAdapter(commentArrayAdapter);

        // Register as a listener
        Log.d(TAG, "Registering as socket listener");
        WorldScopeSocketService.registerListener(this);

        // Setup Send button
        setUpButton();
        return view;
    }

    private void setUpButton() {

        OnClickListener btnListener = new OnClickListener() {
            public void onClick(View v) {

                if(commentEditText.getText().toString() != null && commentEditText.getText().toString().length() != 0) {
                    Log.d(TAG, "Sending: " + commentEditText.getText().toString());
                    sendMessage(commentEditText.getText().toString());
                    commentEditText.setText("");
                }
            }
        };
        sendButton.setOnClickListener(btnListener);
    }

    private void sendMessage(String comment) {
        WorldScopeSocketService.emitComment(comment);
        //addToCommentList(new WorldScopeComment(alias, comment, "TIMESTAMP"));
    }

    private void addToCommentList(WorldScopeComment comment) {
        commentsList.add(comment);

        if(this.getActivity() != null) {
            this.getActivity().runOnUiThread(new Runnable() {
                public void run() {
                    commentListView.setSelection(commentArrayAdapter.getCount() - 1);
                }
            });
        }
    }

    @Override
    public void onAttach(Context context) {
        super.onAttach(context);
        if (context instanceof OnCommentFragmentInteractionListener) {
            listener = (OnCommentFragmentInteractionListener) context;
        } else {
            throw new RuntimeException(context.toString()
                    + " must implement OnFragmentInteractionListener");
        }
    }

    @Override
    public void onDetach() {
        super.onDetach();
        WorldScopeSocketService.emitLeave(roomId);
        WorldScopeSocketService.unregisterListener(this);
        listener = null;
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
    public interface OnCommentFragmentInteractionListener {
        // TODO: Update argument type and name
        void onFragmentInteraction();
    }

    @Override
    public void onJoinEventEmitted(String data) {
        Log.d(TAG, "Join event emitted: " + data);
    }

    @Override
    public void onCommentEventEmitted(String data) {
        Log.d(TAG, "Comment event received: " + data);
        try {
            JSONObject json = new JSONObject(data);
            String alias = json.getString("alias");
            String time = json.getString("time");
            String message = json.getString("message");
            String room = json.getString("room");

            // Check if room is correct before adding into comment list, prevent duplicates
            if(!room.equals(roomId)) {
                Log.d(TAG, "Message received from other rooms");
                Log.d(TAG, room + " | " + roomId);
                Log.d(TAG, json.toString());
            } else {
                addToCommentList(new WorldScopeComment(alias, message, time));
            }

        } catch (JSONException e) {
            e.printStackTrace();
        }
    }

    @Override
    public void onLeaveEventEmitted(String data) {
        Log.d(TAG, "Leave event emitted: " + data);
    }


    public void initialize() {
        showCommentUI();
    }

    // Join a room
    public void joinRoom(String roomId, String alias) {
        this.roomId = roomId;
        this.alias = alias;
        Log.d(TAG, "Joining room: " + roomId);
        WorldScopeSocketService.emitJoin(roomId);
    }

    // Show the control
    private void showCommentUI() {
        Log.d(TAG, "Showing Comment UI");
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

    private class CommentArrayAdapter extends ArrayAdapter<WorldScopeComment> {

        private final Context context;

        private final List<WorldScopeComment> comments;

        public CommentArrayAdapter(Context context, List<WorldScopeComment> comments) {
            super(context, NO_RESOURCE_ID, comments);
            this.context = context;
            this.comments = comments;
        }

        @Override
        public View getView(int position, View convertView, ViewGroup parent) {
            LayoutInflater inflater = (LayoutInflater) context
                    .getSystemService(Context.LAYOUT_INFLATER_SERVICE);
            View rowView = inflater.inflate(R.layout.fragment_comment_list_item, parent, false);
            TextView userCommentTextView = (TextView)rowView.findViewById(R.id.userComment);
            WorldScopeComment comment = comments.get(position);
            userCommentTextView.setText(buildHTMLComment(comment), TextView.BufferType.SPANNABLE);

            return rowView;
        }

        // Turn off touch from ListView
        public boolean areAllItemsEnabled() {
            return false;
        }

        public boolean isEnabled(int position) {
            return false;
        }

        private android.text.Spanned buildHTMLComment(WorldScopeComment comment) {
            return Html.fromHtml("<font color='#ffffff'><b>" + comment.getAlias() + "</b>: " + comment.getComment()+"</font>");
        }
    }

    private class WorldScopeComment {

        private String alias;
        private String comment;
        private String timestamp;

        public WorldScopeComment(String alias, String comment, String timestamp) {
            this.alias = alias;
            this.comment = comment;
            this.timestamp = timestamp;
        }

        public String getAlias() {
            return this.alias;
        }

        public String getComment() {
            return this.comment;
        }

        public String getTimestamp() {
            return this.timestamp;
        }
    }
}
