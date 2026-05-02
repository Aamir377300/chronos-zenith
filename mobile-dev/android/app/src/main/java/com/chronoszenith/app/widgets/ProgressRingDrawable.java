package com.chronoszenith.app.widgets;

import android.graphics.Bitmap;
import android.graphics.Canvas;
import android.graphics.Color;
import android.graphics.Paint;
import android.graphics.RectF;

/**
 * Renders a circular progress ring as a Bitmap for use in RemoteViews.
 * Track: dark grey (#1F2937)  Progress: blue (#3B82F6)  Complete: green (#10B981)
 */
public class ProgressRingDrawable {

    private static final int COLOR_TRACK    = Color.parseColor("#1F2937");
    private static final int COLOR_PROGRESS = Color.parseColor("#3B82F6");
    private static final int COLOR_COMPLETE = Color.parseColor("#10B981");

    public static Bitmap create(int sizePx, float progress) {
        Bitmap bmp = Bitmap.createBitmap(sizePx, sizePx, Bitmap.Config.ARGB_8888);
        Canvas canvas = new Canvas(bmp);

        float strokeWidth = sizePx * 0.10f;
        float inset = strokeWidth / 2f;
        RectF oval = new RectF(inset, inset, sizePx - inset, sizePx - inset);

        Paint paint = new Paint(Paint.ANTI_ALIAS_FLAG);
        paint.setStyle(Paint.Style.STROKE);
        paint.setStrokeWidth(strokeWidth);
        paint.setStrokeCap(Paint.Cap.ROUND);

        // Track
        paint.setColor(COLOR_TRACK);
        canvas.drawOval(oval, paint);

        // Progress arc
        if (progress > 0f) {
            paint.setColor(progress >= 1.0f ? COLOR_COMPLETE : COLOR_PROGRESS);
            canvas.drawArc(oval, -90f, 360f * Math.min(progress, 1.0f), false, paint);
        }
        return bmp;
    }
}
