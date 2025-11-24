import React, { useMemo, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native'; 

export interface ContributionGraphProps {
  values: { [date: string]: number };
  selectedDate?: string | null;
  onDayPress: (date: string, count: number) => void;
  daysBack?: number; 
}

// Helper do formatowania daty lokalnej YYYY-MM-DD (zamiast toISOString)
const getLocalDateString = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const ContributionGraph: React.FC<ContributionGraphProps> = ({
  values,
  selectedDate,
  onDayPress,
  daysBack = 111,
}) => {
  
  const [currentEndDate, setCurrentEndDate] = useState(new Date());

  useFocusEffect(
    useCallback(() => {
      setCurrentEndDate(new Date());
    }, [])
  );

  const { weeks, months, stride } = useMemo(() => {
    const weeksData = [];
    const monthsData = [];
    
    let currentWeek = [];
    const anchorDate = new Date(currentEndDate);
    const STRIDE = 18; 

    for (let i = daysBack; i >= 0; i--) {
      const d = new Date(anchorDate);
      d.setDate(d.getDate() - i);
      
      // POPRAWKA 1: Używamy lokalnej daty zamiast ISO (które przesuwa strefę czasową)
      const dateStr = getLocalDateString(d);
      
      const count = values[dateStr] || 0;
      
      let level = 0;
      if (count > 0) level = count <= 2 ? 1 : count <= 5 ? 2 : count <= 10 ? 3 : 4;

      currentWeek.push({ date: dateStr, count, level, dayOfMonth: d.getDate() });

      if (currentWeek.length === 7 || i === 0) {
        weeksData.push(currentWeek);
        
        const firstDayOfWeek = currentWeek[0];
        if (firstDayOfWeek.dayOfMonth <= 7) {
            const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
            const dateObj = new Date(firstDayOfWeek.date);
            const monthName = MONTHS[dateObj.getMonth()];
            monthsData.push({ index: weeksData.length - 1, label: monthName });
        }
        
        currentWeek = [];
      }
    }
    return { weeks: weeksData, months: monthsData, stride: STRIDE };
  }, [values, daysBack, currentEndDate]);

  const getBackgroundColor = (level: number) => {
    const palette = ['#ebedf0', '#9be9a8', '#40c463', '#30a14e', '#216e39'];
    return palette[level] || palette[0];
  };

  const handlePrev = () => {
    const newDate = new Date(currentEndDate);
    newDate.setDate(newDate.getDate() - daysBack);
    setCurrentEndDate(newDate);
  };

  const handleNext = () => {
    const newDate = new Date(currentEndDate);
    newDate.setDate(newDate.getDate() + daysBack);
    
    // POPRAWKA 2: Nie zerujemy godzin (setHours(0,0,0,0)), 
    // bo to powodowało cofnięcie daty przy konwersji.
    const today = new Date(); 

    if (newDate > today) {
        setCurrentEndDate(today);
    } else {
        setCurrentEndDate(newDate);
    }
  };

  const isLatest = useMemo(() => {
      const today = new Date();
      // Tutaj zerowanie jest OK, bo służy tylko do porównania logicznego, a nie generowania daty
      today.setHours(0,0,0,0);
      const checkDate = new Date(currentEndDate);
      checkDate.setHours(0,0,0,0);
      
      return checkDate.getTime() >= today.getTime();
  }, [currentEndDate]);

  const currentYear = currentEndDate.getFullYear();

  return (
    <View style={styles.container}>
      {/* Nagłówek */}
      <View style={styles.headerRow}>
         <View style={styles.titleContainer}>
             <TouchableOpacity onPress={handlePrev} style={styles.arrowBtn} hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
                <Ionicons name="chevron-back" size={20} color="#64748b" />
             </TouchableOpacity>
             
             <View style={styles.titleTextContainer}>
                <Text style={styles.title}>Activity Log</Text>
                <Text style={styles.yearText}>{currentYear}</Text>
             </View>
             
             <TouchableOpacity 
                onPress={handleNext} 
                style={styles.arrowBtn} 
                disabled={isLatest}
                hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}
             >
                <Ionicons 
                    name="chevron-forward" 
                    size={20} 
                    color={isLatest ? "#e2e8f0" : "#64748b"} 
                />
             </TouchableOpacity>
         </View>

         <View style={styles.legend}>
            <Text style={styles.legendText}>Less</Text>
            {[0, 2, 4].map(l => (
                <View key={l} style={[styles.legendBox, { backgroundColor: getBackgroundColor(l)}]} />
            ))}
            <Text style={styles.legendText}>More</Text>
         </View>
      </View>

      {/* Wykres */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false} 
        contentContainerStyle={styles.scrollContent} 
      >
        <View>
            <View style={styles.monthsRow}>
            {months.map((m, i) => (
                <Text key={i} style={[styles.monthLabel, { left: m.index * 18 }]}>
                    {m.label}
                </Text>
            ))}
            </View>

            <View style={styles.grid}>
            {weeks.map((week, wIndex) => (
                <View key={wIndex} style={styles.column}>
                {week.map((day: any) => {
                    const isSelected = selectedDate === day.date;
                    return (
                    <TouchableOpacity
                        key={day.date}
                        style={[
                            styles.box,
                            { backgroundColor: getBackgroundColor(day.level) },
                            isSelected && styles.selectedBox 
                        ]}
                        activeOpacity={0.6}
                        onPress={() => onDayPress(day.date, day.count)}
                    />
                    );
                })}
                </View>
            ))}
            </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    paddingVertical: 20,
    paddingHorizontal: 16,
    borderRadius: 24,
    marginBottom: 24,
    shadowColor: "#000", 
    shadowOffset: { width: 0, height: 4 }, 
    shadowOpacity: 0.06, 
    shadowRadius: 12, 
    elevation: 3,
  },
  headerRow: { 
      flexDirection: 'row', 
      justifyContent: 'space-between', 
      alignItems: 'center', 
      marginBottom: 20, 
      paddingHorizontal: 4 
  },
  titleContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12, 
      backgroundColor: '#f8fafc', 
      paddingVertical: 6,
      paddingHorizontal: 10,
      borderRadius: 12,
  },
  titleTextContainer: {
      flexDirection: 'row',
      alignItems: 'baseline', 
      gap: 6
  },
  title: { 
      fontSize: 14, 
      fontWeight: '700', 
      color: '#334155' 
  },
  yearText: {
      fontSize: 12,
      fontWeight: '600',
      color: '#94a3b8' 
  },
  arrowBtn: {
      padding: 2,
  },
  
  scrollContent: {
      flexGrow: 1,
      justifyContent: 'center',
      paddingHorizontal: 10, 
  },

  monthsRow: { 
      flexDirection: 'row', 
      height: 20, 
      position: 'relative', 
      marginBottom: 6 
  },
  monthLabel: { 
      position: 'absolute', 
      fontSize: 11, 
      color: '#94a3b8', 
      fontWeight: '600' 
  },
  grid: { 
      flexDirection: 'row', 
      gap: 4 
  },
  column: { 
      flexDirection: 'column', 
      gap: 4 
  },
  box: { 
      width: 14, 
      height: 14, 
      borderRadius: 4 
  },
  selectedBox: { 
    borderColor: '#334155', 
    borderWidth: 2, 
    zIndex: 10
  },
  legend: { 
      flexDirection: 'row', 
      alignItems: 'center', 
      gap: 4 
  },
  legendBox: { 
      width: 10, 
      height: 10, 
      borderRadius: 3 
  },
  legendText: { 
      fontSize: 10, 
      color: '#94a3b8',
      fontWeight: '500'
  }
});