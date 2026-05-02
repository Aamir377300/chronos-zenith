# Timeline Quick Reference Card

## 🎯 Key Changes at a Glance

### Web (Next.js)

#### Timeline.tsx
```typescript
// ✅ NEW: Smart grouping - only dates with tasks
const groupedTasks = useMemo(() => {
  const tasksByDate = new Map<string, Task[]>();
  tasks.forEach(task => {
    const existing = tasksByDate.get(task.date) || [];
    tasksByDate.set(task.date, [...existing, task]);
  });
  return Array.from(tasksByDate.entries())
    .map(([date, dateTasks]) => ({
      date,
      tasks: dateTasks,
      isToday: date === selectedDate,
    }))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}, [tasks, selectedDate]);

// ✅ NEW: Conditional headers
{isToday ? (
  <div className="sticky top-0 z-20 bg-gray-50 border-b border-gray-200">
    <h2 className="text-lg font-bold">Saturday, May 2</h2>
  </div>
) : (
  <div className="flex items-center gap-3">
    <div className="w-3 h-3 rounded-full bg-gray-300" />
    <h3 className="text-sm font-semibold text-gray-500">Mon, Apr 13</h3>
  </div>
)}

// ✅ NEW: Continuous timeline line
<div className="absolute left-[27px] top-0 bottom-0 w-0.5 bg-gray-200" />
```

#### TaskItem.tsx
```typescript
// ✅ CHANGED: Reduced spacing
className="py-2 gap-3"  // was: py-3 gap-4
className="w-8 h-8"     // was: w-9 h-9
```

---

### Mobile (React Native)

#### home.tsx
```typescript
// ✅ NEW: Smart grouping
const sections = React.useMemo(() => {
  const tasksByDate = new Map<string, Task[]>();
  tasks.forEach(task => {
    const existing = tasksByDate.get(task.date) || [];
    tasksByDate.set(task.date, [...existing, task]);
  });
  return Array.from(tasksByDate.entries())
    .map(([date, dateTasks]) => ({
      title: date,
      data: dateTasks,
      isToday: date === selectedDate,
    }))
    .sort((a, b) => new Date(b.title).getTime() - new Date(a.title).getTime());
}, [tasks, selectedDate]);

// ✅ NEW: Conditional headers
const renderSectionHeader = ({ section }) => {
  const isToday = section.title === selectedDate;
  if (isToday) {
    return (
      <View style={styles.todayHeader}>
        <Text style={styles.todayHeaderText}>Saturday, May 2</Text>
      </View>
    );
  }
  return (
    <View style={styles.pastDateHeader}>
      <View style={styles.pastDateDot} />
      <Text style={styles.pastDateText}>Mon, Apr 13</Text>
    </View>
  );
};

// ✅ CHANGED: Disabled sticky headers
stickySectionHeadersEnabled={false}  // was: true

// ✅ CHANGED: Minimal footer spacing
renderSectionFooter={() => <View style={{ height: 16 }} />}  // was: minHeight: 600
```

#### TimelineItem.tsx
```typescript
// ✅ CHANGED: Reduced spacing
paddingVertical: 8,  // was: 10
top: 40,            // was: 46
bottom: -8,         // was: -10
paddingTop: 6,      // was: 2
```

---

## 📋 Checklist for Implementation

### Before (Problems)
- ❌ All 29 dates rendered with min-height
- ❌ All headers sticky
- ❌ Empty sections with large gaps
- ❌ Disconnected timeline lines

### After (Solutions)
- ✅ Only dates with tasks rendered
- ✅ Only today's header sticky
- ✅ No empty sections
- ✅ Continuous timeline line

---

## 🎨 Style Reference

### Web Tailwind Classes

| Element | Classes |
|---------|---------|
| Today header | `sticky top-0 z-20 bg-gray-50 border-b border-gray-200 -mx-4 px-4 py-3 mb-4` |
| Today title | `text-lg font-bold text-gray-900` |
| Past date container | `flex items-center gap-3 mb-3 pl-2` |
| Past date dot | `w-3 h-3 rounded-full bg-gray-300 flex-shrink-0 z-10` |
| Past date label | `text-sm font-semibold text-gray-500` |
| Timeline line | `absolute left-[27px] top-0 bottom-0 w-0.5 bg-gray-200` |
| Date sections | `space-y-6` |
| Task item | `py-2 gap-3` |
| Checkbox | `w-8 h-8` |

