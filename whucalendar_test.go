package whucalendar

import (
	"cmp"
	"slices"
	"testing"
	"time"

	"github.com/stretchr/testify/require"
)

func TestLoadAllYears(t *testing.T) {
	years, err := LoadAllYears()
	require.NoError(t, err)
	require.NotEmpty(t, years)
	require.True(t, slices.IsSortedFunc(years, func(a, b CalendarData) int {
		return cmp.Compare(b.Name, a.Name)
	}))
}

func TestGetSemester(t *testing.T) {
	sem, err := GetSemester(2024, 1)
	require.NoError(t, err)
	require.NotNil(t, sem)
	require.Equal(t, "2024-2025第一学期", sem.Name)
	require.Equal(t, 1, sem.TermNumber())

	sem3, err := GetSemester(2024, 3)
	require.NoError(t, err)
	require.NotNil(t, sem3)
	require.Equal(t, 4, sem3.Weeks)

	missing, err := GetSemester(2018, 1)
	require.NoError(t, err)
	require.Nil(t, missing)
}

func TestGetSemesterForDate(t *testing.T) {
	sem, err := GetSemesterForDate(time.Date(2024, 9, 9, 0, 0, 0, 0, time.Local))
	require.NoError(t, err)
	require.NotNil(t, sem)
	require.Equal(t, 1, sem.TermNumber())

	none, err := GetSemesterForDate(time.Date(2012, 7, 1, 0, 0, 0, 0, time.Local))
	require.NoError(t, err)
	require.Nil(t, none)
}
