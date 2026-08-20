package whucalendar

import (
	"testing"
	"time"
)

func TestLoadAllYears(t *testing.T) {
	years, err := LoadAllYears()
	if err != nil {
		t.Fatalf("LoadAllYears: %v", err)
	}
	if len(years) == 0 {
		t.Fatal("expected at least one year")
	}
	for i := 1; i < len(years); i++ {
		if years[i-1].Name < years[i].Name {
			t.Errorf("years not sorted descending: %s < %s", years[i-1].Name, years[i].Name)
		}
	}
}

func TestGetSemester(t *testing.T) {
	sem, err := GetSemester(2024, 1)
	if err != nil {
		t.Fatalf("GetSemester: %v", err)
	}
	if sem == nil {
		t.Fatal("expected semester for 2024 term 1")
	}
	if sem.Name != "2024-2025第一学期" {
		t.Errorf("name = %q, want %q", sem.Name, "2024-2025第一学期")
	}
	if sem.TermNumber() != 1 {
		t.Errorf("TermNumber = %d, want 1", sem.TermNumber())
	}

	sem3, err := GetSemester(2024, 3)
	if err != nil {
		t.Fatalf("GetSemester(2024,3): %v", err)
	}
	if sem3 == nil {
		t.Fatal("expected semester for 2024 term 3")
	}
	if sem3.Weeks != 4 {
		t.Errorf("Weeks = %d, want 4", sem3.Weeks)
	}

	missing, err := GetSemester(2018, 1)
	if err != nil {
		t.Fatalf("GetSemester(2018,1): %v", err)
	}
	if missing != nil {
		t.Errorf("expected nil for 2018, got %v", missing)
	}
}

func TestGetSemesterForDate(t *testing.T) {
	sem, err := GetSemesterForDate(time.Date(2024, 9, 9, 0, 0, 0, 0, time.Local))
	if err != nil {
		t.Fatalf("GetSemesterForDate: %v", err)
	}
	if sem == nil {
		t.Fatal("expected semester for 2024-09-09")
	}
	if sem.TermNumber() != 1 {
		t.Errorf("TermNumber = %d, want 1", sem.TermNumber())
	}

	none, err := GetSemesterForDate(time.Date(2012, 7, 1, 0, 0, 0, 0, time.Local))
	if err != nil {
		t.Fatalf("GetSemesterForDate: %v", err)
	}
	if none != nil {
		t.Errorf("expected nil for 2012-07-01, got %v", none)
	}
}
