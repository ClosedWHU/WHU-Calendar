import 'package:flutter/foundation.dart';

/// One academic year of WHU calendar data (e.g. "2024-2025").
@immutable
class WhuCalendarYear {
  /// Academic year label, e.g. "2024-2025".
  final String name;

  /// Prefix used for generating unique event IDs, e.g. "whu-calendar-2024".
  final String uidPrefix;

  /// Calendar events (holidays, exams, registration, etc.).
  final List<WhuCalendarEvent> events;

  /// Semesters within this academic year.
  final List<WhuCalendarSemester> semesters;

  const WhuCalendarYear({
    required this.name,
    required this.uidPrefix,
    required this.events,
    required this.semesters,
  });

  /// Constructs a [WhuCalendarYear] from a JSON map.
  factory WhuCalendarYear.fromJson(Map<String, dynamic> json) {
    return WhuCalendarYear(
      name: json['name'] as String,
      uidPrefix: json['uidPrefix'] as String,
      events:
          (json['events'] as List<dynamic>?)
              ?.map((e) => WhuCalendarEvent.fromJson(e as Map<String, dynamic>))
              .toList() ??
          const [],
      semesters:
          (json['semesters'] as List<dynamic>?)
              ?.map(
                (e) => WhuCalendarSemester.fromJson(e as Map<String, dynamic>),
              )
              .toList() ??
          const [],
    );
  }
}

/// A single calendar event (holiday, exam week, registration, etc.).
@immutable
class WhuCalendarEvent {
  /// Stable identifier, e.g. "national-day-holiday".
  final String id;

  /// Human-readable title in Chinese.
  final String title;

  /// Optional description with additional details.
  final String? description;

  /// Start date of the event.
  final DateTime start;

  /// End date of the event (exclusive).
  final DateTime end;

  /// "FREE" or "BUSY".
  final String? busyStatus;

  const WhuCalendarEvent({
    required this.id,
    required this.title,
    this.description,
    required this.start,
    required this.end,
    this.busyStatus,
  });

  /// Constructs a [WhuCalendarEvent] from a JSON map.
  factory WhuCalendarEvent.fromJson(Map<String, dynamic> json) {
    final startArray = json['start'] as List<dynamic>;
    final endArray = json['end'] as List<dynamic>;
    return WhuCalendarEvent(
      id: json['id'] as String,
      title: json['title'] as String,
      description: json['description'] as String?,
      start: DateTime(
        startArray[0] as int,
        startArray[1] as int,
        startArray[2] as int,
      ),
      end: DateTime(endArray[0] as int, endArray[1] as int, endArray[2] as int),
      busyStatus: json['busyStatus'] as String?,
    );
  }
}

/// A semester within an academic year (e.g. "2024-2025第一学期").
@immutable
class WhuCalendarSemester {
  /// Full name, e.g. "2024-2025第一学期".
  final String name;

  /// Term prefix, e.g. "term-1", "term-2", "term-3".
  final String prefix;

  /// Start date of the semester (always a Sunday).
  final DateTime start;

  /// Number of teaching weeks.
  final int weeks;

  const WhuCalendarSemester({
    required this.name,
    required this.prefix,
    required this.start,
    required this.weeks,
  });

  /// Constructs a [WhuCalendarSemester] from a JSON map.
  factory WhuCalendarSemester.fromJson(Map<String, dynamic> json) {
    final startArray = json['start'] as List<dynamic>;
    return WhuCalendarSemester(
      name: json['name'] as String,
      prefix: json['prefix'] as String,
      start: DateTime(
        startArray[0] as int,
        startArray[1] as int,
        startArray[2] as int,
      ),
      weeks: json['weeks'] as int,
    );
  }

  /// Extracts the term number from [prefix], e.g. "term-1" → 1.
  int get termNumber {
    final match = RegExp(r'term-(\d+)').firstMatch(prefix);
    if (match != null) {
      return int.tryParse(match.group(1) ?? '1') ?? 1;
    }
    return 1;
  }
}
