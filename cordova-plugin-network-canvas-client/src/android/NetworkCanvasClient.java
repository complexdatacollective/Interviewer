package org.codaco.networkCanvas.plugin;

import android.net.Uri;
import android.util.Base64;

import org.apache.cordova.CallbackContext;
import org.apache.cordova.CordovaInterface;
import org.apache.cordova.CordovaPlugin;
import org.apache.cordova.CordovaResourceApi;
import org.apache.cordova.CordovaWebView;
import org.apache.cordova.LOG;
import org.apache.cordova.PluginManager;
import org.apache.cordova.file.FileUtils;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.io.BufferedReader;
import java.io.ByteArrayInputStream;
import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.io.StringWriter;
import java.lang.reflect.Field;
import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;
import java.net.MalformedURLException;
import java.net.URL;
import java.nio.charset.Charset;
import java.security.KeyManagementException;
import java.security.KeyStore;
import java.security.KeyStoreException;
import java.security.NoSuchAlgorithmException;
import java.security.cert.Certificate;
import java.security.cert.CertificateException;
import java.security.cert.CertificateFactory;

import javax.net.ssl.HostnameVerifier;
import javax.net.ssl.HttpsURLConnection;
import javax.net.ssl.SSLContext;
import javax.net.ssl.TrustManagerFactory;

public class NetworkCanvasClient extends CordovaPlugin {
    private final String LogTag = "NetworkCanvas:ClientPlugin";
    private final Charset UTF_8 = Charset.forName("UTF-8");
    private final int BufferSize = 1024;

    private KeyStore keyStore;
    private FileUtils cdvFilePlugin;
    private CordovaResourceApi cdvResourceApi;

    class ApiRequest implements Runnable {
        private final String deviceId;
        private final URL url;
        private final String method;
        private final CallbackContext callbackContext;
        private Uri downloadDestination;
        private String body;

        ApiRequest(String deviceId, URL url, Uri downloadDestination, CallbackContext callbackContext) {
            this.deviceId = deviceId;
            this.url = url;
            this.downloadDestination = downloadDestination;
            this.method = "GET";
            this.callbackContext = callbackContext;
        }

        ApiRequest(String deviceId, URL url, String method, String body, CallbackContext callbackContext) {
            this.deviceId = deviceId;
            this.url = url;
            this.method = method;
            this.body = body;
            this.callbackContext = callbackContext;
        }

        /**
         * Adapted from https://developer.android.com/training/articles/security-ssl#java
         * Apache-2.0: https://developer.android.com/license
         */
        @Override
        public void run() {
            HttpsURLConnection urlConnection = null;
            InputStream respInputStream = null;
            InputStream respErrorStream = null;
            try {
                String algo = TrustManagerFactory.getDefaultAlgorithm();
                TrustManagerFactory trustManagerFactory = TrustManagerFactory.getInstance(algo);
                trustManagerFactory.init(keyStore);

                SSLContext sslContext = SSLContext.getInstance("TLS");
                sslContext.init(null, trustManagerFactory.getTrustManagers(), null);

                urlConnection = (HttpsURLConnection)url.openConnection();
                urlConnection.setSSLSocketFactory(sslContext.getSocketFactory());
                urlConnection.setHostnameVerifier(localhostVerifier);

                urlConnection.setRequestProperty("X-Device-API-Version", "2");
                urlConnection.setRequestProperty("Content-Type", "application/json");
                urlConnection.setRequestMethod(method);

                // Basic Auth
                String creds = deviceId + ":";
                String auth = Base64.encodeToString(creds.getBytes(UTF_8), Base64.DEFAULT);
                urlConnection.setRequestProperty("Authorization", "Basic " + auth);

                if (body != null) {
                    urlConnection.setDoOutput(true);
                    OutputStream out = urlConnection.getOutputStream();
                    out.write(body.getBytes(UTF_8));
                    out.close();
                }

                int code = urlConnection.getResponseCode();
                if (code >= HttpsURLConnection.HTTP_BAD_REQUEST) {
                    respErrorStream = urlConnection.getErrorStream();
                    JSONObject resp = inputStreamToJSONObject(respErrorStream);
                    respErrorStream.close();
                    callbackContext.error(resp);
                } else if (downloadDestination != null) {
                    // Save Server response to file and respond with file info
                    respInputStream = urlConnection.getInputStream();
                    inputStreamToFile(respInputStream, downloadDestination);
                    File savedFile = cdvResourceApi.mapUriToFile(downloadDestination);
                    JSONObject fileInfo = cdvFilePlugin.getEntryForFile(savedFile);
                    respInputStream.close();
                    callbackContext.success(fileInfo);
                } else {
                    // Respond directly with data
                    respInputStream = urlConnection.getInputStream();
                    JSONObject resp = inputStreamToJSONObject(respInputStream);
                    respInputStream.close();
                    callbackContext.success(resp);
                }
            } catch (NoSuchAlgorithmException e) {
                // Fatal. No device support for default algo.
                e.printStackTrace();
                callbackContext.error(jsonError("SSL not supported on this device."));
            } catch (IOException | JSONException | KeyStoreException | KeyManagementException e) {
                e.printStackTrace();
                callbackContext.error(jsonError(e));
            } finally {
                if (urlConnection != null) {
                    urlConnection.disconnect();
                }
            }

        }
    }

    private HostnameVerifier localhostVerifier = (hostname, session) -> {
        HostnameVerifier verifier = HttpsURLConnection.getDefaultHostnameVerifier();
        return verifier.verify("127.0.0.1", session);
    };

