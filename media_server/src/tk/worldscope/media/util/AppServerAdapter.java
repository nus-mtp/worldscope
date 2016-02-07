package tk.worldscope.media.util;

import com.wowza.util.StringUtils;
import com.wowza.wms.logging.WMSLogger;
import com.wowza.wms.logging.WMSLoggerFactory;

/**
 * This class communicates directly with app server
 */
public class AppServerAdapter {
	private static String appServerUrl = "http://localhost:3000";
	private static WMSLogger logger = WMSLoggerFactory.getLogger(AppServerAdapter.class);

	public static void setAppServerUrl(String appServerUrl) {
        if (!StringUtils.isEmpty(appServerUrl)) {
            AppServerAdapter.appServerUrl = appServerUrl;
        }
	}

	public static boolean verifyStream(String application, String appInstance, String streamName) {
	    return true;
	}
}
