package tk.worldscope.media.util;

public class Utils {
    public static String createLogMsg(String className, String methodName, String params, String msg) {
        return String.format("%s.%s[\"%s\"] %s", className, methodName, params, msg);
    }
}