    @Override
    public void initialize(CordovaInterface cordova, CordovaWebView webView) {
        super.initialize(cordova, webView);
        cdvResourceApi = webView.getResourceApi();
        cdvFilePlugin = getCdvFilePlugin(webView);
    }

    @Override
    public boolean execute(String action, JSONArray args, CallbackContext callbackContext) throws JSONException {
        switch (action) {
            case "acceptCertificate":
                String cert = args.getString(0);
                this.acceptCertificate(cert, callbackContext);
                return true;
            case "download":
            case "send":
                String deviceId = args.getString(0);
                URL url = null;
                try {
                    url = new URL(args.getString(1));
                } catch (MalformedURLException e) {
                    e.printStackTrace();
                    callbackContext.error(jsonError("Invalid URL"));
                    return true;
                }

                ApiRequest req = null;
                String method = null;
                String body = null;
                if (action.equals("download")) {
                    String destination = args.getString(2);
                    Uri cordovaUri = Uri.parse(destination);
                    Uri nativeUri = cdvResourceApi.remapUri(cordovaUri);
                    req = new ApiRequest(deviceId, url, nativeUri, callbackContext);
                } else {
                    method = args.getString(2);
                    if (args.length() > 3) {
                        body = args.getString(3);
                    }
                    req = new ApiRequest(deviceId, url, method, body, callbackContext);
                }

                cordova.getThreadPool().execute(req);
                return true;
        }
        return false;
    }

    /**
     Supply a public Server certificate to be considered trusted.
     Async.

     Arguments to the cordova command:
     1. {string} The PEM-formatted certificate

     Adapted from https://developer.android.com/training/articles/security-ssl#java
     Apache-2.0: https://developer.android.com/license
     */
    private void acceptCertificate(String cert, CallbackContext callbackContext) {
        System.out.println(cert);
        try {
            CertificateFactory factory = CertificateFactory.getInstance("X.509");
            InputStream inputStream = new ByteArrayInputStream(cert.getBytes(UTF_8));
            Certificate certificate = factory.generateCertificate(inputStream);
            KeyStore keyStore = KeyStore.getInstance(KeyStore.getDefaultType());
            keyStore.load(null, null);
            keyStore.setCertificateEntry("NetworkCanvasServerCert", certificate);
            this.keyStore = keyStore;
            callbackContext.success();
        } catch (CertificateException | KeyStoreException | NoSuchAlgorithmException | IOException e) {
            e.printStackTrace();
            callbackContext.error(e.getLocalizedMessage());
        }
    }

    //region response formatting
    private String inputStreamAsString(InputStream stream) throws IOException {
        char[] buffer = new char[BufferSize];
        try (
            InputStreamReader streamReader = new InputStreamReader(stream, UTF_8);
            BufferedReader bufferedReader = new BufferedReader(streamReader, BufferSize);
            StringWriter writer = new StringWriter();
        ) {
            int charsRead = 0;
            while (-1 != (charsRead = bufferedReader.read(buffer))) {
                writer.write(buffer, 0, charsRead);
            }
            return writer.toString();
        }
    }

    private void ensureParentDir(Uri uri) {
        File file = new File(uri.getPath());
        File parentDir = file.getParentFile();
        if (parentDir != null) {
            parentDir.mkdirs();
        }
    }

    private void inputStreamToFile(InputStream inputStream, Uri destination) throws IOException {
        ensureParentDir(destination);
        byte[] buf = new byte[BufferSize];
        try (FileOutputStream outputStream = new FileOutputStream(destination.getPath())) {
            int bytesRead = 0;
            while (-1 != (bytesRead = inputStream.read(buf))) {
                outputStream.write(buf, 0, bytesRead);
            }
            outputStream.flush();
        }
    }

    private JSONObject inputStreamToJSONObject(InputStream stream) {
        String string = null;
        JSONObject obj = null;
        try {
            string = inputStreamAsString(stream);
        } catch (IOException e) {
            e.printStackTrace();
            return jsonError("Error reading Server response");
        }
        try {
            obj = new JSONObject(string);
        } catch (JSONException e) {
            e.printStackTrace();
            return jsonError("Error parsing Server response");
        }
        return obj;
    }

    /**
     * @param message User-friendly error message
     * @return JSON matching Server API format
     */
    private JSONObject jsonError(String message) {
        JSONObject err = new JSONObject();
        try {
            err.put("status", "error");
            err.put("message", message);
        } catch (JSONException e) {
            e.printStackTrace();
        }
        return err;
    }

    private JSONObject jsonError(Exception exception){
        return jsonError(exception.getMessage());
    }
    //endregion

    private FileUtils getCdvFilePlugin(CordovaWebView webView) {
        PluginManager pluginManager = null;
        try {
            Method method = webView.getClass().getMethod("getPluginManager");
            pluginManager = (PluginManager) method.invoke(webView);
        } catch (IllegalAccessException | InvocationTargetException | NoSuchMethodException e) {
            // try getField
        }

        if (pluginManager == null) {
            try {
                Field field = webView.getClass().getField("pluginManager");
                pluginManager = (PluginManager)field.get(webView);
            } catch (IllegalAccessException | NoSuchFieldException e) {
                // Log warning below
            }
        }

        if (pluginManager != null) {
            return (FileUtils) pluginManager.getPlugin("File");
        }

        LOG.w(LogTag, "Could not get FilePlugin; download interface will not be available");
        return null;
    }
}
