package tk.worldscope.media.util;

import java.io.IOException;

import com.fasterxml.jackson.databind.JsonNode;
import com.wowza.util.StringUtils;
import com.wowza.wms.logging.WMSLogger;
import com.wowza.wms.logging.WMSLoggerFactory;

import tk.worldscope.media.listener.ServerListenerVerifyStreams;

/**
 * This class communicates directly with app server
 */
public class AppServerAdapter {
	private static String appServerUrl = "http://localhost:3000";
	private static final String SEGMENT_STREAMS = "/api/streams/";

	private static final WMSLogger logger = WMSLoggerFactory.getLogger(AppServerAdapter.class);

	public static void setAppServerUrl(String appServerUrl) {
        if (!StringUtils.isEmpty(appServerUrl)) {
            AppServerAdapter.appServerUrl = appServerUrl;
        }
	}

	public static boolean verifyStream(String application, String appInstance, String streamName) {
	    try {
            String response = requestAppServerForStream(streamName);
            if (ServerListenerVerifyStreams.debug) {
                logger.info("Stream info: " + response);
            }
            JsonNode streamJsonObj = Utils.parseJsonString(response);

            String responseAppInstance = streamJsonObj.path("appInstance").asText();
            boolean isLive = streamJsonObj.path("live").asBoolean(false);
            if (isLive && appInstance.equals(responseAppInstance)) {
                return true;
            }
            return false;
	    } catch (IOException e){
	        logger.error("Failed to verify stream", e);
	        return false;
	    }
	}

	private static String requestAppServerForStream(String streamId) throws IOException {
        if (ServerListenerVerifyStreams.debug) {
            logger.info("Requesting stream info for " + streamId);
        }
	    String url = appServerUrl + SEGMENT_STREAMS + streamId;
	    return Utils.makeGETRequest(url);
	}
}
