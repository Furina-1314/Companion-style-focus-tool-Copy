import { useGame } from "@/contexts/GameContext";
import { useMemo } from "react";
import { BarChart3, Clock, Zap, Trophy, TrendingUp, Flame, Award, CheckSquare } from "lucide-react";

export default function StatsPanel() {
  const { state } = useGame();

  const weekData = useMemo(() => {
    const days: { label: string; minutes: number; sessions: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toDateString();
      const daySessions = state.sessions.filter(
        (s) => new Date(s.startTime).toDateString() === dateStr
      );
      days.push({
        label: date.toLocaleDateString("zh-CN", { weekday: "short" }),
        minutes: daySessions.reduce((sum, s) => sum + s.duration, 0),
        sessions: daySessions.length,
      });
    }
    return days;
  }, [state.sessions]);

  const roundedWeekData = weekData.map((d) => ({ ...d, minutes: Math.round(d.minutes) }));
  const maxMinutes = Math.max(...roundedWeekData.map((d) => d.minutes), 1);
  const todayMinutes = roundedWeekData[roundedWeekData.length - 1]?.minutes || 0;
  const todaySessions = roundedWeekData[roundedWeekData.length - 1]?.sessions || 0;
  const weekTotalMinutes = roundedWeekData.reduce((sum, d) => sum + d.minutes, 0);
  const weekTotalSessions = roundedWeekData.reduce((sum, d) => sum + d.sessions, 0);
  const avgMinutes = Math.round(weekTotalMinutes / 7);
  const todayDateStr = new Date().toDateString();
  const todayCompletedTodos = state.memos.filter((m) => m.done && new Date(m.updatedAt).toDateString() === todayDateStr).length;
  const bestDay = roundedWeekData.reduce((best, current) => 
    current.minutes > best.minutes ? current : best
  , roundedWeekData[0]);

  const getLevel = (minutes: number) => {
    if (minutes < 100) return { name: "专注新手", icon: "🌱", color: "text-gray-500" };
    if (minutes < 500) return { name: "专注学徒", icon: "🌿", color: "text-emerald-500" };
    if (minutes < 1000) return { name: "专注达人", icon: "🌲", color: "text-blue-500" };
    if (minutes < 2000) return { name: "专注大师", icon: "⭐", color: "text-purple-500" };
    return { name: "专注传奇", icon: "👑", color: "text-amber-500" };
  };

  const roundedTotalFocusMinutes = Math.round(state.totalFocusMinutes);
  const level = getLevel(roundedTotalFocusMinutes);

  const heatmapDays = useMemo(() => {
    const result = [];
    const today = new Date();
    for (let i = 27; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const dayData = state.heatmapData.find(d => d.date === dateStr);
      result.push({
        date: dateStr,
        minutes: Math.round(dayData?.minutes || 0),
      });
    }
    return result;
  }, [state.heatmapData]);

  const getHeatmapColor = (minutes: number) => {
    if (minutes === 0) return "bg-gray-100";
    if (minutes < 30) return "bg-emerald-200";
    if (minutes < 60) return "bg-emerald-300";
    if (minutes < 120) return "bg-emerald-400";
    return "bg-emerald-500";
  };

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-lg h-full overflow-y-auto">
      {/* 头部 */}
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center">
          <BarChart3 size={16} className="text-white" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-gray-800">统计</h3>
          <p className="text-[10px] text-gray-500">
            本周 {weekTotalSessions} 个番茄 · {weekTotalMinutes} 分钟
          </p>
        </div>
      </div>

      {/* 等级 */}
      <div className="mb-4 p-3 rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-100">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{level.icon}</span>
          <div className="flex-1">
            <div className={`text-xs font-medium ${level.color}`}>{level.name}</div>
            <div className="text-[10px] text-gray-500">
              累计专注 {roundedTotalFocusMinutes} 分钟
            </div>
          </div>
          <div className="text-right">
            <div className="text-xl font-bold text-gray-800" style={{ fontFamily: "var(--font-mono)" }}>
              {state.sessionsCompleted}
            </div>
            <div className="text-[9px] text-gray-400">总番茄</div>
          </div>
        </div>
      </div>

      {/* 今日数据 */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="bg-blue-50 rounded-xl p-3 text-center">
          <Clock size={16} className="mx-auto mb-1 text-blue-500" />
          <div className="text-xl font-bold text-gray-800" style={{ fontFamily: "var(--font-mono)" }}>{todayMinutes}</div>
          <div className="text-[10px] text-gray-500">今日专注(分钟)</div>
        </div>
        <div className="bg-amber-50 rounded-xl p-3 text-center">
          <Zap size={16} className="mx-auto mb-1 text-amber-500" />
          <div className="text-xl font-bold text-gray-800" style={{ fontFamily: "var(--font-mono)" }}>{todaySessions}</div>
          <div className="text-[10px] text-gray-500">今日番茄数</div>
        </div>
        <div className="bg-emerald-50 rounded-xl p-3 text-center">
          <CheckSquare size={16} className="mx-auto mb-1 text-emerald-500" />
          <div className="text-xl font-bold text-gray-800" style={{ fontFamily: "var(--font-mono)" }}>{todayCompletedTodos}</div>
          <div className="text-[10px] text-gray-500">今日完成待办</div>
        </div>
      </div>

      {/* 本周趋势 */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5">
            <TrendingUp size={14} className="text-gray-400" />
            <span className="text-xs font-medium text-gray-700">本周趋势</span>
          </div>
          <span className="text-[10px] text-gray-400">日均 {avgMinutes} 分钟</span>
        </div>
        <div className="flex items-end gap-1.5 h-16 bg-gray-50 rounded-xl p-3">
          {roundedWeekData.map((day, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-1">
              <div className="w-full relative" style={{ height: "40px" }}>
                <div
                  className={`absolute bottom-0 w-full rounded-t transition-all duration-500
                    ${day.minutes > 0 ? "bg-blue-400" : "bg-gray-200"}`}
                  style={{ height: `${(day.minutes / maxMinutes) * 100}%` }}
                />
              </div>
              <span className={`text-[9px] ${day.minutes > 0 ? "text-blue-500 font-medium" : "text-gray-400"}`}>
                {day.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* 热力图 */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] text-gray-500">近28天专注热力图</span>
          <div className="flex items-center gap-1">
            <span className="text-[9px] text-gray-400">少</span>
            <div className="flex gap-0.5">
              <div className="w-2 h-2 rounded-sm bg-gray-100" />
              <div className="w-2 h-2 rounded-sm bg-emerald-200" />
              <div className="w-2 h-2 rounded-sm bg-emerald-300" />
              <div className="w-2 h-2 rounded-sm bg-emerald-400" />
              <div className="w-2 h-2 rounded-sm bg-emerald-500" />
            </div>
            <span className="text-[9px] text-gray-400">多</span>
          </div>
        </div>
        <div className="grid grid-cols-7 gap-1">
          {heatmapDays.map((day) => (
            <div
              key={day.date}
              className={`aspect-square rounded-sm ${getHeatmapColor(day.minutes)}`}
              data-tooltip={`${day.date}: ${day.minutes} 分钟`}
            />
          ))}
        </div>
      </div>

      {/* 详细统计 */}
      <div className="space-y-2">
        <div className="flex items-center justify-between py-2 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <Trophy size={14} className="text-amber-400" />
            <span className="text-xs text-gray-500">最佳一天</span>
          </div>
          <span className="text-xs font-medium text-gray-700">{bestDay.label} ({bestDay.minutes}分钟)</span>
        </div>
        <div className="flex items-center justify-between py-2 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <Flame size={14} className="text-orange-400" />
            <span className="text-xs text-gray-500">最长连续</span>
          </div>
          <span className="text-xs font-medium text-gray-700">{state.longestStreak} 天</span>
        </div>
        <div className="flex items-center justify-between py-2 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <Award size={14} className="text-purple-400" />
            <span className="text-xs text-gray-500">总时长</span>
          </div>
          <span className="text-xs font-medium text-gray-700">
            {Math.floor(state.totalFocusMinutes / 60)}小时{state.totalFocusMinutes % 60}分钟
          </span>
        </div>
      </div>
    </div>
  );
}
