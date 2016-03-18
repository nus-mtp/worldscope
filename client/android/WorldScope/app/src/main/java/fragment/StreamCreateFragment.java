package fragment;

import android.content.Context;
import android.os.Bundle;
import android.support.v4.app.Fragment;
import android.util.Log;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.view.inputmethod.InputMethodManager;
import android.widget.EditText;
import android.widget.Toast;

import com.litmus.worldscope.R;
import com.litmus.worldscope.model.WorldScopeCreatedStream;
import com.litmus.worldscope.utility.WorldScopeAPIService;
import com.litmus.worldscope.utility.WorldScopeRestAPI;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;


/**
 * A simple fragment that creates a stream base on the form a user fill
 */
public class StreamCreateFragment extends Fragment {

    private static final String TAG = "StreamCreateFragment";

    private static final String WRONG_TITLE_MESSAGE = "Please enter a title";

    private static final String STREAM_FAILED_MESSAGE = "Failed to get a response from WorldScope servers, please try again later";

    private static final String STREAM_STARTED_MESSAGE = "You're LIVE! Hold Record Button to stop streaming";

    private static final boolean TERMINATE_STREAM = true;

    private static final boolean DO_NOT_TERMINATE_STREAM = false;

    private Context context;
    private WorldScopeCreatedStream createdStream;
    private OnStreamCreateFragmentListener listener;
    private EditText titleInput;
    private EditText descriptionInput;
    private View streamCreateView;
    private View streamStopView;

    public StreamCreateFragment() {
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
        View view = inflater.inflate(R.layout.fragment_stream_create, container, false);

        titleInput = (EditText)view.findViewById(R.id.titleInput);

        descriptionInput = (EditText)view.findViewById(R.id.descriptionInput);

        // Add functionality to the cancel button
        view.findViewById(R.id.cancelStreamButton).setOnClickListener(new View.OnClickListener() {
            public void onClick(View v) {
                listener.onCancelStreamButtonClicked();
            }
        });

        // Add functionality to the stream button
        view.findViewById(R.id.createStreamButton).setOnClickListener(new View.OnClickListener() {
            public void onClick(View v) {

                if (validateInput()) {
                    hideKeyboard();
                    createStream();
                } else {
                    Toast toast = Toast.makeText(context, WRONG_TITLE_MESSAGE, Toast.LENGTH_LONG);
                    toast.show();
                }
            }
        });

        // Add functionality to the confirmStopStream Button
        view.findViewById(R.id.confirmStopStreamButton).setOnClickListener(new View.OnClickListener() {
            public void onClick(View v) {
                Log.d(TAG, "Record button press detected");
                stopStream();
            }
        });

        // Add functionality to the cancelStopStream Button
        view.findViewById(R.id.cancelStopStreamButton).setOnClickListener(new View.OnClickListener() {
            public void onClick(View v) {
                Log.d(TAG, "Record button long press detected");
                cancelStopStream();
            }
        });

        streamCreateView = view.findViewById(R.id.streamCreateForm);

        // Hide the streamStopView by default
        streamStopView = view.findViewById(R.id.streamStopForm);
        streamStopView.setVisibility(View.GONE);

        return view;
    }

    @Override
    public void onAttach(Context context) {
        super.onAttach(context);
        if (context instanceof OnStreamCreateFragmentListener) {
            this.context = context;
            listener = (OnStreamCreateFragmentListener) context;
        } else {
            throw new RuntimeException(context.toString()
                    + " must implement OnFragmentInteractionListener");
        }
    }

    @Override
    public void onDetach() {
        super.onDetach();
        listener = null;
    }

    // Hides the keyboard
    private void hideKeyboard() {
        //Minimize the soft keyboard
        View view = getActivity().getCurrentFocus();
        if (view != null) {
            InputMethodManager imm = (InputMethodManager)getActivity().getSystemService(Context.INPUT_METHOD_SERVICE);
            imm.hideSoftInputFromWindow(view.getWindowToken(), 0);
        }
    }

