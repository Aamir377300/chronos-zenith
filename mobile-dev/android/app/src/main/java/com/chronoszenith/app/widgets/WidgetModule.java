package com.chronoszenith.app.widgets;

import android.content.Context;
import androidx.annotation.NonNull;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReadableArray;
import com.facebook.react.bridge.ReadableMap;
import org.json.JSONArray;
import org.json.JSONObject;

/**
 * React Native Native Module — JS calls updateWidgets() to push data to widgets.
 * Accessible as NativeModules.WidgetModule in JavaScript.
 */
public class WidgetModule extends ReactContextBaseJavaModule {

    public WidgetModule(ReactApplicationContext reactContext) { super(reactContext); }

    @NonNull
    @Override
    public String getName() { return "WidgetModule"; }

    @ReactMethod
    public void updateWidgets(ReadableArray tasks, ReadableMap stats,
            int streak, int rating, int totalCompleted, int totalAssigned, 
            String date, Promise promise) {
        try {
            Context ctx = getReactApplicationContext();

            JSONArray tasksJson = new JSONArray();
            for (int i = 0; i < tasks.size(); i++) {
                ReadableMap t = tasks.getMap(i);
                if (t == null) continue;
                JSONObject obj = new JSONObject();
                obj.put("title",       t.hasKey("title")       ? t.getString("title")       : "");
                obj.put("time",        t.hasKey("time")        ? t.getString("time")        : "");
                obj.put("isCompleted", t.hasKey("isCompleted") && t.getBoolean("isCompleted"));
                tasksJson.put(obj);
            }

            int     completed    = stats.hasKey("completedTasks") ? stats.getInt("completedTasks") : 0;
            int     total        = stats.hasKey("totalTasks")     ? stats.getInt("totalTasks")     : 0;
            boolean bonusApplied = stats.hasKey("bonusApplied")   && stats.getBoolean("bonusApplied");

            WidgetDataStore.saveWidgetData(ctx, tasksJson.toString(), completed, total,
                    rating, totalCompleted, totalAssigned, streak, bonusApplied, date);

            TimelineWidgetProvider.refreshAll(ctx);
            ScoreWidgetProvider.refreshAll(ctx);

            promise.resolve("ok");
        } catch (Exception e) {
            promise.reject("WIDGET_UPDATE_ERROR", e.getMessage(), e);
        }
    }

    @ReactMethod
    public void refreshWidgets(Promise promise) {
        try {
            Context ctx = getReactApplicationContext();
            TimelineWidgetProvider.refreshAll(ctx);
            ScoreWidgetProvider.refreshAll(ctx);
            promise.resolve("ok");
        } catch (Exception e) {
            promise.reject("WIDGET_REFRESH_ERROR", e.getMessage(), e);
        }
    }

    @ReactMethod
    public void isWidgetSupported(Promise promise) { promise.resolve(true); }
}
