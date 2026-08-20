import 'package:flutter/services.dart';
import 'package:whu_calendar/whu_calendar.dart';

void main() async {
  final repo = WhuCalendarRepository(rootBundle);

  // Load all academic years (cached after first call)
  final years = await repo.loadAllYears();
  print('Available years: ${years.length}');

  // Find the current semester
  final current = await repo.getSemesterForDate(DateTime.now());
  print('Current semester: ${current?.name ?? "break"}');

  // Look up a specific semester
  final spring2025 = await repo.getSemester(year: 2024, semester: 2);
  print('2024-2025 term 2: ${spring2025?.name}');

  // Iterate events for a year
  final y2024 = years.firstWhere((y) => y.name == '2024-2025');
  for (final event in y2024.events) {
    print('${event.title}: ${event.start} → ${event.end}');
  }
}
