package com.litmus.worldscope.utility;

import android.content.Context;
import android.util.Log;

import com.litmus.worldscope.model.WorldScopeComment;
import com.litmus.worldscope.model.WorldScopeCreatedStream;
import com.litmus.worldscope.model.WorldScopeUser;
import com.litmus.worldscope.model.WorldScopeViewStream;

import java.util.ArrayList;
import java.util.List;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;
import retrofit2.http.Body;
import retrofit2.http.DELETE;
import retrofit2.http.GET;
import retrofit2.http.POST;
import retrofit2.http.Path;
import retrofit2.http.Query;

public class WorldScopeAPIService {

    private static final String TAG = "WorldScopeAPIService";

    // Server address
    public static final String WorldScopeURL = "http://54.169.110.179:3000";

    //public static final String WorldScopeURL = "http://kyleasuspc:3000";

    // Current cookie for this session
    // Retrived from the save cookie interceptor in WorldScopeRestAPI
    private static String currentCookie;

    private static WorldScopeUser currentUser;

    // REST API Routes
    private static final String loginRoute = "/api/users/login";
    private static final String logoutRoute = "/api/users/logout";
    private static final String streamsRoute = "/api/streams";
    private static final String subscriberStreamsRoute = "/api/streams/subscriptions";
    private static final String streamsEndRoute = "/api/streams/control/end";
    private static final String subscriptionsRoute = "/api/subscriptions/{userId}";
    private static final String commentsRoute = "api/comments/streams/{streamId}";
    private static final String meRoute = "api/users/me";

    // WorldScope App Id
    private static final String appId = "123456789";

    // WorldScope RequestUser

    private static ArrayList<OnUserRequestListener> userRequestListeners = new ArrayList<>();

    // API interface required by Retrofit to make the calls
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
         * Method to get streams from subscribers
         * @return streams - A list of streams
         */
        @GET(subscriberStreamsRoute)
        Call<List<WorldScopeViewStream>> getSubscriberStreams();

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
        @POST(streamsEndRoute)
        Call<Object> postStreamEnd(@Body PostStreamEndRequest body);

        /**
         * Method to subscribe to another user
         * @param userId - userId of user to subscribe to
         * @return void
         */
        @POST(subscriptionsRoute)
        Call<Object> postSubscribe(@Path("userId") String userId);

        /**
         * Method to unsubscribe to another user
         * @param userId - userId of user to subscribe to
         * @return void
         */
        @DELETE(subscriptionsRoute)
        Call<Object> deleteSubscribe(@Path("userId") String userId);

        @GET(commentsRoute)
        Call<List<WorldScopeComment>> getPreviousComments(@Path("streamId") String streamId);

        @GET(meRoute)
        Call<WorldScopeUser> getMe();
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

    public static void requestUser(Context context) {
        if(currentUser != null && false) {
            for(OnUserRequestListener userRequestListener: userRequestListeners) {
                userRequestListener.getUser(currentUser);
            }
        } else {
            requestUserThroughAPI(context);
        }
    }

    private static void requestUserThroughAPI(Context context) {

        Call<WorldScopeUser> call = new WorldScopeRestAPI(context)
                .buildWorldScopeAPIService()
                .getMe();

        Log.d(TAG, call.toString());

        call.enqueue(new Callback<WorldScopeUser>() {
            @Override
            public void onResponse(Response<WorldScopeUser> response) {
                if (response.isSuccess()) {
                    for (OnUserRequestListener userRequestListener : userRequestListeners) {
                        userRequestListener.getUser(response.body());
                    }
                } else {
                    Log.d(TAG, "RESPONSE FAIL");
                    Log.d(TAG, response.toString());
                }
            }

            @Override
            public void onFailure(Throwable t) {
                Log.d(TAG, "NO RESPONSE");
            }
        });
    }

    public static void registerRequestUser(Context listener) {
        if(listener instanceof OnUserRequestListener) {
            Log.d(TAG, "Registering OnUserRequestListener");
            userRequestListeners.add((OnUserRequestListener) listener);
        }
    }

    public static WorldScopeUser getUser() {
        return currentUser;
    }

    public static void setUser(WorldScopeUser user) {
        currentUser = user;
    }

    public static void resetUser() {
        currentUser = null;
    }
}