    // Validate that title is not blank
    private boolean validateInput() {

        if(titleInput.getText().toString().length() > 0) {
            Log.d(TAG, "Title is not empty");
            return true;
        } else {
            return false;
        }

    }

    // Create a POST request to server for a stream
    private void createStream() {
        String title = titleInput.getText().toString();
        String description = descriptionInput.getText().toString();
        if(description.length() == 0) {
            description = null;
        }

        // Instantiate an instance of the call with the parameters
        Call<WorldScopeCreatedStream> call = new WorldScopeRestAPI(context)
                .buildWorldScopeAPIService()
                .postStream(new WorldScopeAPIService.PostStreamRequest(title, description));
        // Make call to create stream
        call.enqueue(new Callback<WorldScopeCreatedStream>() {
            @Override
            public void onResponse(Response<WorldScopeCreatedStream> response) {
                if (response.isSuccess()) {
                    Log.d(TAG, "Success!");
                    Log.d(TAG, "" + response.body().toString());

                    // Save an instance of the createdStream
                    createdStream = response.body();

                    listener.onStreamCreationSuccess(response.body().getStreamLink(),
                            response.body().getAppInstance());

                    hideStreamCreateView();
                    Toast toast = Toast.makeText(context, STREAM_STARTED_MESSAGE, Toast.LENGTH_LONG);
                    toast.show();
                } else {
                    Log.d(TAG, "Failure" + response.code() + ": " + response.message());
                    Toast toast = Toast.makeText(context, STREAM_FAILED_MESSAGE, Toast.LENGTH_LONG);
                    toast.show();
                }
            }

            @Override
            public void onFailure(Throwable t) {
                Log.d(TAG, "Failure: " + t.getMessage());
                Toast toast = Toast.makeText(context, STREAM_FAILED_MESSAGE, Toast.LENGTH_LONG);
                toast.show();
            }
        });
    }

    // Create a POST request to server to end stream
    private void endStream() {
        String streamId = createdStream.getStreamId();

        // Instantiate an instance of the call with the parameters
        Call<Object> call = new WorldScopeRestAPI(context)
                .buildWorldScopeAPIService()
                .postStreamEnd(new WorldScopeAPIService.PostStreamEndRequest(streamId));

        // Make call to create stream
        call.enqueue(new Callback<Object>() {
            @Override
            public void onResponse(Response<Object> response) {
                if (response.isSuccess()) {
                    Log.d(TAG, "Successfully updated API Server to end stream");
                    Log.d(TAG, "" + response.body().toString());
                } else {
                    Log.d(TAG, "Failure" + response.code() + ": " + response.message());
                    Toast toast = Toast.makeText(context, STREAM_FAILED_MESSAGE, Toast.LENGTH_LONG);
                    toast.show();
                }
            }

            @Override
            public void onFailure(Throwable t) {
                Log.d(TAG, "Failure: " + t.getMessage());
                Toast toast = Toast.makeText(context, STREAM_FAILED_MESSAGE, Toast.LENGTH_LONG);
                toast.show();
            }
        });
    }

    // Shows the modal asking user if stream should be terminated
    public void confirmStreamTermination() {
        streamStopView.setVisibility(View.VISIBLE);
    }

    // Stop the ongoing stream
    private void stopStream() {
        // Update API Server
        endStream();

        listener.onStreamTerminationResolved(TERMINATE_STREAM);
    }

    // Hide the modal asking user to stop stream
    private void cancelStopStream() {

        listener.onStreamTerminationResolved(DO_NOT_TERMINATE_STREAM);
        streamStopView.setVisibility(View.GONE);
    }

    private void hideStreamCreateView() {
        streamCreateView.setVisibility(View.GONE);
    }

    /**
     * This interface contains the two key functionalities of this fragment and must be implemented
     * by any activities containing this fragment
     */
    public interface OnStreamCreateFragmentListener {
        // Implement to receive update upon stream creation success
        void onStreamCreationSuccess(String rtmpLink, String appInstance);

        // Implement to handle CancelStreamButton
        void onCancelStreamButtonClicked();

        void onStreamTerminationResolved(boolean isTerminated);
    }
}
