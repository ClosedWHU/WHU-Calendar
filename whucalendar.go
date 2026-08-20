package whucalendar

import (
	"embed"
	"encoding/json"
	"fmt"
	"sort"
	"time"
)

//go:embed data/*.json
var calendarFS embed.FS

type CalendarData struct {
	Name      string     `json:"name"`
	UIDPrefix string     `json:"uidPrefix"`
	Events    []Event    `json:"events"`
	Semesters []Semester `json:"semesters"`
}

type Event struct {
	ID          string `json:"id"`
	Title       string `json:"title"`
	Description string `json:"description,omitempty"`
	Start       [3]int `json:"start"`
	End         [3]int `json:"end"`
	BusyStatus  string `json:"busyStatus,omitempty"`
}

type Semester struct {
	Name   string `json:"name"`
	Prefix string `json:"prefix"`
	Start  [3]int `json:"start"`
	Weeks  int    `json:"weeks"`
}

func (s Semester) TermNumber() int {
	var n int
	if _, err := fmt.Sscanf(s.Prefix, "term-%d", &n); err == nil {
		return n
	}
	return 1
}

func (s Semester) StartDate() time.Time {
	return time.Date(s.Start[0], time.Month(s.Start[1]), s.Start[2], 0, 0, 0, 0, time.Local)
}

func (e Event) StartDate() time.Time {
	return time.Date(e.Start[0], time.Month(e.Start[1]), e.Start[2], 0, 0, 0, 0, time.Local)
}

func (e Event) EndDate() time.Time {
	return time.Date(e.End[0], time.Month(e.End[1]), e.End[2], 0, 0, 0, 0, time.Local)
}

var cachedYears []CalendarData

func LoadAllYears() ([]CalendarData, error) {
	if cachedYears != nil {
		return cachedYears, nil
	}

	entries, err := calendarFS.ReadDir("data")
	if err != nil {
		return nil, fmt.Errorf("read embedded data: %w", err)
	}

	var years []CalendarData
	for _, entry := range entries {
		if entry.IsDir() {
			continue
		}
		raw, err := calendarFS.ReadFile("data/" + entry.Name())
		if err != nil {
			return nil, fmt.Errorf("read %s: %w", entry.Name(), err)
		}
		var year CalendarData
		if err := json.Unmarshal(raw, &year); err != nil {
			return nil, fmt.Errorf("parse %s: %w", entry.Name(), err)
		}
		years = append(years, year)
	}

	sort.Slice(years, func(i, j int) bool {
		return years[i].Name > years[j].Name
	})

	cachedYears = years
	return years, nil
}

func GetSemesterForDate(date time.Time) (*Semester, error) {
	years, err := LoadAllYears()
	if err != nil {
		return nil, err
	}

	var all []Semester
	for _, y := range years {
		all = append(all, y.Semesters...)
	}
	sort.Slice(all, func(i, j int) bool {
		return all[i].StartDate().After(all[j].StartDate())
	})

	for _, sem := range all {
		end := sem.StartDate().AddDate(0, 0, sem.Weeks*7)
		if !date.Before(sem.StartDate()) && date.Before(end) {
			return &sem, nil
		}
	}
	return nil, nil
}

func GetSemester(year, semester int) (*Semester, error) {
	years, err := LoadAllYears()
	if err != nil {
		return nil, err
	}
	academicYear := fmt.Sprintf("%d-%d", year, year+1)
	for _, y := range years {
		if y.Name != academicYear {
			continue
		}
		for _, s := range y.Semesters {
			if s.TermNumber() == semester {
				return &s, nil
			}
		}
		return nil, nil
	}
	return nil, nil
}
