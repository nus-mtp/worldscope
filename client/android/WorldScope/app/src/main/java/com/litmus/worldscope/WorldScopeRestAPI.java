package com.litmus.worldscope;

import android.util.Log;

import com.google.gson.FieldNamingPolicy;
import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import com.google.gson.JsonDeserializationContext;
import com.google.gson.JsonDeserializer;
import com.google.gson.JsonElement;
import com.google.gson.JsonParseException;

import java.lang.reflect.Type;

import retrofit2.GsonConverterFactory;
import retrofit2.Retrofit;

public class WorldScopeRestAPI {

    private static final String TAG = "WorldScopeRestAPI";

    static Retrofit.Builder retrofitBuilder;

    public static WorldScopeAPIService.WorldScopeAPIInterface buildWorldScopeAPIService() {

        GsonBuilder  gsonBuilder = new GsonBuilder();
        gsonBuilder.setFieldNamingPolicy(FieldNamingPolicy.UPPER_CAMEL_CASE);
        gsonBuilder.registerTypeAdapter(WorldScopeUser.class, new WorldScopeJsonDeserializer<WorldScopeUser>());

        Retrofit retrofit = getRetrofitBuilderInstance()
                .baseUrl(WorldScopeAPIService.WorldScopeURL)
                .addConverterFactory(GsonConverterFactory.create())
                .build();

        Log.d(TAG, "Returning created service");
        return retrofit.create(WorldScopeAPIService.WorldScopeAPIInterface.class);
    }

    /**
     * Returns the instance of Retrofit.Builder required to build requests
     * @return
     */
    private static Retrofit.Builder getRetrofitBuilderInstance() {
        if(retrofitBuilder == null) {
            return new Retrofit.Builder();
        } else {
          return retrofitBuilder;
        }
    }

    private static class WorldScopeJsonDeserializer<T> implements JsonDeserializer<T> {
        @Override
        public T deserialize(JsonElement je, Type type, JsonDeserializationContext jdc) throws JsonParseException {
            JsonElement content = je.getAsJsonObject();

            return new Gson().fromJson(content, type);
        }
    }
}
