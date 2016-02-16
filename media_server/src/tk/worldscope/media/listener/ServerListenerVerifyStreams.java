package tk.worldscope.media.listener;

import com.wowza.wms.amf.AMFDataList;
import com.wowza.wms.amf.AMFPacket;
import com.wowza.wms.application.IApplication;
import com.wowza.wms.application.IApplicationInstance;
import com.wowza.wms.application.IApplicationInstanceNotify;
import com.wowza.wms.application.IApplicationNotify;
import com.wowza.wms.client.IClient;
import com.wowza.wms.httpstreamer.model.IHTTPStreamerSession;
import com.wowza.wms.logging.WMSLogger;
import com.wowza.wms.logging.WMSLoggerFactory;
import com.wowza.wms.mediacaster.IMediaCaster;
import com.wowza.wms.module.ModuleBase;
import com.wowza.wms.request.RequestFunction;
import com.wowza.wms.rtp.model.RTPRequestStatus;
import com.wowza.wms.rtp.model.RTPSession;
import com.wowza.wms.rtp.model.RTPStream;
import com.wowza.wms.server.IServer;
import com.wowza.wms.server.IServerNotify2;
import com.wowza.wms.stream.IMediaStream;
import com.wowza.wms.stream.IMediaStreamActionNotify;
import com.wowza.wms.stream.IMediaStreamActionNotify2;
import com.wowza.wms.stream.IMediaStreamNameAliasProvider;
import com.wowza.wms.stream.IMediaStreamNameAliasProvider2;
import com.wowza.wms.stream.IMediaStreamNotify;
import com.wowza.wms.stream.livepacketizer.ILiveStreamPacketizer;
import com.wowza.wms.vhost.IVHost;
import com.wowza.wms.vhost.IVHostNotify;
import com.wowza.wms.vhost.VHostSingleton;

import tk.worldscope.media.util.AppServerAdapter;
import tk.worldscope.media.util.Utils;

/**
 * This class listens on publishing events and verifies with the app server if a stream
 * can be published to before allowing the connection to go through on the media server
 */
public class ServerListenerVerifyStreams extends ModuleBase implements IServerNotify2 {
    public static final String MODULE_NAME = "ServerListenerStreamVerifer";
    private static final String PROP_NAME_PREFIX = "worldscope";

    public static boolean debug = false;

    private WMSLogger logger = WMSLoggerFactory.getLogger(getClass());
    private String appServerUrl = null;

    @Override
    public void onServerConfigLoaded(IServer server) {
        VHostSingleton.addVHostListener(new VHostNotifier());
    }

    @Override
    public void onServerCreate(IServer server) {
        debug = server.getProperties().getPropertyBoolean(PROP_NAME_PREFIX + "DebugLog", debug);
        logger.info("Debug status: " + debug);

        this.appServerUrl = server.getProperties()
                .getPropertyStr(ServerListenerVerifyStreams.PROP_NAME_PREFIX + "AppServerUrl", this.appServerUrl);
        AppServerAdapter.setAppServerUrl(this.appServerUrl);
    }

    @Override
    public void onServerInit(IServer server) {
    }

    @Override
    public void onServerShutdownComplete(IServer server) {
    }

    @Override
    public void onServerShutdownStart(IServer server) {
    }

    private class VHostNotifier implements IVHostNotify {
        private final ApplicationNotify listener = new ApplicationNotify();

        @Override
        public void onVHostCreate(IVHost vhost) {
            vhost.addApplicationListener(listener);
        }

        @Override
        public void onVHostInit(IVHost vhost) {
        }

        @Override
        public void onVHostShutdownStart(IVHost vhost) {
        }

        @Override
        public void onVHostShutdownComplete(IVHost vhost) {
            vhost.removeApplicationListener(listener);
        }

        @Override
        public void onVHostClientConnect(IVHost vhost, IClient inClient, RequestFunction function, AMFDataList params) {
        }
    }

    class ApplicationNotify implements IApplicationNotify {
        private final ApplicationInstanceNotify listener = new ApplicationInstanceNotify();

