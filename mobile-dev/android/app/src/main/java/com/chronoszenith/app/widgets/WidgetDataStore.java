package com.chronoszenith.app.widgets;

import android.content.Context;
import android.content.SharedPreferences;
import org.json.JSONArray;
import org.json.JSONException;

/**
 * Shared storage between the React Native bridge and Android widget providers.
 * Written by WidgetModule (JS side), read by AppWidgetProvider classes.
 */
public class WidgetDataStore {

    private static final String PREFS_NAME = "com.chronoszenith.widget_data";
    private static final String KEY_TASKS_JSON      = "tasks_json";
    private static final String KEY_COMPLETED       = "completed_count";
    private static final String KEY_TOTAL           = "total_count";
    private static final String KEY_TOTAL_RATING    = "total_rating";
    private static final String KEY_TOTAL_COMPLETED = "all_time_completed";
    private static final String KEY_TOTAL_ASSIGNED  = "all_time_assigned";
    private static final String KEY_STREAK          = "streak";
    private static final String KEY_BONUS           = "bonus_applied";
    private static final String KEY_DATE            = "widget_date";
    private static final String KEY_LAST_SYNC       = "last_sync_ts";

    public static void saveWidgetData(Context ctx, String tasksJson, int completed,
            int total, int totalRating, int totalCompleted, int totalAssigned, 
            int streak, boolean bonusApplied, String date) {
        SharedPreferences.Editor ed = prefs(ctx).edit();
        ed.putString(KEY_TASKS_JSON,      tasksJson);
        ed.putInt(KEY_COMPLETED,          completed);
        ed.putInt(KEY_TOTAL,              total);
        ed.putInt(KEY_TOTAL_RATING,       totalRating);
        ed.putInt(KEY_TOTAL_COMPLETED,    totalCompleted);
        ed.putInt(KEY_TOTAL_ASSIGNED,     totalAssigned);
        ed.putInt(KEY_STREAK,             streak);
        ed.putBoolean(KEY_BONUS,          bonusApplied);
        ed.putString(KEY_DATE,            date);
        ed.putLong(KEY_LAST_SYNC,         System.currentTimeMillis());
        ed.apply();
    }

    public static String  getTasksJson(Context ctx)     { return prefs(ctx).getString(KEY_TASKS_JSON, "[]"); }
    public static int     getCompleted(Context ctx)      { return prefs(ctx).getInt(KEY_COMPLETED, 0); }
    public static int     getTotal(Context ctx)          { return prefs(ctx).getInt(KEY_TOTAL, 0); }
    public static int     getTotalRating(Context ctx)    { return prefs(ctx).getInt(KEY_TOTAL_RATING, 0); }
    public static int     getAllTimeCompleted(Context ctx){ return prefs(ctx).getInt(KEY_TOTAL_COMPLETED, 0); }
    public static int     getAllTimeAssigned(Context ctx) { return prefs(ctx).getInt(KEY_TOTAL_ASSIGNED, 0); }
    public static int     getStreak(Context ctx)         { return prefs(ctx).getInt(KEY_STREAK, 0); }
    public static boolean getBonusApplied(Context ctx)   { return prefs(ctx).getBoolean(KEY_BONUS, false); }
    public static String  getDate(Context ctx)           { return prefs(ctx).getString(KEY_DATE, ""); }
    public static long    getLastSync(Context ctx)       { return prefs(ctx).getLong(KEY_LAST_SYNC, 0); }

    public static JSONArray getTasksArray(Context ctx) {
        try { return new JSONArray(getTasksJson(ctx)); }
        catch (JSONException e) { return new JSONArray(); }
    }

    private static SharedPreferences prefs(Context ctx) {
        return ctx.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
    }
}