### Mobile React Native Styles

```javascript
todayHeader: {
  backgroundColor: Colors.background,
  paddingVertical: 12,
  paddingHorizontal: 16,
  borderBottomWidth: 2,
  borderBottomColor: Colors.blue,
  marginBottom: 8,
}

todayHeaderText: {
  fontSize: 18,
  fontWeight: '700',
  color: Colors.textPrimary,
}

pastDateHeader: {
  flexDirection: 'row',
  alignItems: 'center',
  paddingVertical: 8,
  paddingHorizontal: 16,
  gap: 10,
  marginTop: 8,
}

pastDateDot: {
  width: 12,
  height: 12,
  borderRadius: 6,
  backgroundColor: Colors.textMuted,
}

pastDateText: {
  fontSize: 14,
  fontWeight: '600',
  color: Colors.textSecondary,
}
```

---

## 🔧 Common Patterns

### Grouping Tasks by Date
```typescript
const tasksByDate = new Map<string, Task[]>();
tasks.forEach(task => {
  const existing = tasksByDate.get(task.date) || [];
  tasksByDate.set(task.date, [...existing, task]);
});
```

### Sorting Dates Descending
```typescript
.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
```

### Conditional Header Rendering
```typescript
const isToday = date === selectedDate;
{isToday ? <ProminentHeader /> : <InlineLabel />}
```

### Smooth Scroll to Date
```typescript
// Web
const el = document.getElementById(`date-${selectedDate}`);
if (el) {
  const y = el.getBoundingClientRect().top + window.scrollY - 80;
  window.scrollTo({ top: y, behavior: 'smooth' });
}

// Mobile
sectionListRef.current?.scrollToLocation({
  sectionIndex: index,
  itemIndex: 0,
  animated: true,
  viewPosition: 0,
});
```

---

## 🚨 Important Notes

1. **Don't render empty dates** - Always filter before mapping
2. **Only today is sticky** - Past dates use inline labels
3. **Single timeline line** - At container level, not per section
4. **Minimal spacing** - Remove all min-height constraints
5. **Sort descending** - Latest dates first
6. **Memoize grouping** - Use useMemo for performance

---

## 📊 Performance Tips

1. Use `Map` for O(1) lookups when grouping
2. Memoize grouped data with `useMemo`
3. Only render dates that have tasks
4. Use proper dependency arrays
5. Avoid inline functions in render

---

## 🐛 Debugging

### Timeline not showing?
- Check if `tasks` array has data
- Verify grouping logic returns non-empty array
- Check console for errors

### Headers duplicating?
- Verify only `isToday` has `sticky` class (web)
- Check `stickySectionHeadersEnabled={false}` (mobile)

### Large gaps between dates?
- Remove `min-h-[80vh]` or `minHeight: 600`
- Check section footer height
- Verify empty dates aren't rendering

### Timeline line broken?
- Check absolute positioning
- Verify z-index values
- Ensure line is at container level

---

## ✅ Testing Commands

```bash
# Web
cd chronos-zenith/web-dev
npm run dev

# Mobile
cd chronos-zenith/mobile-dev
npm start

# Type checking
npm run type-check

# Build
npm run build
```

---

## 📚 Related Files

- `chronos-zenith/TIMELINE_FIXES.md` - Detailed implementation
- `chronos-zenith/TIMELINE_VISUAL_GUIDE.md` - Visual examples
- `chronos-zenith/TESTING_GUIDE.md` - Testing instructions

---

## 🎯 Success Criteria

✅ Only dates with tasks render  
✅ Today has prominent sticky header  
✅ Past dates have inline labels  
✅ Continuous timeline line  
✅ Minimal spacing  
✅ Smooth scrolling  
✅ No console errors  
✅ Responsive design  

**Result: Professional Taskito-style timeline! 🎉**
