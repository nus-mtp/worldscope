package com.litmus.worldscope;

import android.content.Context;
import android.content.Intent;
import android.os.Bundle;
import android.support.v4.app.Fragment;
import android.support.v4.widget.SwipeRefreshLayout;
import android.util.Log;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.AdapterView;
import android.widget.ArrayAdapter;
import android.widget.ImageView;
import android.widget.ListView;
import android.widget.TextView;
import android.widget.Toast;

import com.litmus.worldscope.model.WorldScopeUser;
import com.litmus.worldscope.model.WorldScopeViewStream;
import com.squareup.picasso.Picasso;

import java.util.ArrayList;
import java.util.List;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

/**
 * A placeholder fragment containing a simple view.
 */
public class StreamRefreshListFragment extends Fragment {

    private final String TAG = "StreamRefreshList";

    private final String APP_SERVER_GET_STREAMS_CHECK_INTERNET_FAILED_MSG = "Failed to get streams, please check your internet connection";

    private final String APP_SERVER_GET_STREAMS_SERVER_DOWN_FAILED_MSG = "Failed to get streams, please try again later";

    /**
     * The fragment argument representing the section number for this
     * fragment.
     */
    private static final String ARG_SECTION_NUMBER = "section_number";

    private int sectionNumber;
    private ListView listView;
    private SwipeRefreshLayout swipeRefreshLayout;
    private WorldScopeStreamAdapter worldScopeStreamAdapter;
    private ArrayList<WorldScopeViewStream> streams;

    /**
     * Returns a new instance of this fragment for the given section
     * number.
     */
    public static StreamRefreshListFragment newInstance(int sectionNumber) {

        StreamRefreshListFragment fragment = new StreamRefreshListFragment();
        Bundle args = new Bundle();
        args.putInt(ARG_SECTION_NUMBER, sectionNumber);
        fragment.setArguments(args);
        fragment.sectionNumber = sectionNumber;
        fragment.sectionNumber = sectionNumber;
        return fragment;
    }

    public StreamRefreshListFragment() {
    }

    @Override
    public View onCreateView(LayoutInflater inflater, ViewGroup container,
                             Bundle savedInstanceState) {
        // Inflate the fragment with the XML layout
        View rootView = inflater.inflate(R.layout.fragment_stream_list, container, false);

        // Initiate the streams array if not already initialized
        if(streams == null) {
            streams = new ArrayList<>();
        }

        // Load streams data
        getStreamsData();

        // Set the WorldScopeStreamAdapter into ListView
        swipeRefreshLayout = (SwipeRefreshLayout) rootView.findViewById(R.id.swipeRefreshLayout);
        listView = (ListView) rootView.findViewById(R.id.streamListView);

        worldScopeStreamAdapter = new WorldScopeStreamAdapter(getActivity(), R.layout.fragment_stream_list_item, streams);
        listView.setAdapter(worldScopeStreamAdapter);

        // Set the onRefreshListener into swipeRefreshLayout
        swipeRefreshLayout.setOnRefreshListener(new SwipeRefreshLayout.OnRefreshListener() {
            @Override
            public void onRefresh() {
                // Adds one more dummy when refresh
                getStreamsData();
            }
        });

        // Set the callback action when listView item is clicked
        listView.setOnItemClickListener(new AdapterView.OnItemClickListener() {
            @Override
            public void onItemClick(AdapterView<?> parent, View view, int position, long id) {
                // Get stream data and pass into ViewActivity
                WorldScopeViewStream selectedStream = streams.get(position);
                Log.d(TAG, "Stream selected");
                Log.d(TAG, selectedStream.toString());

                redirectToViewActivity(selectedStream);
            }
        });

        return rootView;
    }

    // Passes a stream into ViewActivity
    private void redirectToViewActivity(WorldScopeViewStream stream) {
        Intent intent = new Intent(getActivity(), ViewActivity.class);
        intent.putExtra("stream", stream);
        startActivity(intent);
    }

