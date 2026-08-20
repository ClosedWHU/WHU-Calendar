import 'package:flutter/foundation.dart';

@immutable
class WhuCalendarYear {
  final String name;
  final String uidPrefix;
  final List<WhuCalendarEvent> events;
  final List<WhuCalendarSemester> semesters;

  const WhuCalendarYear({
    required this.name,
    required this.uidPrefix,
    required this.events,
    required this.semesters,
  });

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

@immutable
class WhuCalendarEvent {
  final String id;
  final String title;
  final String? description;
  final DateTime start;
  final DateTime end;
  final String? busyStatus;

  const WhuCalendarEvent({
    required this.id,
    required this.title,
    this.description,
    required this.start,
    required this.end,
    this.busyStatus,
  });

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

@immutable
class WhuCalendarSemester {
  final String name;
  final String prefix;
  final DateTime start;
  final int weeks;

  const WhuCalendarSemester({
    required this.name,
    required this.prefix,
    required this.start,
    required this.weeks,
  });

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

  int get termNumber {
    final match = RegExp(r'term-(\d+)').firstMatch(prefix);
    if (match != null) {
      return int.tryParse(match.group(1) ?? '1') ?? 1;
    }
    return 1;
  }
}
