import { Feather } from "@expo/vector-icons";
import React, { useMemo, useState } from "react";
import {
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import {
  BarChart,
  LineChart,
  PieChart,
} from "react-native-chart-kit";

import { Task, useApp } from "@/contexts/AppContext";
import { useColors } from "@/hooks/useColors";

const STATUS_COLORS: Record<string, string> = {
  open: "#36A2EB",
  "in progress": "#FFCE56",
  done: "#4BC0C0",
};

const STATUS_LABEL: Record<string, string> = {
  open: "Open",
  "in progress": "In progress",
  done: "Done",
};

function getWeekKey(input: string | number) {
  const d = new Date(input);
  const year = d.getFullYear();
  const first = new Date(year, 0, 1);
  const diff = Math.floor(
    (d.getTime() - first.getTime()) / (24 * 60 * 60 * 1000),
  );
  const week = Math.ceil((diff + first.getDay() + 1) / 7);
  return `${year}-W${week}`;
}

export default function DashboardScreen() {
  const colors = useColors();
  const { tasks } = useApp();
  const [width, setWidth] = useState(
    Dimensions.get("window").width - 28,
  );

  const chartConfig = useMemo(
    () => ({
      backgroundGradientFrom: colors.card,
      backgroundGradientTo: colors.card,
      decimalPlaces: 0,
      color: (opacity = 1) => `rgba(54, 162, 235, ${opacity})`,
      labelColor: () => colors.chartLabel,
      barPercentage: 0.6,
      propsForBackgroundLines: {
        stroke: colors.chartGrid,
        strokeDasharray: "4 4",
      },
      propsForLabels: { fontSize: 11 },
      propsForDots: {
        r: "4",
        strokeWidth: "2",
        stroke: colors.card,
      },
      fillShadowGradientFromOpacity: 0.6,
      fillShadowGradientToOpacity: 0.05,
    }),
    [colors],
  );

  const stats = useMemo(() => {
    const total = tasks.length;
    const done = tasks.filter((t) => t.status === "done").length;
    const inProgress = tasks.filter((t) => t.status === "in progress").length;
    const open = tasks.filter((t) => t.status === "open").length;
    const today = new Date(new Date().toDateString());
    const overdue = tasks.filter(
      (t) => t.status !== "done" && t.dueDate && new Date(t.dueDate) < today,
    ).length;
    return { total, done, inProgress, open, overdue };
  }, [tasks]);

  const categoryData = useMemo(() => {
    const map: Record<string, number> = {};
    tasks.forEach((t: Task) => {
      const c = t.category || "Other";
      map[c] = (map[c] || 0) + 1;
    });
    const labels = Object.keys(map);
    const data = labels.map((l) => map[l]);
    return { labels, data };
  }, [tasks]);

  const statusPieData = useMemo(() => {
    const counts: Record<string, number> = {};
    tasks.forEach((t) => {
      counts[t.status] = (counts[t.status] || 0) + 1;
    });
    return Object.entries(counts).map(([k, v]) => ({
      name: STATUS_LABEL[k] ?? k,
      population: v,
      color: STATUS_COLORS[k] ?? "#888",
      legendFontColor: colors.chartLabel,
      legendFontSize: 12,
    }));
  }, [tasks, colors]);

  const weeklyData = useMemo(() => {
    const weekly: Record<string, number> = {};
    tasks.forEach((t) => {
      if (!t.dueDate || t.status.toLowerCase() !== "done") return;
      const key = getWeekKey(t.dueDate);
      weekly[key] = (weekly[key] || 0) + 1;
    });
    const labels = Object.keys(weekly).sort();
    const data = labels.map((l) => weekly[l]);
    return { labels, data };
  }, [tasks]);

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={styles.content}
      onLayout={(e) => setWidth(e.nativeEvent.layout.width - 28)}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.statsRow}>
        <StatCard
          label="Total"
          value={stats.total}
          icon="layers"
          color={colors.primary}
        />
        <StatCard
          label="Open"
          value={stats.open}
          icon="circle"
          color="#36A2EB"
        />
        <StatCard
          label="In progress"
          value={stats.inProgress}
          icon="clock"
          color="#FFCE56"
        />
        <StatCard
          label="Done"
          value={stats.done}
          icon="check-circle"
          color="#4BC0C0"
        />
      </View>

      {stats.overdue > 0 && (
        <View
          style={[
            styles.overdueBanner,
            {
              backgroundColor: colors.destructive + "1a",
              borderRadius: colors.radius,
              borderColor: colors.destructive + "55",
            },
          ]}
        >
          <Feather
            name="alert-triangle"
            size={16}
            color={colors.destructive}
          />
          <Text style={{ color: colors.destructive, fontWeight: "600" }}>
            {stats.overdue} overdue task{stats.overdue === 1 ? "" : "s"}
          </Text>
        </View>
      )}

      <ChartCard title="Tasks per category" colors={colors}>
        {categoryData.labels.length > 0 ? (
          <BarChart
            data={{
              labels: categoryData.labels,
              datasets: [{ data: categoryData.data }],
            }}
            width={width}
            height={220}
            chartConfig={chartConfig}
            fromZero
            showValuesOnTopOfBars
            yAxisLabel=""
            yAxisSuffix=""
            withInnerLines
            style={styles.chart}
          />
        ) : (
          <EmptyChart label="No tasks yet" colors={colors} />
        )}
      </ChartCard>

      <ChartCard title="Tasks by status" colors={colors}>
        {statusPieData.length > 0 ? (
          <PieChart
            data={statusPieData}
            width={width}
            height={220}
            accessor="population"
            backgroundColor="transparent"
            paddingLeft="8"
            chartConfig={chartConfig}
            absolute
          />
        ) : (
          <EmptyChart label="No tasks yet" colors={colors} />
        )}
      </ChartCard>

      <ChartCard title="Weekly productivity" colors={colors}>
        {weeklyData.labels.length > 0 ? (
          <LineChart
            data={{
              labels: weeklyData.labels,
              datasets: [
                {
                  data: weeklyData.data,
                  color: () => "#36A2EB",
                  strokeWidth: 2,
                },
              ],
              legend: ["Tasks completed"],
            }}
            width={width}
            height={220}
            chartConfig={chartConfig}
            bezier
            fromZero
            withInnerLines
            style={styles.chart}
          />
        ) : (
          <EmptyChart
            label="Complete tasks with a due date to see your weekly trend."
            colors={colors}
          />
        )}
      </ChartCard>

      <View style={{ height: 24 }} />
    </ScrollView>
  );
}