        @Override
        public void onApplicationCreate(IApplication application) {
            application.addApplicationInstanceListener(listener);
        }

        @Override
        public void onApplicationDestroy(IApplication application) {
            application.removeApplicationInstanceListener(listener);
        }
    }

    class ApplicationInstanceNotify implements IApplicationInstanceNotify {
        private final StreamListener listener = new StreamListener();

        @Override
        public void onApplicationInstanceCreate(IApplicationInstance appInstance) {
            if (ServerListenerVerifyStreams.debug) {
                logger.info(Utils.createLogMsg(MODULE_NAME, "onApplicationInstanceCreate",
                                               appInstance.getName(), "Stream Listener is initiated"));
            }

            IMediaStreamNameAliasProvider currentAliasProvider = appInstance.getStreamNameAliasProvider();
            appInstance.setStreamNameAliasProvider(new StreamAliasProvider(currentAliasProvider));
            appInstance.addMediaStreamListener(listener);
        }

        @Override
        public void onApplicationInstanceDestroy(IApplicationInstance appInstance) {
            if (ServerListenerVerifyStreams.debug) {
                logger.info(Utils.createLogMsg(MODULE_NAME, "onApplicationInstanceDestroy",
                                               appInstance.getName(), "Stream Listener is removed"));
            }
            appInstance.removeMediaStreamListener(listener);
        }
    }

    class StreamListener implements IMediaStreamNotify {
        private final IMediaStreamActionNotify actionNotify = new StreamManager();

        @Override
        public void onMediaStreamCreate(IMediaStream stream) {
            if (ServerListenerVerifyStreams.debug) {
                logger.info(Utils.createLogMsg(MODULE_NAME, "onMediaStreamCreate",
                                              stream.getName(), "Stream is initiated"));
            }
            stream.addClientListener(actionNotify);
        }

        @Override
        public void onMediaStreamDestroy(IMediaStream stream) {
            if (actionNotify != null) {
                stream.removeClientListener(actionNotify);
            }
        }
    }

    class StreamManager implements IMediaStreamActionNotify2 {
        @Override
        public void onPublish(IMediaStream stream, String streamName, boolean isRecord, boolean isAppend) {
            if (ServerListenerVerifyStreams.debug) {
                logger.info(Utils.createLogMsg(MODULE_NAME, "onPublish",
                                               streamName, "Verifying stream with app server"));
            }

            String application = "";
            String appInstance = "";
            if (stream.getClient() != null) {
                application = stream.getClient().getApplication().getName();
                appInstance = stream.getClient().getAppInstance().getName();

                if (!AppServerAdapter.verifyStream(application, appInstance, streamName)) {
                    IClient client = stream.getClient();
                    sendStreamOnStatusError(stream, "NetStream.Publish.BadName",
                                            "The publisher's Stream is not verified");
                    client.setShutdownClient(true);

                    logger.info(Utils.createLogMsg(MODULE_NAME, "onPublish", streamName,
                            String.format("Client Rejected (NetStream.Publish.BadName), unverified %s/%s/%s",
                                           application, appInstance, streamName)));
                }
            } else {
                RTPStream rtp = stream.getRTPStream();
                application = rtp.getAppInstance().getApplication().getName();
                appInstance = rtp.getAppInstance().getName();
                if (!AppServerAdapter.verifyStream(application, appInstance, streamName)) {
                    RTPRequestStatus status = new RTPRequestStatus();
                    status.setResponseCode(PLAYTRANSITION_RESET);
                    status.setResponseMessage("Unverified");
                    rtp.shutdown(status);
                    logger.info(Utils.createLogMsg(MODULE_NAME, "onPublish", streamName,
                            String.format("RTP Rejected, unverified. Stream: %s/%s/%s",
                                          application, appInstance, streamName)));
                }
            }
        }

        @Override
        public void onPlay(IMediaStream stream, String streamName, double playStart, double playLen, int playReset) {
        }

        @Override
        public void onUnPublish(IMediaStream stream, String streamName, boolean isRecord, boolean isAppend) {
        }

        @Override
        public void onPause(IMediaStream stream, boolean isPause, double location) {
        }

