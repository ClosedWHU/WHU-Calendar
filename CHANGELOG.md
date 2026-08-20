# Changelog

## 0.3.3

- Add dartdoc comments to all public API (pub.dev documentation score)
- Add `example/whu_calendar_example.dart`
- Add `CHANGELOG.md` (copied into package during publish)
- Add browser ESM bundle (`dist/browser.js`) with inlined data + query API
- Extract `CalendarEvent` and `Semester` as named type exports

## 0.3.2

- Fix pub.dev publish missing `assets/data/` (remove `.gitignore` exclusion during publish)
- Unify data architecture: only 1 committed copy of `data/*.json`
- Go module at repo root using `//go:embed`

## 0.3.1

- Add Go package support (`github.com/ClosedWHU/WHU-Calendar`)

## 0.3.0

- Initial Dart/Flutter package
- `WhuCalendarYear`, `WhuCalendarEvent`, `WhuCalendarSemester` model classes
- `WhuCalendarRepository` with `loadAllYears()`, `getSemesterForDate()`, `getSemester()`
- Embedded calendar data (2012–2027) as Flutter assets
