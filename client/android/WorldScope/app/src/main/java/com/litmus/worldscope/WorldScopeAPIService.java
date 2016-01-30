package com.litmus.worldscope;

import android.preference.Preference;
import android.preference.PreferenceManager;

import com.litmus.worldscope.model.WorldScopeUser;
import com.litmus.worldscope.model.WorldScopeViewStream;

import java.io.IOException;
import java.util.HashSet;
import java.util.List;

import okhttp3.Interceptor;
import okhttp3.Request;
import okhttp3.Response;
import retrofit2.Call;
import retrofit2.http.Body;
import retrofit2.http.GET;
import retrofit2.http.POST;
import retrofit2.http.Query;

public class WorldScopeAPIService {

    // Server address
    public static final String WorldScopeURL = "http://54.179.170.132:3000";

    // WorldScope App Id
    private static final String appId = "123456789";

    // API interface requird by Retrofit to make the calls
    public interface WorldScopeAPIInterface {
        @POST("/api/users/login")
        Call<WorldScopeUser> loginUser(@Body LoginUserRequest body);

        @GET("/api/users/logout")
        Call<WorldScopeUser> logoutUser();

        /**
         * Method to get streams
         * @param status - Possible values: live, done, all
         * @param sort - Possible values: time, viewers, title
         * @param order - Possible values: desc, asc
         * @return
         */
        @GET("/api/streams")
        Call<List<WorldScopeViewStream>> getStreams(@Query("status") String status, @Query("sort") String sort, @Query("order") String order);

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
