package com.litmus.worldscope;

import retrofit2.Call;
import retrofit2.http.Body;
import retrofit2.http.GET;
import retrofit2.http.POST;

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
