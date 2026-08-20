import 'dart:convert';

import 'package:flutter/foundation.dart';
import 'package:flutter/services.dart';

import 'whu_calendar_data.dart';

const _assetPrefix = 'packages/whu_calendar/assets/data/';

class WhuCalendarRepository {
  WhuCalendarRepository(this._bundle);

  final AssetBundle _bundle;
  List<WhuCalendarYear>? _cachedYears;

  Future<List<WhuCalendarYear>> loadAllYears() async {
    if (_cachedYears != null) return _cachedYears!;

    final years = <WhuCalendarYear>[];
    try {
      final manifest = await AssetManifest.loadFromAssetBundle(_bundle);
      final calendarAssetPaths = manifest
          .listAssets()
          .where(
            (path) => path.startsWith(_assetPrefix) && path.endsWith('.json'),
          )
          .toList();

      for (final path in calendarAssetPaths) {
        try {
          final jsonString = await _bundle.loadString(path);
          final map = json.decode(jsonString) as Map<String, dynamic>;
          years.add(WhuCalendarYear.fromJson(map));
        } catch (e) {
          debugPrint('Failed to load calendar json $path: $e');
        }
      }
    } catch (e) {
      debugPrint('Failed to load calendar assets: $e');
    }

    years.sort((a, b) => b.name.compareTo(a.name));
    _cachedYears = years;
    return years;
  }

  Future<WhuCalendarSemester?> getSemesterForDate(DateTime date) async {
    final years = await loadAllYears();

    final allSemesters = years.expand((y) => y.semesters).toList()
      ..sort((a, b) => b.start.compareTo(a.start));

    final localDate = date.toLocal();
    for (final sem in allSemesters) {
      final endExclusive = sem.start.add(Duration(days: sem.weeks * 7));
      if (!localDate.isBefore(sem.start) && localDate.isBefore(endExclusive)) {
        return sem;
      }
    }

    return null;
  }

  Future<WhuCalendarSemester?> getSemester({
    required int year,
    required int semester,
  }) async {
    final years = await loadAllYears();
    final academicYear = '$year-${year + 1}';
    for (final calendarYear in years) {
      if (calendarYear.name != academicYear) continue;
      for (final item in calendarYear.semesters) {
        if (item.termNumber == semester) return item;
      }
      return null;
    }
    return null;
  }
}
