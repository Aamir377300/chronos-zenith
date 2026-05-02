package com.chronoszenith.app.widgets;

import android.app.PendingIntent;
import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.graphics.Paint;
import android.view.View;
import android.widget.RemoteViews;

import com.chronoszenith.app.MainActivity;
import com.chronoszenith.app.R;

import org.json.JSONArray;
import org.json.JSONObject;

/**
 * Timeline Widget — shows today's tasks in a vertical timeline.
 * Completed tasks: grey text + strikethrough. Incomplete: white text.
 */
public class TimelineWidgetProvider extends AppWidgetProvider {

    public static final String ACTION_REFRESH = "com.chronoszenith.TIMELINE_WIDGET_REFRESH";
    private static final int MAX_TASKS = 5;

    private static final int[] ROW_IDS    = { R.id.task_row_1, R.id.task_row_2, R.id.task_row_3, R.id.task_row_4, R.id.task_row_5 };
    private static final int[] TITLE_IDS  = { R.id.task_title_1, R.id.task_title_2, R.id.task_title_3, R.id.task_title_4, R.id.task_title_5 };
    private static final int[] TIME_IDS   = { R.id.task_time_1, R.id.task_time_2, R.id.task_time_3, R.id.task_time_4, R.id.task_time_5 };
    private static final int[] CIRCLE_IDS = { R.id.task_circle_1, R.id.task_circle_2, R.id.task_circle_3, R.id.task_circle_4, R.id.task_circle_5 };

    @Override
    public void onUpdate(Context context, AppWidgetManager manager, int[] appWidgetIds) {
        for (int id : appWidgetIds) updateWidget(context, manager, id);
    }

    @Override
    public void onReceive(Context context, Intent intent) {
        super.onReceive(context, intent);
        if (ACTION_REFRESH.equals(intent.getAction())) refreshAll(context);
    }

    public static void refreshAll(Context context) {
        AppWidgetManager manager = AppWidgetManager.getInstance(context);
        int[] ids = manager.getAppWidgetIds(new ComponentName(context, TimelineWidgetProvider.class));
        for (int id : ids) updateWidget(context, manager, id);
    }

    private static void updateWidget(Context context, AppWidgetManager manager, int widgetId) {
        RemoteViews views = new RemoteViews(context.getPackageName(), R.layout.widget_timeline);

        views.setTextViewText(R.id.widget_date, formatDate(WidgetDataStore.getDate(context)));

        JSONArray tasks = WidgetDataStore.getTasksArray(context);
        int taskCount   = tasks.length();
        PendingIntent openApp = openAppIntent(context);

        if (taskCount == 0) {
            views.setViewVisibility(R.id.empty_text, View.VISIBLE);
            views.setViewVisibility(R.id.more_tasks_text, View.GONE);
            for (int i = 0; i < MAX_TASKS; i++) views.setViewVisibility(ROW_IDS[i], View.GONE);
        } else {
            views.setViewVisibility(R.id.empty_text, View.GONE);
            int displayCount = Math.min(taskCount, MAX_TASKS);

            for (int i = 0; i < MAX_TASKS; i++) {
                if (i < displayCount) {
                    try {
                        JSONObject task     = tasks.getJSONObject(i);
                        String title        = task.optString("title", "");
                        String time         = task.optString("time", "");
                        boolean isCompleted = task.optBoolean("isCompleted", false);

                        views.setViewVisibility(ROW_IDS[i], View.VISIBLE);
                        views.setTextViewText(TITLE_IDS[i], title);
                        views.setImageViewResource(CIRCLE_IDS[i],
                                isCompleted ? R.drawable.task_circle_done : R.drawable.task_circle_empty);
                        views.setTextColor(TITLE_IDS[i],
                                isCompleted ? android.graphics.Color.parseColor("#6B7280")
                                            : android.graphics.Color.parseColor("#F9FAFB"));
                        views.setInt(TITLE_IDS[i], "setPaintFlags",
                                isCompleted ? Paint.STRIKE_THRU_TEXT_FLAG | Paint.ANTI_ALIAS_FLAG
                                            : Paint.ANTI_ALIAS_FLAG);

                        if (time != null && !time.isEmpty() && !time.equals("null")) {
                            views.setViewVisibility(TIME_IDS[i], View.VISIBLE);
                            views.setTextViewText(TIME_IDS[i], time);
                        } else {
                            views.setViewVisibility(TIME_IDS[i], View.GONE);
                        }
                        views.setOnClickPendingIntent(ROW_IDS[i], openApp);
                    } catch (Exception e) {
                        views.setViewVisibility(ROW_IDS[i], View.GONE);
                    }
                } else {
                    views.setViewVisibility(ROW_IDS[i], View.GONE);
                }
            }

            int remaining = taskCount - MAX_TASKS;
            if (remaining > 0) {
                views.setViewVisibility(R.id.more_tasks_text, View.VISIBLE);
                views.setTextViewText(R.id.more_tasks_text, "+" + remaining + " more");
            } else {
                views.setViewVisibility(R.id.more_tasks_text, View.GONE);
            }
        }

        views.setOnClickPendingIntent(R.id.timeline_widget_root, openApp);
        manager.updateAppWidget(widgetId, views);
    }

    private static String formatDate(String dateStr) {
        if (dateStr == null || dateStr.isEmpty()) return "";
        try {
            java.text.SimpleDateFormat inFmt  = new java.text.SimpleDateFormat("yyyy-MM-dd", java.util.Locale.getDefault());
            java.text.SimpleDateFormat outFmt = new java.text.SimpleDateFormat("EEE, d MMM", java.util.Locale.getDefault());
            java.util.Date d = inFmt.parse(dateStr);
            return d != null ? outFmt.format(d) : dateStr;
        } catch (Exception e) { return dateStr; }
    }

    private static PendingIntent openAppIntent(Context context) {
        Intent intent = new Intent(context, MainActivity.class);
        intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP);
        return PendingIntent.getActivity(context, 1, intent,
                PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
    }
}