        @Override
        public void onSeek(IMediaStream stream, double location) {
        }

        @Override
        public void onStop(IMediaStream stream) {
        }

        @Override
        public void onMetaData(IMediaStream stream, AMFPacket metaDataPacket) {
        }

        @Override
        public void onPauseRaw(IMediaStream stream, boolean isPause, double location) {
        }
    }

    class StreamAliasProvider implements IMediaStreamNameAliasProvider2 {
        private final IMediaStreamNameAliasProvider currentAliasProvider;

        public StreamAliasProvider(IMediaStreamNameAliasProvider currentAliasProvider) {
            this.currentAliasProvider = currentAliasProvider;
        }

        @Override
        public String resolvePlayAlias(IApplicationInstance appInstance, String name) {
            return returnNameIfStreamIsVerified(appInstance, name);
        }

        @Override
        public String resolvePlayAlias(IApplicationInstance appInstance, String name, IClient client) {
            if (currentAliasProvider != null) {
                if (currentAliasProvider instanceof IMediaStreamNameAliasProvider2) {
                    name = ((IMediaStreamNameAliasProvider2) currentAliasProvider)
                            .resolvePlayAlias(appInstance, name, client);
                }
                name = currentAliasProvider.resolveStreamAlias(appInstance, name);
            }
            return returnNameIfStreamIsVerified(appInstance, name);
        }

        @Override
        public String resolvePlayAlias(IApplicationInstance appInstance, String name,
                                       IHTTPStreamerSession httpSession) {
            if (currentAliasProvider != null) {
                if (currentAliasProvider instanceof IMediaStreamNameAliasProvider2) {
                    name = ((IMediaStreamNameAliasProvider2) currentAliasProvider)
                            .resolvePlayAlias(appInstance, name, httpSession);
                }
                name = currentAliasProvider.resolveStreamAlias(appInstance, name);
            }
            return returnNameIfStreamIsVerified(appInstance, name);
        }

        @Override
        public String resolvePlayAlias(IApplicationInstance appInstance, String name, RTPSession rtpSession) {
            if (currentAliasProvider != null) {
                if (currentAliasProvider instanceof IMediaStreamNameAliasProvider2)
                    name = ((IMediaStreamNameAliasProvider2) currentAliasProvider)
                            .resolvePlayAlias(appInstance, name, rtpSession);
                name = currentAliasProvider.resolveStreamAlias(appInstance, name);
            }
            return returnNameIfStreamIsVerified(appInstance, name);
        }

        @Override
        public String resolvePlayAlias(IApplicationInstance appInstance, String name,
                                       ILiveStreamPacketizer liveStreamPacketizer) {
            if (currentAliasProvider != null) {
                if (currentAliasProvider instanceof IMediaStreamNameAliasProvider2)
                    name = ((IMediaStreamNameAliasProvider2) currentAliasProvider)
                            .resolvePlayAlias(appInstance, name, liveStreamPacketizer);
                name = currentAliasProvider.resolveStreamAlias(appInstance, name);
            }
            return returnNameIfStreamIsVerified(appInstance, name);
        }

        private String returnNameIfStreamIsVerified(IApplicationInstance appInstance, String name) {
            if (name == null) {
                return null;
            }
            if (!AppServerAdapter.verifyStream(appInstance.getApplication().getName(),
                                               appInstance.getName(), name)) {
                return null;
            }
            return name;
        }

        @Override
        public String resolveStreamAlias(IApplicationInstance appInstance, String name) {
            if (currentAliasProvider != null)
                return currentAliasProvider.resolveStreamAlias(appInstance, name);
            return name;
        }

        @Override
        public String resolveStreamAlias(IApplicationInstance appInstance, String name, IMediaCaster mediaCaster) {
            if (currentAliasProvider != null) {
                if (currentAliasProvider instanceof IMediaStreamNameAliasProvider2)
                    return ((IMediaStreamNameAliasProvider2) currentAliasProvider)
                            .resolveStreamAlias(appInstance, name, mediaCaster);
                return currentAliasProvider.resolveStreamAlias(appInstance, name);
            }
            return name;
        }
    }
}