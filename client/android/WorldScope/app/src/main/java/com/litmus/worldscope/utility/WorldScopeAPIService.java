package com.litmus.worldscope.utility;

import android.content.Context;
import android.util.Log;

import com.litmus.worldscope.model.WorldScopeCreatedStream;
import com.litmus.worldscope.model.WorldScopeUser;
import com.litmus.worldscope.model.WorldScopeViewStream;

import java.util.ArrayList;
import java.util.List;
import retrofit2.Call;
import retrofit2.http.Body;
import retrofit2.http.GET;
import retrofit2.http.POST;
import retrofit2.http.Query;

public class WorldScopeAPIService {

    private static final String TAG = "WorldScopeAPIService";

    // Server address
    public static final String WorldScopeURL = "http://54.179.170.132:3000";

    //public static final String WorldScopeURL = "http://kyleasuspc:3000";

    // Current cookie for this session
    // Retrived from the save cookie interceptor in WorldScopeRestAPI
    private static String currentCookie;

    private static WorldScopeUser currentUser;

    // REST API Routes
    private static final String loginRoute = "/api/users/login";
    private static final String logoutRoute = "/api/users/logout";
    private static final String streamsRoute = "/api/streams";

    // WorldScope App Id
    private static final String appId = "123456789";

    // WorldScope RequestUser

    private static ArrayList<OnUserRequestListener> userRequestListeners = new ArrayList<>();

    // API interface requird by Retrofit to make the calls
    public interface WorldScopeAPIInterface {
        @POST(loginRoute)
        Call<WorldScopeUser> loginUser(@Body LoginUserRequest body);

        @GET(logoutRoute)
        Call<WorldScopeUser> logoutUser();

        /**
         * Method to get streams
         * @param state - Possible values: live, done, all
         * @param sort - Possible values: time, viewers, title
         * @param order - Possible values: desc, asc
         * @return streams - A list of streams
         */
        @GET(streamsRoute)
        Call<List<WorldScopeViewStream>> getStreams(@Query("state") String state, @Query("sort") String sort, @Query("order") String order);

        /**
         * Method to create a stream
         * @param body - Instance of PostStreamRequest with title and description, required
         * @return stream - Newly created Stream
         */
        @POST(streamsRoute)
        Call<WorldScopeCreatedStream> postStream(@Body PostStreamRequest body);

        /**
         * Method to end a stream
         * @param body - Instance of PostStreamEndRequest with streamId, required
         * @return void
         */
        @POST(streamsRoute)
        Call<Object> postStreamEnd(@Body PostStreamEndRequest body);


    }

    public interface OnUserRequestListener {
        void getUser(WorldScopeUser user);
    }

    // Class to set body of login request
    public static class LoginUserRequest {
        private final String accessToken;
        private final String appId;

        public LoginUserRequest(String accessToken) {
            this.accessToken = accessToken;
            this.appId = WorldScopeAPIService.appId;
        }
    }

    /*
        Class to set body of post stream request
        Description is optional
    */

    public static class PostStreamRequest {
        private final String title;
        private final String description;

        public PostStreamRequest(String title, String description) {
            this.title= title;
            this.description = description;
        }
    }

    /*
        Class to set body of post stream end request
    */

    public static class PostStreamEndRequest {
        private final String streamId;

        public PostStreamEndRequest(String streamId) {
            this.streamId= streamId;
        }
    }

    // Cookies methods
    public static String getCookie() {
        return currentCookie;
    }

    public static void setCookie(String cookie) {
        currentCookie = cookie;
    }

    public static void resetCookie() {
        currentCookie = null;
    }

    public static void requestUser() {
        if(currentUser != null) {


            Log.d(TAG, "Can return user");
            Log.d(TAG, currentUser.toString());
            Log.d(TAG, "" + userRequestListeners.size());
            for(OnUserRequestListener userRequestListener: userRequestListeners) {
                Log.i(TAG, "Returning real user");
                userRequestListener.getUser(currentUser);
            }
        } else {

            Log.d(TAG, "No user");
            requestUserThroughAPI();
        }
    }

    private static void requestUserThroughAPI() {

        WorldScopeUser currentUser = new WorldScopeUser();
        currentUser.setAlias("Dummy user");

        for(OnUserRequestListener userRequestListener: userRequestListeners) {
            Log.d(TAG, "Returning dummy user");
            userRequestListener.getUser(currentUser);
        }
    }

    public static void registerRequestUser(Context listener) {
        if(listener instanceof OnUserRequestListener) {
            Log.d(TAG, "Registering OnUserRequestListener");
            userRequestListeners.add((OnUserRequestListener) listener);
        }
    }

    public static void setUser(WorldScopeUser user) {
        currentUser = user;
    }

    public static void resetUser() {
        currentUser = null;
    }
}
