package org.codaco.networkCanvas.plugin;

import android.util.Base64;

import org.apache.cordova.CallbackContext;
import org.apache.cordova.CordovaPlugin;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.io.BufferedReader;
import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.io.StringWriter;
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
import javax.net.ssl.SSLSession;
import javax.net.ssl.TrustManagerFactory;

public class NetworkCanvasClient extends CordovaPlugin {
    private Charset UTF_8 = Charset.forName("UTF-8");

    private KeyStore keyStore = null;

    HostnameVerifier localhostVerifier = new HostnameVerifier() {
        @Override
        public boolean verify(String hostname, SSLSession session) {
            HostnameVerifier verifier = HttpsURLConnection.getDefaultHostnameVerifier();
            return verifier.verify("127.0.0.1", session);
        }
    };

    @Override
    public boolean execute(String action, JSONArray args, CallbackContext callbackContext) throws JSONException {
        switch (action) {
            case "send":
                String deviceId = args.getString(0);
                String url = args.getString(1);
                String method = args.getString(2);
                String body = null;
                if (args.length() > 3) {
                    body = args.getString(3);
                    System.out.println("BODY LENGTH" + body.length());
                }
                this.send(deviceId, url, method, body, callbackContext);
                return true;
            case "acceptCertificate":
                String cert = args.getString(0);
                this.acceptCertificate(cert, callbackContext);
                return true;
        }
        return false;
    }

    /**
     Supply a public Server certificate to be considered trusted.
     Async.

     Arguments to the cordova command:
     1. {string} The PEM-formatted certificate

     // Adapted from https://developer.android.com/training/articles/security-ssl#java
     // Apache-2.0: https://developer.android.com/license
     */
    private void acceptCertificate(String cert, CallbackContext callbackContext) {
        System.out.println(cert);
        try {
            CertificateFactory factory = CertificateFactory.getInstance("X.509");
            InputStream inputStream = new ByteArrayInputStream(cert.getBytes(UTF_8));
            Certificate certificate = factory.generateCertificate(inputStream);
            KeyStore keyStore = KeyStore.getInstance(KeyStore.getDefaultType());

            keyStore.load(null, null);
            // TODO: accept alias from client?
            keyStore.setCertificateEntry("CustomServerCert", certificate);
            this.keyStore = keyStore;
            callbackContext.success();

        } catch (CertificateException e) {
            e.printStackTrace();
        } catch (KeyStoreException e) {
            e.printStackTrace();
        } catch (NoSuchAlgorithmException e) {
            e.printStackTrace();
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    private String inputStreamAsString(InputStream stream) throws IOException {
        int bufSize = 1024;
        char[] buffer = new char[bufSize];
        InputStreamReader streamReader = new InputStreamReader(stream, UTF_8);
        BufferedReader bufferedReader = new BufferedReader(streamReader, bufSize);
        StringWriter writer = new StringWriter();
        int charsRead = 0;
        while (-1 != (charsRead = bufferedReader.read(buffer))) {
            writer.write(buffer, 0, charsRead);
        }
        return writer.toString();
    }

    private JSONObject inputStreamAsJSONObject(InputStream stream) {
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
     *
     * @param deviceId
     * @param toUrl
     * @param method
     * @param body
     * @param callbackContext
     *
     * Adapted from https://developer.android.com/training/articles/security-ssl#java
     * Apache-2.0: https://developer.android.com/license
     */
    private void send(String deviceId, String toUrl, String method, String body, CallbackContext callbackContext) {
        try {
            String algo = TrustManagerFactory.getDefaultAlgorithm();
            TrustManagerFactory trustManagerFactory = TrustManagerFactory.getInstance(algo);
            trustManagerFactory.init(keyStore);

            SSLContext sslContext = SSLContext.getInstance("TLS");
            sslContext.init(null, trustManagerFactory.getTrustManagers(), null);


            URL url = new URL(toUrl);

            HttpsURLConnection urlConnection = (HttpsURLConnection)url.openConnection();
            urlConnection.setSSLSocketFactory(sslContext.getSocketFactory());
            urlConnection.setHostnameVerifier(localhostVerifier);

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

//            InputStream in = urlConnection.getInputStream();
            if (code >= HttpsURLConnection.HTTP_BAD_REQUEST) {
                JSONObject resp = inputStreamAsJSONObject(urlConnection.getErrorStream());
                callbackContext.error(resp);
            } else {
                JSONObject resp = inputStreamAsJSONObject(urlConnection.getInputStream());
                callbackContext.success(resp);
            }
        } catch (NoSuchAlgorithmException e) {
            // Fatal. No device support for default algo.
            e.printStackTrace();
            callbackContext.error(jsonError("SSL not supported on this device."));
        } catch (IOException | KeyStoreException | KeyManagementException e) {
            e.printStackTrace();
            callbackContext.error(jsonError(e));
        }
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
}
