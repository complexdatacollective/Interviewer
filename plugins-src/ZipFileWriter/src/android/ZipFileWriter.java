package com.example.zipfilewriter;

import android.app.Activity;
import android.content.Intent;
import android.net.Uri;
import android.os.Build;
import android.os.Environment;
import android.provider.DocumentsContract;
import android.util.Base64;
import androidx.annotation.RequiresApi;
import androidx.core.content.FileProvider;

import org.apache.cordova.CordovaPlugin;
import org.apache.cordova.CallbackContext;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;

public class ZipFileWriter extends CordovaPlugin {

    private static final int WRITE_REQUEST_CODE = 43;

    private CallbackContext callbackContext;

    @Override
    public boolean execute(String action, JSONArray args, CallbackContext callbackContext) throws JSONException {
        if (action.equals("saveZipFile")) {
            String base64Data = args.getString(0);
            String fileName = args.getString(1);
            this.callbackContext = callbackContext;
            saveZipFile(base64Data, fileName);
            return true;
        }
        return false;
    }

    private void saveZipFile(String base64Data, String fileName) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.KITKAT) {
            Intent intent = new Intent(Intent.ACTION_CREATE_DOCUMENT);
            intent.addCategory(Intent.CATEGORY_OPENABLE);
            intent.setType("application/zip");
            intent.putExtra(Intent.EXTRA_TITLE, fileName);

            cordova.startActivityForResult(this, intent, WRITE_REQUEST_CODE);
        } else {
            callbackContext.error("Saving files is supported on Android 4.4 (KitKat) and above.");
        }
    }

    @RequiresApi(api = Build.VERSION_CODES.KITKAT)
    @Override
    public void onActivityResult(int requestCode, int resultCode, Intent data) {
        if (requestCode == WRITE_REQUEST_CODE && resultCode == Activity.RESULT_OK) {
            Uri uri = data.getData();
            if (uri != null) {
                try {
                    writeFileToUri(uri);
                } catch (IOException e) {
                    callbackContext.error("Failed to save file: " + e.getMessage());
                }
            } else {
                callbackContext.error("File save operation canceled.");
            }
        } else {
            callbackContext.error("File save operation failed.");
        }
    }

    @RequiresApi(api = Build.VERSION_CODES.KITKAT)
    private void writeFileToUri(Uri uri) throws IOException {
        try {
            String base64Data = new String(Base64.decode(uri.getLastPathSegment(), Base64.DEFAULT));
            byte[] decodedBytes = Base64.decode(base64Data, Base64.DEFAULT);

            FileOutputStream outputStream = (FileOutputStream) cordova.getContext().getContentResolver().openOutputStream(uri);
            if (outputStream != null) {
                outputStream.write(decodedBytes);
                outputStream.close();
                callbackContext.success("File saved successfully.");
            } else {
                callbackContext.error("Unable to open file output stream.");
            }
        } catch (IOException e) {
            throw new IOException("Error writing file: " + e.getMessage(), e);
        }
    }
}
