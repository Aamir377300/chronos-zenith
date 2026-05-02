package com.chronoszenith.app.widgets;

import android.app.PendingIntent;
import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.view.View;
import android.widget.RemoteViews;

import com.chronoszenith.app.MainActivity;
import com.chronoszenith.app.R;

/**
 * Score Widget — Pill-based layout showing all-time task completion and rating.
 */
public class ScoreWidgetProvider extends AppWidgetProvider {

    public static final String ACTION_REFRESH = "com.chronoszenith.SCORE_WIDGET_REFRESH";

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
        int[] ids = manager.getAppWidgetIds(new ComponentName(context, ScoreWidgetProvider.class));
        for (int id : ids) updateWidget(context, manager, id);
    }

    private static void updateWidget(Context context, AppWidgetManager manager, int widgetId) {
        RemoteViews views = new RemoteViews(context.getPackageName(), R.layout.widget_score);

        int     completed    = WidgetDataStore.getAllTimeCompleted(context);
        int     total        = WidgetDataStore.getAllTimeAssigned(context);
        int     totalRating  = WidgetDataStore.getTotalRating(context);
        int     streak       = WidgetDataStore.getStreak(context);

        views.setTextViewText(R.id.completed_count, String.valueOf(completed));
        views.setTextViewText(R.id.total_count,     String.valueOf(total));
        views.setTextViewText(R.id.rating_text,     String.valueOf(totalRating));
        views.setTextViewText(R.id.streak_text,     String.valueOf(streak));

        long lastSync = WidgetDataStore.getLastSync(context);
        if (lastSync > 0) {
            java.text.SimpleDateFormat sdf = new java.text.SimpleDateFormat("HH:mm", java.util.Locale.getDefault());
            views.setTextViewText(R.id.last_updated, "Updated " + sdf.format(new java.util.Date(lastSync)));
        }

        views.setOnClickPendingIntent(R.id.score_widget_root, openAppIntent(context));
        manager.updateAppWidget(widgetId, views);
    }

    private static PendingIntent openAppIntent(Context context) {
        Intent intent = new Intent(context, MainActivity.class);
        intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP);
        return PendingIntent.getActivity(context, 2, intent,
                PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
    }
}
