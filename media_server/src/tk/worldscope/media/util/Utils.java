package tk.worldscope.media.util;

import java.io.IOException;

import org.apache.http.Consts;
import org.apache.http.HttpEntity;
import org.apache.http.client.methods.CloseableHttpResponse;
import org.apache.http.client.methods.HttpGet;
import org.apache.http.impl.client.CloseableHttpClient;
import org.apache.http.impl.client.HttpClients;
import org.apache.http.util.EntityUtils;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.wowza.wms.logging.WMSLogger;
import com.wowza.wms.logging.WMSLoggerFactory;

import tk.worldscope.media.listener.ServerListenerVerifyStreams;

public class Utils {
    private static final ObjectMapper mapper = new ObjectMapper();
	private static final WMSLogger logger = WMSLoggerFactory.getLogger(AppServerAdapter.class);

    public static String createLogMsg(String className, String methodName, String params, String msg) {
        return String.format("%s.%s[\"%s\"] %s", className, methodName, params, msg);
    }

    public static JsonNode parseJsonString(String jsonString) throws JsonProcessingException, IOException {
        return mapper.readTree(jsonString);
    }

    public static String makeGETRequest(String url) {
        if (ServerListenerVerifyStreams.debug) {
            logger.info("GET " + url);
        }
	    HttpGet request = new HttpGet(url);

        try (
            CloseableHttpClient client = HttpClients.createDefault();
            CloseableHttpResponse response = client.execute(request)) {
            if (ServerListenerVerifyStreams.debug) {
                logger.info("GET " + url + " status: " + response.getStatusLine().getStatusCode());
            }

            HttpEntity entity = response.getEntity();
            if (entity == null) {
                return "";
            }
            return EntityUtils.toString(entity, Consts.UTF_8);
        } catch (IOException e) {
            logger.error("Failed to make GET request to " + url, e);
            return "";
        }
    }
}
