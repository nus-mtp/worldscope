package tk.worldscope.media.http;

import java.io.OutputStream;
import java.util.List;
import java.util.Map;

import com.wowza.wms.application.IApplicationInstance;
import com.wowza.wms.client.IClient;
import com.wowza.wms.http.HTTProvider2Base;
import com.wowza.wms.http.IHTTPRequest;
import com.wowza.wms.http.IHTTPResponse;
import com.wowza.wms.httpstreamer.model.IHTTPStreamerSession;
import com.wowza.wms.logging.WMSLogger;
import com.wowza.wms.logging.WMSLoggerFactory;
import com.wowza.wms.rtp.model.RTPSession;
import com.wowza.wms.rtp.model.RTPStream;
import com.wowza.wms.stream.IMediaStream;
import com.wowza.wms.vhost.IVHost;

import tk.worldscope.media.listener.ServerListenerVerifyStreams;

/**
 * This class handles http requests to the media server to stop a stream
 * i.e. disconnecting all clients (viewers and publisher)
 */
public class HTTPProviderStreamsControl extends HTTProvider2Base {
    public static final String MODULE_NAME = "HTTPProviderStreamsControl";

    private static final String CONTROL_STOP = "stop";

    private WMSLogger logger = WMSLoggerFactory.getLogger(getClass());

    @Override
    public void onHTTPRequest(IVHost vhost, IHTTPRequest request, IHTTPResponse response) {
        if (!doHTTPAuthentication(vhost, request, response)) {
            if (ServerListenerVerifyStreams.debug) {
                logger.info("Client at " + request.getRemoteAddr() + " failed to authenticate");
            }
            return;
        }

        if (ServerListenerVerifyStreams.debug) {
            logger.info("Handling " + request.getMethod() + " " + request.getRequestURI());
        }
        String postResponseMsg = this.handlePost(request, vhost);
        response.setHeader("Content-Type", "application/json");

        try {
            OutputStream out = response.getOutputStream();
            byte[] outBytes = postResponseMsg.getBytes();
            out.write(outBytes);
        } catch (Exception e) {
            logger.error(MODULE_NAME + ".onHTTPRequest()", e);
        }
    }

    private String handlePost(IHTTPRequest req, IVHost vhost) {
        if (req.getMethod().equalsIgnoreCase("post")) {
            req.parseBodyForParams(true);
        }

        Map<String, List<String>> params = req.getParameterMap();
        if (params.containsKey(CONTROL_STOP)) {
            String validationResult = validateParameters(CONTROL_STOP, params);
            if (!validationResult.isEmpty()) {
                return createResponseJSONString("ERR", validationResult);
            }

            String appPath = String.format("%s/%s/%s", params.get("app").get(0),
                    params.get("appInstance").get(0), params.get("stream").get(0));
            if (this.stopStream(vhost, params.get("app").get(0),
                    params.get("appInstance").get(0),
                    params.get("stream").get(0))) {
                return createResponseJSONString("OK", appPath + " has been stopped");
            }
            return createResponseJSONString("ERR", appPath + " failed to stop.");
        }

        return createResponseJSONString("ERR", "Unknown control");
    }

    private String validateParameters(String control, Map<String, List<String>> parameters) {
        boolean hasAppName = parameters.containsKey("app");
        boolean hasAppInstance = parameters.containsKey("appInstance");
        boolean hasStreamKey = parameters.containsKey("stream");

        if (!(hasAppName && hasAppInstance && hasStreamKey)) {
            return "Missing application, app instance or stream name";
        }

        return "";
    }

    private String createResponseJSONString(String status, String message) {
        return String.format("{\"status\": \"%s\", \"message\": \"%s\"}", status, message);
    }

    private boolean stopStream(IVHost vhost, String applicationName, String appInstanceName, String streamName) {
        try {
            IApplicationInstance appInstance = vhost.getApplication(applicationName).getAppInstance(appInstanceName);
            if (appInstance != null) {
                disconnectHTTPViewers(appInstance, streamName);
                disconnectRTMPViewers(appInstance, streamName);
                disconnectRTPViewers(appInstance, streamName);
            }
            disconnectPublisher(appInstance, streamName);
            return true;
        } catch (Exception ex) {
            logger.error(MODULE_NAME + ".stopStream", ex);
        }
        return false;
    }

    private void disconnectHTTPViewers(IApplicationInstance appInstance, String streamName) {
        List<IHTTPStreamerSession> httpClients = appInstance.getHTTPStreamerSessions();
        for (IHTTPStreamerSession httpClient : httpClients) {
            try {
                if (httpClient == null) {
                    continue;
                }

                if (streamName.equals(httpClient.getStream().getName())) {
                    httpClient.rejectSession();
                }
            } catch (Exception e) {
                logger.error(MODULE_NAME + ".disconnectHTTPViewers", e);
            }
        }
    }

    private void disconnectRTMPViewers(IApplicationInstance appInstance, String streamName) {
        List<IClient> rtmpClients = appInstance.getClients();
        for (IClient rtmpClient : rtmpClients) {
            try {
                if (rtmpClient == null) {
                    continue;
                }

                @SuppressWarnings("unchecked")
                List<IMediaStream> clientStreams = rtmpClient.getPlayStreams();

                if (clientStreams.size() > 0) {
                    for (IMediaStream stream : clientStreams) {
                        if (streamName.equals(stream.getName())) {
                            rtmpClient.setShutdownClient(true);
                        }
                    }
                }
            } catch (Exception e) {
                logger.error(MODULE_NAME + ".disconnectRTMPViewers", e);
            }
        }
    }

    private void disconnectRTPViewers(IApplicationInstance appInstance, String streamName) {
        List<RTPSession> rtpClients = appInstance.getRTPSessions();
        for (RTPSession rtpClient : rtpClients) {
            try {
                if (rtpClient == null) {
                    continue;
                }

                if (streamName.equals(rtpClient.getRTSPStream().getStreamName())) {
                    appInstance.getVHost().getRTPContext().shutdownRTPSession(rtpClient);
                }
            } catch (Exception e) {
                logger.error(MODULE_NAME + ".disconnectRTPViewers", e);
            }
        }
    }

    private void disconnectPublisher(IApplicationInstance appInstance, String streamName) {
        IMediaStream publishedStream = appInstance.getStreams().getStream(streamName);
        if (publishedStream != null) {
            IClient client = publishedStream.getClient();
            if (client != null) {
                client.setShutdownClient(true);
            } else {
                RTPStream rtpStream = publishedStream.getRTPStream();
                if (rtpStream != null) {
                    appInstance.getVHost().getRTPContext().shutdownRTPSession(rtpStream.getSession());
                }
            }
        }
    }
}
