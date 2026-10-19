package users

import (
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestRosterKeepsAnAdmin(t *testing.T) {
	testCases := []struct {
		name   string
		change func(r *Roster) error
	}{
		{name: "demote", change: func(r *Roster) error { return r.Assign(1, Publisher) }},
		{name: "remove", change: func(r *Roster) error { return r.Remove(1) }},
	}

	for _, testCase := range testCases {
		t.Run(testCase.name+" the last admin", func(t *testing.T) {
			r := NewRoster(1)
			assert.ErrorIs(t, testCase.change(r), ErrLastAdmin)
			assert.Equal(t, []int64{1}, r.Admins())
			assert.Empty(t, r.PullEvents())
		})

		t.Run(testCase.name+" one of two admins", func(t *testing.T) {
			r := NewRoster(1, 2)
			require.NoError(t, testCase.change(r))
			assert.Equal(t, []int64{2}, r.Admins())
		})
	}
}

func TestRosterRecordsChanges(t *testing.T) {
	r := NewRoster(1)

	require.NoError(t, r.Assign(2, Admin))
	require.NoError(t, r.Assign(3, Publisher))
	require.NoError(t, r.Assign(1, Publisher))
	require.NoError(t, r.Remove(3))

	assert.Equal(t, []int64{2}, r.Admins())
	assert.Equal(t, []RosterEvent{
		RoleAssigned{UserID: 2, Role: Admin},
		RoleAssigned{UserID: 3, Role: Publisher},
		RoleAssigned{UserID: 1, Role: Publisher},
		UserRemoved{UserID: 3},
	}, r.PullEvents())
	assert.Empty(t, r.PullEvents())
}
