package com.litmus.worldscope.utility;

import android.content.Context;
import android.util.Log;

import com.github.nkzawa.emitter.Emitter;
import com.github.nkzawa.socketio.client.IO;
import com.github.nkzawa.socketio.client.Socket;

import java.net.URISyntaxException;
import java.util.ArrayList;


/**
 * WorldScopeSocketService connects to the host server,
 * make calls in the form of methods
 * and allows classes to attach themselves as listeners for events
 */
public class WorldScopeSocketService {

    private static Socket socket;
    private static boolean isInitialized = false;
    private static String TAG = "WorldScopeSocketService";

    // List of listeners listening to the events
    private static ArrayList<OnIdentifyEventListener> identifyEventListeners = new ArrayList<>();
    private static ArrayList<OnJoinEventListener> joinEventListeners = new ArrayList<>();
    private static ArrayList<OnCommentEventListener> commentEventListeners = new ArrayList<>();

    // Event names
    private static String EVENT_IDENTIFY = "identify";
    private static String EVENT_COMMENT = "comment";


    // Connect to Socket.IO in App Server
    public static void initialize() {
        try {
            socket = IO.socket(WorldScopeAPIService.WorldScopeURL);
            socket.connect();
            isInitialized = true;
            // Start listening to events
            startListening();
        } catch (URISyntaxException e) {
            e.printStackTrace();
        }
    }

    private static void startListening() {
        socket.on(EVENT_IDENTIFY, onIdentifyEvent);
        socket.on(EVENT_COMMENT, onCommentEvent);
    }

    // Emits an identify event, payload should be the current cookie
    public static void emitIdentify(String data) {
        if(isInitialized) {
            Log.d(TAG, "Emitting identify with: " + data);
            socket.emit("identify", data);
        }
    }

    // Emits a comment event, payload should be the comment
    public static void emitJoin(String data) {
        if(isInitialized) {
            socket.emit("join", data);
        }
    }

    // Emits a comment event, payload should be the comment
    public static void emitComment(String data) {
        if(isInitialized) {
            socket.emit("comment", data);
        }
    }

    // Adds the object as a listener if it is valid
    public static boolean registerListener(Context listener) {

        if(listener instanceof OnIdentifyEventListener) {
            identifyEventListeners.add((OnIdentifyEventListener)listener);
            return true;
        }

        if(listener instanceof OnCommentEventListener) {
            commentEventListeners.add((OnCommentEventListener)listener);
            return true;
        }

        if(listener instanceof OnJoinEventListener) {
            joinEventListeners.add((OnJoinEventListener)listener);
            return true;
        }

        return false;
    }

    public interface OnIdentifyEventListener {
        void onIdentifyEventEmitted(String data);
    }

    public interface OnCommentEventListener {
        void onCommentEventEmitted(String data);
    }

    public interface OnJoinEventListener {
        void onJoinEventEmitted(String data);
    }

    // Generate an instance of the Emitter.Listener for identify
    private static Emitter.Listener onIdentifyEvent = new Emitter.Listener() {
        @Override
        public void call(final Object... args) {
            String data = args[0].toString();
            for (OnIdentifyEventListener listener: identifyEventListeners) {
                listener.onIdentifyEventEmitted(data);
            }
        }
    };

    // Generate an instance of the Emitter.Listener for comment
    private static Emitter.Listener onJoinEvent = new Emitter.Listener() {
        @Override
        public void call(final Object... args) {
            String data = args[0].toString();
            for (OnJoinEventListener listener: joinEventListeners) {
                listener.onJoinEventEmitted(data);
            }
        }
    };


    // Generate an instance of the Emitter.Listener for comment
    private static Emitter.Listener onCommentEvent = new Emitter.Listener() {
        @Override
        public void call(final Object... args) {
            String data = args[0].toString();
            for (OnCommentEventListener listener: commentEventListeners) {
                listener.onCommentEventEmitted(data);
            }
        }
    };
}