    private void getStreamsData() {

        // Make a dummy call to backend
        Log.d(TAG, "Getting Streams");
        Call<List<WorldScopeViewStream>> call = new WorldScopeRestAPI(getActivity()).buildWorldScopeAPIService().getStreams("live", "time", "desc");
        call.enqueue(new Callback<List<WorldScopeViewStream>>() {
            @Override
            public void onResponse(Response<List<WorldScopeViewStream>> response) {
                Log.d(TAG, "GOT RESPONSE");
                Log.d(TAG, response.message());

                if (response.isSuccess()) {
                    Log.d(TAG, "RESPONSE SUCCESS FOR TAB: " + sectionNumber + " with " + response.body().size() + " streams");

                    streams.clear();

                    for (WorldScopeViewStream stream : response.body()) {
                        streams.add(stream);
                    }
                    worldScopeStreamAdapter.notifyDataSetChanged();

                } else {
                    Log.d(TAG, "RESPONSE FAIL");
                    Toast toast = Toast.makeText(getContext(), APP_SERVER_GET_STREAMS_SERVER_DOWN_FAILED_MSG, Toast.LENGTH_SHORT);
                    toast.show();
                }

                swipeRefreshLayout.setRefreshing(false);
            }

            @Override
            public void onFailure(Throwable t) {
                Log.d(TAG, "NO RESPONSE");
                t.printStackTrace();
                swipeRefreshLayout.setRefreshing(false);
                Toast toast = Toast.makeText(getContext(), APP_SERVER_GET_STREAMS_CHECK_INTERNET_FAILED_MSG, Toast.LENGTH_SHORT);
                toast.show();
            }
        });
    }

    private class WorldScopeStreamAdapter extends ArrayAdapter<WorldScopeViewStream> {

        private Context context;
        private int layoutResourceId;
        private ArrayList<WorldScopeViewStream> data;

        public WorldScopeStreamAdapter(Context context, int layoutResourceId, ArrayList<WorldScopeViewStream> data) {
            super(context, layoutResourceId, data);
            this.context = context;
            this.layoutResourceId = layoutResourceId;
            this.data = data;
        }

        /**
         * Override getView method in ArrayAdapter to configure how the view will look
         */

        @Override
        public View getView(int position, View convertView, ViewGroup parent) {
            // Get the item to display from data given position
            WorldScopeViewStream stream = data.get(position);

            /**
             * Implement viewHolder pattern to cache the view to reduce calls to findViewById(),
             * improving loading and response time
             *
             * ViewHolder patterns involve creating a class containing each individual elements that
             * can be found in the XML layout and using it to 'hold' the view to reduce calls to
             * findViewById()
             *
             * Check if convertView is null, if null then inflate and set viewHolder
             */
            ViewHolder viewHolder;
            if(convertView == null) {
                LayoutInflater inflater = LayoutInflater.from(getContext());
                convertView = inflater.inflate(R.layout.fragment_stream_list_item, parent, false);

                viewHolder = new ViewHolder();
                viewHolder.thumbnailImageView = (ImageView) convertView.findViewById(R.id.streamThumbnailImageView);
                viewHolder.titleTextView = (TextView) convertView.findViewById(R.id.streamTitle);
                viewHolder.ownerTextView = (TextView) convertView.findViewById(R.id.streamOwner);
                viewHolder.createdAtTextView = (TextView) convertView.findViewById(R.id.startTime);
                viewHolder.totalViewerTextView = (TextView) convertView.findViewById(R.id.numOfViewers);

                // Access convertView's XML elements now using viewHolder
                convertView.setTag(viewHolder);
            } else {
                viewHolder = (ViewHolder) convertView.getTag();
            }

            // Set text data into the view
            viewHolder.titleTextView.setText(stream.getTitle());
            //viewHolder.ownerTextView.setText(stream.getOwner().getAlias());
            viewHolder.createdAtTextView.setText(stream.getCreatedAt().toString());
            viewHolder.totalViewerTextView.setText(String.valueOf(stream.getTotalViewers()));

            // Use Picasso to set thumbnail image
            Picasso.with(viewHolder.thumbnailImageView.getContext())
                    .load(stream.getThumbnailLink())
                    .into(viewHolder.thumbnailImageView);

            return convertView;
        }

    }

    private static class ViewHolder {
        ImageView thumbnailImageView;
        TextView titleTextView;
        TextView ownerTextView;
        TextView createdAtTextView;
        TextView totalViewerTextView;
    }
}