function StatCard({
  label,
  value,
  icon,
  color,
}: {
  label: string;
  value: number;
  icon: keyof typeof Feather.glyphMap;
  color: string;
}) {
  const colors = useColors();
  return (
    <View
      style={[
        styles.statCard,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
          borderRadius: colors.radius,
        },
      ]}
    >
      <View style={[styles.statIcon, { backgroundColor: color + "22" }]}>
        <Feather name={icon} size={14} color={color} />
      </View>
      <Text style={[styles.statValue, { color: colors.foreground }]}>
        {value}
      </Text>
      <Text style={{ color: colors.mutedForeground, fontSize: 11 }}>
        {label}
      </Text>
    </View>
  );
}

function ChartCard({
  title,
  children,
  colors,
}: {
  title: string;
  children: React.ReactNode;
  colors: ReturnType<typeof useColors>;
}) {
  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
          borderRadius: colors.radius,
        },
      ]}
    >
      <Text style={[styles.cardTitle, { color: colors.foreground }]}>
        {title}
      </Text>
      {children}
    </View>
  );
}

function EmptyChart({
  label,
  colors,
}: {
  label: string;
  colors: ReturnType<typeof useColors>;
}) {
  return (
    <View style={styles.emptyChart}>
      <Feather name="bar-chart-2" size={28} color={colors.mutedForeground} />
      <Text
        style={{
          color: colors.mutedForeground,
          textAlign: "center",
          fontSize: 13,
        }}
      >
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  content: { padding: 14, gap: 12 },
  statsRow: {
    flexDirection: "row",
    gap: 8,
  },
  statCard: {
    flex: 1,
    padding: 12,
    borderWidth: StyleSheet.hairlineWidth,
    gap: 6,
  },
  statIcon: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
  },
  statValue: { fontSize: 22, fontWeight: "700" },
  overdueBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderWidth: StyleSheet.hairlineWidth,
  },
  card: {
    padding: 14,
    borderWidth: StyleSheet.hairlineWidth,
    gap: 10,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: "700",
  },
  chart: {
    marginVertical: 4,
    borderRadius: 8,
  },
  emptyChart: {
    height: 180,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingHorizontal: 20,
  },
});
