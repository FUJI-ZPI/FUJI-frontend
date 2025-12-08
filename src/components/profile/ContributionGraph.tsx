import React, { useMemo, useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';

// --- THEME CONSTANTS ---
const JP_THEME = {
  bg: '#FDFBF7',         
  ink: '#1F2937',        
  primary: '#4673aa',    
  accent: '#f74f73',     
  paperWhite: '#FFFFFF',
  textMuted: '#64748b',
  red100: '#FECDD3',
  red200: '#FDA4AF',
  red300: '#FB7185',
  red400: '#F43F5E',
  red500: '#E11D48',
};

export interface ContributionGraphProps {
  values: { [date: string]: number };
  selectedDate?: string | null;
  onDayPress: (date: string, count: number) => void;
  daysBack?: number;
}

// Helper: Format YYYY-MM-DD
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
  daysBack = 120, // Ilość dni wstecz
}) => {
  const [currentEndDate, setCurrentEndDate] = useState(new Date());

  useFocusEffect(
    useCallback(() => {
      // Ustawiamy "dzisiaj" na koniec dnia
      const now = new Date();
      now.setHours(23, 59, 59, 999);
      setCurrentEndDate(now);
    }, [])
  );

  const { weeks, months } = useMemo(() => {
    const monthsMap = new Map<number, string>();
    
    // 1. Obliczamy liczbę pełnych kolumn (tygodni) potrzebnych do wyświetlenia 'daysBack'
    // Zaokrąglamy w górę, aby mieć pełne kolumny po 7 kratek
    const weeksCount = Math.ceil(daysBack / 7);
    const totalGridCells = weeksCount * 7;

    // 2. Data początkowa: Cofamy się o (totalGridCells - 1) dni od currentEndDate.
    // Dzięki temu currentEndDate wyląduje dokładnie w ostatniej komórce (index 6 w ostatniej kolumnie).
    const startDate = new Date(currentEndDate);
    startDate.setDate(startDate.getDate() - (totalGridCells - 1));
    
    const generatedWeeks = [];
    let currentWeek = [];

    // 3. Generujemy dni
    for (let i = 0; i < totalGridCells; i++) {
        const d = new Date(startDate);
        d.setDate(d.getDate() + i);
        
        const dateStr = getLocalDateString(d);
        const count = values[dateStr] || 0;
        let level = 0;
        if (count > 0) level = count <= 2 ? 1 : count <= 5 ? 2 : count <= 10 ? 3 : 4;

        currentWeek.push({ date: dateStr, count, level, dayObj: d });

        // Jeśli tydzień ma 7 dni, zamykamy go i dodajemy do listy
        if (currentWeek.length === 7) {
            generatedWeeks.push(currentWeek);
            
            // Logika etykiet miesięcy (sprawdzamy pierwszy dzień kolumny)
            const firstDayOfWeek = currentWeek[0].dayObj;
            const monthName = firstDayOfWeek.toLocaleDateString('en-US', { month: 'short' });
            
            const prevMonthName = generatedWeeks.length > 1 
                ? generatedWeeks[generatedWeeks.length - 2][0].dayObj.toLocaleDateString('en-US', { month: 'short' }) 
                : '';
            
            // Wyświetlamy miesiąc tylko jeśli się zmienił względem poprzedniej kolumny
            if (monthName !== prevMonthName) {
                monthsMap.set(generatedWeeks.length - 1, monthName);
            }

            currentWeek = [];
        }
    }

    return { weeks: generatedWeeks, months: monthsMap };
  }, [values, daysBack, currentEndDate]);

  const getActivityColor = (level: number) => {
    switch (level) {
      case 0: return '#F1F5F9';
      case 1: return JP_THEME.red100;
      case 2: return JP_THEME.red200;
      case 3: return JP_THEME.red300;
      case 4: return JP_THEME.red500;
      default: return '#F1F5F9';
    }
  };

  const handlePrev = () => {
    const newDate = new Date(currentEndDate);
    newDate.setDate(newDate.getDate() - 90);
    setCurrentEndDate(newDate);
  };

  const handleNext = () => {
    const newDate = new Date(currentEndDate);
    newDate.setDate(newDate.getDate() + 90);
    const today = new Date(); 
    today.setHours(23, 59, 59, 999);
    
    if (newDate > today) setCurrentEndDate(today);
    else setCurrentEndDate(newDate);
  };

  const isLatest = useMemo(() => {
      const today = new Date(); today.setHours(0,0,0,0);
      const checkDate = new Date(currentEndDate); checkDate.setHours(0,0,0,0);
      return checkDate.getTime() >= today.getTime();
  }, [currentEndDate]);

  const startDateDisplay = weeks[0]?.[0]?.dayObj;
  // Ostatni dzień to zawsze ostatnia kratka ostatniego tygodnia
  const lastWeek = weeks[weeks.length - 1];
  const endDateDisplay = lastWeek?.[6]?.dayObj;

  // Stałe indeksy wierszy (0-6)
  const rowsIndices = [0, 1, 2, 3, 4, 5, 6];

  return (
    <View style={styles.cardContainer}>
      
      {/* HEADER */}
      <View style={styles.cardHeader}>
        <View style={styles.titleRow}>
           <View>
            <Text style={styles.titleMain}>Activity Log</Text>
           </View>
        </View>

        <View style={styles.controlsRow}>
            <TouchableOpacity onPress={handlePrev} style={styles.arrowBtn} hitSlop={10}>
               <Ionicons name="chevron-back" size={16} color={JP_THEME.textMuted} />
            </TouchableOpacity>
            
            <Text style={styles.dateRangeText}>
               {startDateDisplay ? `${startDateDisplay.toLocaleDateString('en-US', {month:'short', day:'numeric'})} - ${endDateDisplay?.toLocaleDateString('en-US', {month:'short', day:'numeric'})}` : ''}
            </Text>

            <TouchableOpacity onPress={handleNext} style={styles.arrowBtn} disabled={isLatest} hitSlop={10}>
               <Ionicons name="chevron-forward" size={16} color={isLatest ? "#E2E8F0" : JP_THEME.textMuted} />
            </TouchableOpacity>
        </View>
      </View>

      {/* CONTENT (GRID) */}
      <View style={styles.gridWrapper}>
            <View>
               {/* Month Labels Row */}
               <View style={styles.monthsRow}>
                  {weeks.map((_, index) => (
                      <View key={index} style={styles.monthLabelContainer}>
                          <Text style={[styles.monthLabelText, { opacity: months.has(index) ? 1 : 0 }]}>
                              {months.get(index) || ' '}
                          </Text>
                      </View>
                  ))}
               </View>

               {/* The Grid */}
               <View style={styles.gridContainer}>
                   {rowsIndices.map((rowIndex) => (
                       <View key={rowIndex} style={styles.dayRow}>                           
                           {weeks.map((week, weekIndex) => {
                               // Pobieramy dzień z danego tygodnia dla danego wiersza
                               const dayData = week[rowIndex];
                               
                               // Zabezpieczenie (choć przy pełnej siatce zawsze powinno być ok)
                               if (!dayData) return <View key={weekIndex} style={styles.emptyBox} />;
                               
                               const isSelected = selectedDate === dayData.date;

                               return (
                                   <TouchableOpacity
                                       key={`${weekIndex}-${rowIndex}`}
                                       onPress={() => onDayPress(dayData.date, dayData.count)}
                                       activeOpacity={0.7}
                                       style={[
                                           styles.box,
                                           { backgroundColor: getActivityColor(dayData.level) },
                                           isSelected && styles.selectedBox
                                       ]}
                                   />
                               );
                           })}
                       </View>
                   ))}
               </View>
            </View>

         {/* Legend */}
         <View style={styles.legendContainer}>
             <Text style={styles.legendLabel}>少</Text>
             {[0, 1, 2, 3, 4].map(l => (
                 <View key={l} style={[styles.legendBox, { backgroundColor: getActivityColor(l) }]} />
             ))}
             <Text style={styles.legendLabel}>多</Text>
         </View>
      </View>

    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: JP_THEME.paperWhite,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    marginBottom: 24,
    overflow: 'hidden',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  
  // Header
  cardHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 14,
      borderBottomWidth: 1,
      borderBottomColor: '#F8FAFC'
  },
  titleRow: { flexDirection: 'row', alignItems: 'center' },
  titleMain: { fontSize: 16, fontWeight: '700', color: JP_THEME.ink },
  
  controlsRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  arrowBtn: { padding: 4 },
  dateRangeText: { fontSize: 11, color: JP_THEME.textMuted, minWidth: 80, textAlign: 'center', fontWeight: '500' },

  // Grid Wrapper
  gridWrapper: {
      padding: 16,
      backgroundColor: '#FFF',
  },
  
  monthsRow: { 
      flexDirection: 'row', 
      marginLeft: 0, // Usunięto margines, bo nie ma etykiet dni po lewej
      marginBottom: 6, 
      gap: 4 
  },
  monthLabelContainer: {
      width: 14, 
      overflow: 'visible',
      alignItems: 'center',
  },
  monthLabelText: {
      fontSize: 9, 
      color: JP_THEME.textMuted, 
      fontWeight: '600',
      width: 40,
      textAlign: 'left',
      marginLeft: -2,
  },

  gridContainer: { flexDirection: 'column', gap: 4 }, 
  dayRow: { flexDirection: 'row', alignItems: 'center', gap: 4 }, 
  
  // --- BOX STYLING ---
  box: { 
      width: 14, 
      height: 14, 
      borderRadius: 3,
      justifyContent: 'center', 
      alignItems: 'center' 
  },
  emptyBox: { width: 14, height: 14 },
  selectedBox: { 
      borderWidth: 2, 
      borderColor: JP_THEME.ink,
      transform: [{scale: 1.15}],
      zIndex: 10
  },

  // Legend
  legendContainer: { 
      flexDirection: 'row', 
      justifyContent: 'flex-end', 
      alignItems: 'center', 
      gap: 4, 
      marginTop: 12, 
      paddingRight: 4 
  },
  legendLabel: { fontSize: 10, color: JP_THEME.textMuted, fontWeight: '600' },
  legendBox: { width: 10, height: 10, borderRadius: 2 },
});