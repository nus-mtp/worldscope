package com.litmus.worldscope;

import android.content.Context;
import android.content.Intent;
import android.net.Uri;
import android.os.Bundle;
import android.support.v4.app.Fragment;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.Button;


/**
 * A simple {@link Fragment} subclass.
 * Activities that contain this fragment must implement the
 * {@link StreamCreateFragment.OnStreamCreateFragmentListener} interface
 * to handle interaction events.
 * Use the {@link StreamCreateFragment#newInstance} factory method to
 * create an instance of this fragment.
 */
public class StreamCreateFragment extends Fragment {

    private OnStreamCreateFragmentListener listener;

    public StreamCreateFragment() {
        // Required empty public constructor
    }

    /**
     * Use this factory method to create a new instance of
     * this fragment using the provided parameters.
     *
     * @return A new instance of fragment StreamCreateFragment.
     */
    // TODO: Rename and change types and number of parameters
    public static StreamCreateFragment newInstance() {
        StreamCreateFragment fragment = new StreamCreateFragment();
        Bundle args = new Bundle();
        fragment.setArguments(args);
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
        View view = inflater.inflate(R.layout.fragment_stream_create, container, false);

        view.findViewById(R.id.cancelStreamButton).setOnClickListener(new View.OnClickListener() {
            public void onClick(View v) {
                listener.onCancelStreamButtonClicked();
            }
        });
        return view;
    }

    @Override
    public void onAttach(Context context) {
        super.onAttach(context);
        if (context instanceof OnStreamCreateFragmentListener) {
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
    public interface OnStreamCreateFragmentListener {
        // Implement to receive update upon stream creation success
        void onStreamCreationSuccess(String rtmpLink);

        // Implement to handle CancelStreamButton
        void onCancelStreamButtonClicked();

    }
}
