package com.litmus.worldscope;

import com.litmus.worldscope.model.WorldScopeUser;
import com.litmus.worldscope.model.WorldScopeViewStream;
import java.util.List;
import retrofit2.Call;
import retrofit2.http.Body;
import retrofit2.http.GET;
import retrofit2.http.POST;
import retrofit2.http.Query;

public class WorldScopeAPIService {

    // Server address
    public static final String WorldScopeURL = "http://54.179.170.132:3000";

    // REST API Routes
    private static final String loginRoute = "/api/users/login";
    private static final String logoutRoute = "/api/users/logout";
    private static final String streamsRoute = "/api/streams";

    // WorldScope App Id
    private static final String appId = "123456789";

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
         * @return
         */
        @GET(streamsRoute)
        Call<List<WorldScopeViewStream>> getStreams(@Query("state") String state, @Query("sort") String sort, @Query("order") String order);

    }

    // Class to set body of login request
    public static class LoginUserRequest {
        private final String accessToken;
        private final String appId;

        LoginUserRequest(String accessToken) {
            this.accessToken = accessToken;
            this.appId = WorldScopeAPIService.appId;
        }
    }
}
